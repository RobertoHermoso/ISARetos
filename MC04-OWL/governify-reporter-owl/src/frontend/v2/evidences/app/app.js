/*!
governify-project-gauss-reporter 1.0.0, built on: 2018-04-19
Copyright (C) 2018 ISA group
http://www.isa.us.es/
https://github.com/isa-group/governify-project-gauss-reporter

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.*/

(function () {

    'use strict';

    var reporterApp = angular
        .module('reporterApp', [
            'ui.router'
        ])
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];

    function config($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('/', {
                url: "/scope/{scope:json}/?agreement&guarantee&period&at&tz",
                views: {
                    content: {
                        templateUrl: "/v2/evidences/app/states/evidences/evidences.template.html",
                        controller: 'evidencesCtrl',
                        controllerAs: 'vm'
                    }
                }
            });

        $urlRouterProvider.otherwise('/');

    }

})();


debug = false;