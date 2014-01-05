'use strict';

angular.module('BaubleApp', ['ngRoute', 'ui.bootstrap', 'ui.select2', 'ngGrid'])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl'
            })
            .when('/search', {
                templateUrl: 'views/search.html',
                controller: 'SearchCtrl'
            })

            .when('/login', {
                templateUrl: 'views/login.html',
                controller: 'LoginCtrl'
            })

            .when('/logout', {
                templateUrl: 'views/logout.html',
                controller: 'LogoutCtrl'
            })

            .when('/newuser', {
                templateUrl: 'views/new_user.html'
            })

            .when('/admin', {
                templateUrl: 'views/admin.html',
                controller: 'AdminCtrl'
            })

            .when('/new/:resource', {
                templateUrl: 'views/new.html',
                controller: 'NewCtrl'
            })

            .when('/edit/:resource', {
                templateUrl: 'views/edit.html',
                controller: 'EditCtrl'
            })

            .when('/reporter', {
                templateUrl: 'views/report_design.html',
                controller: 'ReporterCtrl'
            })

            .when('/docs', {
                templateUrl: 'views/docs.html'
            })

            .when('/faq', {
                templateUrl: 'views/faq.html'
            })

            .when('/privacy', {
                templateUrl: 'views/privacy.html'
            })

            .when('/about', {
                templateUrl: 'views/about.html'
            })

            .when('/contact', {
                templateUrl: 'views/contact.html'
            })

            .when('/curious', {
                templateUrl: 'views/curious.html'
            })

            .when('/classic', {
                templateUrl: 'views/classic.html'
            })

            .otherwise({
                redirectTo: '/'
            });
    });
