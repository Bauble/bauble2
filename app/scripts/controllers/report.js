'use strict';

// TODO: add map for column names to display names or headers

angular.module('BaubleApp')
    .controller('ReportCtrl', ['$scope', '$location', '$window', '$stateParams', 'Alert', 'Search', 'Resource', 'Report',
    function ($scope, $location, $window, $stateParams, Alert, Search, Resource, Report) {

        // object to represent the report table columns
        function TableColumn(name, header, visible){
            this.name = name;
            this.header = header || this.name;
            this.width = null;
            this.visible = visible || false;

            // if header is undefined set to name
            //this.header = typeof this.header === "undefined" ? this.name : this.heade;
        }

        $scope.model = {
            //resource: null,
            refreshButtonText: 'Create report',
            reports: null,
            report: null,
            showQueryBuilder: true,
            showReportSelector: false,
            tableData: null,
            //filters: [{operator: '='}],
            tableColumns: [new TableColumn('str', "Name", true)] // the list of column objects
        };

        // *** FOR TESTING
        // $scope.model.resource = '/family';
        // $scope.model.filters[0] =  { column: 'family', operator: '=', value: 'Orchidaceae' };
        // $scope.model.showReportSelector = false;
        // $scope.model.showQueryBuilder = false;
        // $scope.model.tableData = [{
        //     id: 1,
        //     str: "Orchidiaceae"
        // },{
        //     id: 2,
        //     str: "Fabaceae"
        // }];

        // get the list of saved reports

        console.log('$stateParams: ', $stateParams);
        if($stateParams.id) {
            Report.get($stateParams)
                .success(function(data, status, headers, config) {
                    $scope.model.report = data;
                    $scope.model.showQueryBuilder = true;
                    $scope.model.showReportSelector = false;
                    $scope.model.refreshButtonText = 'Refresh';
                    console.log('query: ', $scope.model.report.query);
                    var parsed = parseQuery($scope.model.report.query);
                    console.log('parsed: ', parsed);
                    $scope.model.report = _.extend($scope.model.report, parsed);
                    //$scope.refreshTable();
                })
                .error(function(data, status, headers, config) {
                    console.log('** Error: Could not load report');
                    $location('/report');
                });
        } else {
            $scope.showReportSelector = true;
            $scope.showQueryBuilder = false;
            Report.list()
                .success(function(data, status, headers, config) {
                    $scope.model.reports = data;
                    // set current report to a new empty new repor
                    $scope.newReport();
                    $scope.model.showQueryBuilder = ($scope.model.reports.length === 0);
                    $scope.model.showReportSelector = ($scope.model.reports.length > 0);
                })
                .error(function(data, status, headers, config) {
                    // do something
                    /* jshint -W015 */
                });
        }

        $scope.operators =
            { '=':  '=',
              '!=': '!=',
              '<': '<',
              '<=': '<=',
              '>': '>',
              '>=': '>=',
              'like': 'like'
            };

        $scope.domains = [
            { label: 'Family', resource: '/family', result: 'families', sort: 0 },
            { label: 'Genus', resource: '/genus', result: 'genera', sort: 1 },
            { label: 'Taxon', resource: '/taxon', result: 'taxa', sort: 2 },
            { label: 'Accession', resource: '/accession', result: 'accessions',
              sort: 3 },
            { label: 'Plant', resource: '/plant', result: 'plants', sort: 4 },
            { label: 'Location', resource: '/location', result: 'location', sort: 5 }
        ];


        $scope.$watch('model.report.resource', function(newValue, oldValue) {
            console.log('oldValue: ', oldValue);
            console.log('newValue: ', newValue);

            if(oldValue !== newValue && oldValue !== null && !_.isUndefined(oldValue)) {
                alert("Warn the user that the domain is changing!");
            }
            if(newValue === null || typeof newValue === 'undefined') {
                return;
            }

            $scope.model.tableColumns = [new TableColumn('str', "Name", true)];

            // getting scalars only b/c we're using this for column headers,
            // the schema menus are handled by the schema menu directive
            Resource($scope.model.report.resource).getSchema(true)
                .success(function(data, status, headers, config) {
                    console.log('data: ', data);
                    angular.forEach(data.columns, function(index, value) {
                        $scope.model.tableColumns.push(new TableColumn(value));
                    });

                })
                .error(function(data, status, headers, config) {
                    var defaultMessage = "** Error: Could not get schema for resource.";
                    Alert.onErrorResponse(data, defaultMessage);
                });
        });

        $scope.$watch('model.report', function(report){
            console.log('report: ', report);
            if(!report || !report.id) {
                return;
            }

            $location.path('/report/' + report.id);
        });


        //
        //  Set the column for the filter when selected from the schema menu.
        //
        $scope.onFilterSchemaSelect = function($event, column, selected, $index) {
            $scope.model.report.filters[$index].column = selected;
        };


        $scope.addFilterField = function() {
            // add another row to the list of filters
            if(!$scope.model.report.filters) {
                $scope.model.report.filters = [];
            }
            $scope.model.report.filters.push({ boolOp: "and" , operator: '='});
        };

        $scope.validateQuery = function() {
            try {
                var valid = $scope.model.report.filters.length > 0 ? true : false;
                $.each($scope.model.report.filters, function(index, filter) {
                    if(!filter.column || !filter.operator || !filter.value) {
                        valid = false;
                        return false;
                    }
                });
                return valid ? "" : "disabled";
            } catch(exc) {
                //console.log('exc: ', exc);
                return false;
            }
        };

        $scope.saveReport = function() {
            print("saving report: ", $scope.model.report.name);

            // TODO: get the report name if it hasn't already been set
            if(!$scope.model.report.name) {

            }

            // TOD: post saved report....where does the report name come from,
            // don't use a modal so it works on touch devices
            Report.save($scope.model.report)
                .success(function(data, status, headers, config) {
                    Alert.add('Report saved.');
                })
                .error(function(data, status, headers, config) {
                    // TODO: if 409 then there's already a report with this name
                    var defaultMessage = "** Error: Could not save the report.";
                    Alert.onErrorResponse(data, defaultMessage);
                });
        };


        //
        // build a query string from a model
        //
        function buildQueryString(domain, filters) {
            var q = domain;
            if(filters.length === 0) {
                q += '=*';
            }
            else {
                q += ' where ';
                angular.forEach(filters, function(filter, index) {
                    if(index > 0) {
                        q += ' ' + filter.boolOp + ' ';
                    }
                    q += [filter.column, filter.operator, filter.value].join(' ');
                });
            }
            return q;
        }

        //
        // build a filters from a query string
        //
        function parseQuery(query) {

            // TODO: right now we only support query expressions and a pretty
            // limited subset of them

            var parsed = {
                resource: '',
                filters: []
            };

            var words = query.split(' ');
            if(words[1] === 'where') {
                parsed.resource = '/' + words[0];
            } else {
                console.log("** Error: Could not parse: " + query);
                return null;
            }

            words = _.rest(words, 2);
            var indexBase = 0;
            while(words.length > 0) {
                parsed.filters.push({
                    boolOp: indexBase === 1 ? words[0] : null,
                    column: words[indexBase],
                    operator: words[indexBase + 1],
                    value: words[indexBase + 2]
                });
                words = _.rest(words, indexBase + 3);
                indexBase = 1;  // from here on out we're going to have a boolOp
            }

            return parsed;
        }

        $scope.refreshTable = function() {
            // update the table data based on the domain, filters and report fields
            //$resource($scope.model.resource).
            // TODO: build up the query based on the filter fields
            console.log('$scope.model.report: ', $scope.model.report);
            console.log('$scope.model.report.resource: ', $scope.model.report.resource);
            if(!$scope.model.report || !$scope.model.report.resource) {
                console.log("Create new report...");
                $scope.newReport();
                return;
            }

            var q = buildQueryString($scope.model.report.resource.substring(1),
                                     $scope.model.report.filters);

            Search.query(q)
                .success(function(data, status, headers, config) {
                    var resultProp = _.find($scope.domains,
                                            {resource: $scope.model.report.resource}).result;
                    $scope.model.tableData = data[resultProp];
                    $scope.model.message = (!$scope.model.tableData || $scope.model.tableData.length === 0) ? "No results." : "";
                })
                .error(function(data, status, headers, config) {
                    // do something
                    /* jshint -W015 */
                    $scope.model.message = "Error: Could not get results from database";
                });
        };

        $scope.showColButtons = function(event, index)  {
            console.log("hover: ", index);
            $scope.colHover = index;
        };


        $scope.download = function(){
            // var row;
            // var tableData = $scope.model.tableData;
            // var columns = _.chain($scope.model.tableColumns)
            //     .filter('visible')
            //     .pluck('name')
            //     .value();
            // var csv = [columns.join(',')];
            // console.log('csv: ', csv);
            // for(var i=0; i<tableData.length; i++) {
            //     row = [];
            //     for(var j=0; j<columns.length; j++) {
            //         console.log('csv: ', csv);
            //         row.push('"' + tableData[i][columns[j]] + '"');
            //     }
            //     csv.push(row.join(','));
            // }

            // **********
            //
            // TODO: to download a report we first have to save it to the
            // server...for unsaved reports or new reports we could generate
            // temporary reports with some random name and an automatic
            // expiration date...or they just expire once they're
            // downloaded....  even for saved reports we could ask the user if
            // they want to save this report before downloading and if they say
            // no we just go ahead and create a temporary report
            //
            // we could then open that link in a hidden iframe to initiate the
            // download....this is probably the best way anyways b/c it will
            // allows us in the future to add formatters without changing
            // anything
            //
            // http://stackoverflow.com/a/8394118/240316
            // **********

            //var csvString = csv.join('\n');
            Report.download(csvString, 'text/csv')
                .success(function(data, status, headers, config) {
                    console.log('data: ', data);
                })
                .error(function(data, status, headers, config) {
                    console.log('error data: ', data);
                });

            // TODO: this needs to be tested in IE
            // http://stackoverflow.com/questions/17836273/export-javascript-data-to-csv-file-without-server-interaction

            // download the CSV
            // var csvString = csv.join('\n');
            // var dataUrl = 'data:text/csv,' + encodeURIComponent(csvString);
            // window.open(dataUrl);

            // the name doesn't set the filename on most browsers but we use it here anyways
            // var name = $scope.model.report.name.replace(' ', '_') + ".csv";
            // window.open(dataUrl, name);  //
        };

        //
        //  Delete a save report or clear an unsaved report
        //
        $scope.deleteReport = function() {
        };

        $scope.newReport = function() {
            $scope.model.showReportSelector = false;
            $scope.model.showQueryBuilder = true;
            $scope.model.report = {
                name: "New Report",
                resource: null,
                filters: [{operator: '='}],
                //query: null,
                settings: {}
            };
        };
    }]);
