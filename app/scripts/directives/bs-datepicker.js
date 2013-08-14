'use strict';

angular.module('BaubleApp')
    .directive('bsDatepicker', function () {
        return {
            template: '<input type="text" class="form-control" class="datepicker">',
            restrict: 'A',
            scope: {
                model: '=ngModel',
                options: '='
            },
            replace: true,
            link: function postLink(scope, element, attrs) {
                scope.$watch(scope.model, function() {
                    if(scope.model) {
                        element.datepicker('setDate', scope.model);
                    }
                });

                var defaultOptions = {
                    autoclose: true
                };

                element.datepicker(angular.extend(defaultOptions, scope.options)).
                    on('changeDate', function(event) {
                        scope.$apply(function() {
                            scope.model = event.date;
                        });
                    });
            }
        };
    });
