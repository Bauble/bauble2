'use strict';

angular.module('BaubleApp')
    .controller('AdminNewOrgCtrl', function ($scope, $dialog, Organization) {
        // the injected dialog is the dialog instance created by the $dialog
        // service
        $scope.save = function(result) {
            console.log( 'save: ', result );
            // save the organization
            console.log( $scope.org );
            console.log( $scope.owner );
            console.log( $scope.org );

            $scope.org.owners = [$scope.owner];
            Organization.save($scope.org)
                .success(function(data, status, result, config) {
                    $dialog.close(result);
                })
                .error(function(data, status, result, config) {
                    // TODO: show an error message
                    console.log("Could not save the organization.");
                    console.log(status);
                    console.log(result);
                });

        };
    });
