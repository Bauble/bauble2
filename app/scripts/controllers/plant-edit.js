'use strict';

var acc_type_values ={
    'Plant': 'Plant',
    'Seed': 'Seed/Spore',
    'Vegetative': 'Vegetative Part',
    'Tissue': 'Tissue Culture',
    'Other': 'Other',
    None: ''
};

angular.module('BaubleApp').controller('PlantEditCtrl',
    function ($scope, $location, $stateParams, globals, Accession, Plant, Location) {

        $scope.plant = {
            accession_id: $location.search().accession,
            location_id: $location.search().location
        };

        // isNew is inherited from the NewCtrl if this is a /new editor
        $scope.notes = $scope.plant.notes || [];
        $scope.propagation = {};
        $scope.location = {};

        $scope.activeTab = "general";

        $scope.acc_type_values = acc_type_values;

        // make sure we have the details
        if($stateParams.id) {
            Plant.get($stateParams.id, {embed: ['notes', 'accession', 'location']})
                .success(function(data, status, headers, config) {
                    $scope.plant = data;
                    $scope.notes = $scope.plant.notes || [];
                    $scope.location = data.location;
                    $scope.accession = data.location;
                })
                .error(function(data, status, headers, config) {
                    // do something
                    /* jshint -W015 */
                });
        } else {
            if($scope.plant.accession_id) {
                Accession.get($scope.plant.accession_id, {embed: ["taxon"]})
                .success(function(data, status, headers, config) {
                    $scope.accession = data;
                    $scope.taxon = data.taxon;
                })
                .error(function(data, status, headers, config) {
                    // do something
                    /* jshint -W015 */
                });
            }
            if($scope.plant.location_id) {
                Location.get($scope.plant.accession_id)
                .success(function(data, status, headers, config) {
                    $scope.location = data;
                })
                .error(function(data, status, headers, config) {
                    // do something
                    /* jshint -W015 */
                });
            }
        }


        // get accessions for typeahead completions
        $scope.getAccessions = function($viewValue){
            return Accession.list({filter: {code: $viewValue + '%'}})
                .then(function(result) {
                    return result.data;
                });
        };

        // get accessions for location
        $scope.getLocations = function($viewValue){
            return Location.list({filter: {code: $viewValue + '%'}})
                .then(function(result) {
                    return result.data;
                });
        };

        $scope.alerts = [];
        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };

        $scope.cancel = function() {
            window.history.back();
        };

        // called when the save button is clicked on the editor
        $scope.save = function() {
            console.log('$sope.location: ', $scope.location);
            //$scope.plant.notes = $scope.notes;
            $scope.plant.accession_id = $scope.accession.id;
            $scope.plant.location_id = $scope.location.id;
            Plant.save($scope.plant)
                .success(function(data, status, headers, config) {
                    console.log('data: ', data);
                    $scope.cancel();
                })
                .error(function(data, status, headers, config) {
                    if(data) {
                        $scope.alerts.push({type: 'error', msg: "Error!\n" + data});
                    } else {
                        $scope.alerts.push({type: 'error', msg: "Unknown error!"});
                    }
                });

        };
    });
