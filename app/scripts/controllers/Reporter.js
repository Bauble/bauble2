'use strict';

angular.module('BaubleApp')

    .controller('ReporterCtrl', function ($scope, $dialog, Search, Resource, Report) {

        // get the list of saved reports
        Report.query()
            .success(function(data, status, headers, config) {
                $scope.reports = data;
            })
            .error(function(data, status, headers, config) {
                // do something
            });

        $scope.showReportSelector = true;
        $scope.showQueryBuilder = false;

        $scope.reportTypes = [
            { name: "Current search", type: 'current' },
            { name: "New Search", type: 'new' },
            { name: "Table", type: 'table' }
        ];
        $scope.reportType = $scope.reportTypes[0];

        $scope.operators =
            { '=':  '=',
              '!=': '!=',
              '<': '<',
              '<=': '<=',
              '>': '>',
              '>=': '>=',
              'like': 'like'
            };

        $scope.domains =
            [
                { label: 'Family', resource: '/family', sort: 0 },
                { label: 'Genus', resource: '/genus', sort: 1 },
                { label: 'Taxon', resource: '/taxon',sort: 2 },
                { label: 'Accession', resource: '/accession',sort: 3 },
                { label: 'Plant', resource: '/plant',sort: 4 },
                { label: 'Location', resource: '/location', sort: 5 }
            ];

        $scope.filters = [{}];
        $scope.tableColumns = [new TableColumn('str')]; // the list of column objects
        $scope.tableData = [];

        $scope.$watch(function() { return $scope.resource; }, function(newValue, oldValue) {
            if(oldValue !== newValue && oldValue !== undefined) {
                alert("Warn the user that the domain is changing!");
            }
            if(newValue === null || typeof newValue === 'undefined') {
                return;
            }

            $scope.tableColumns = [new TableColumn('str', "Name", true)];
            Resource($scope.resource).get_schema(true)
                .success(function(data, status, headers, config) {
                    angular.forEach(data.columns, function(index, value) {
                        if(value !== "id" && value.substring(value.length-3) !== "_id")
                            $scope.tableColumns.push(new TableColumn(value));
                    });

                })
                .error(function(data, status, headers, config) {
                    // do something
                })
        });

        // object to represent the report table columns
        function TableColumn(name, header, visible){
            this.name = name,
            this.header = header || this.name,
            this.width = undefined;
            this.visible = visible || false;

            // if header is undefined set to name
            //this.header = typeof this.header === "undefined" ? this.name : this.header;
        }

        $scope.$on('schema-column-selected', function(event, element, selected) {
            // ignore the selected event unless this is part of a filter
            if(!element.hasClass('filter-schema-menu')) {
                return;
            }

            var menus = element.parents('.filters-box').find('.filter-schema-menu'),
                index = menus.index(element);
            $scope.filters[index].column = selected;
        });


        $scope.addFilterField = function() {
            // add another row to the list of filters
            $scope.filters.push({ boolOp: "and" });
        };

        $scope.validateQuery = function() {
            var valid = $scope.filters.length > 0 ? true : false;
            $.each($scope.filters, function(index, filter) {
                if(!filter.column || !filter.operator || !filter.value) {
                    valid = false;
                    return false;
                }
            });
            return valid ? "" : "disabled";
        };

        $scope.saveReport = function() {
            // TODO: ** this method is really waiting for angular-bootstrap to
            // finish their transition to bootstrap3
            var opts = {
                template: '<div>Enter a name for this report definition:</div>'
            };
            var d = $dialog.dialog(opts);
            d.open().then(function(result) {
                console.log('dialog closed');
            });
        };

        $scope.refreshTable = function() {
            // update the table data based on the domain, filters and report fields
            //$resource($scope.resource).
            // TODO: build up the query based on the filter fields

            var q = $scope.resource.substring(1);
            if($scope.filters.length === 0) {
                q += '=*';
            }
            else {
                q += ' where ';
                angular.forEach($scope.filters, function(filter, index) {
                    if(index > 0) {
                        q += ' ' + filter.boolOp + ' ';
                    }
                    q += [filter.column, filter.operator, filter.value].join(' ');
                });
            }

            Search.query(q)
                .success(function(data, status, headers, config) {
                    $scope.tableData = data.results;
                    console.log('$scope.tableData: ', $scope.tableData);
                    $scope.message = (!$scope.tableData || $scope.tableData.length === 0) ? "No results." : "";
                })
                .error(function(data, status, headers, config) {
                    // do something
                    $scope.message = "Error: Could not get results from database";
                });
        };

        $scope.showColButtons = function(event, index)  {
            console.log("hover: ", index);
            $scope.colHover = index;
        };
    });
