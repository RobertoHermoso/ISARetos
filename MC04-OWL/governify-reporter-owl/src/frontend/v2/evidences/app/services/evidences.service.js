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
    angular
        .module('reporterApp')
        .service('evidencesService', function evidencesService($state, $q, $http, $stateParams, $rootScope) {


            var getEvidences = (queryParam) => {
                return $q((resolve, reject) => {
                    var url;
                    console.log(queryParam)
                    if (queryParam.agreement && queryParam.indicator && queryParam.type && (queryParam.from || queryParam.at) && queryParam.scope) {
                        queryParam.indicator = queryParam.indicator;
                        console.log($rootScope.config)
                        var evidencesRegistryEndpoint = $rootScope.config.registry_endpoint + "/api/v" + $rootScope.config.registry_apiVersion + "/states/" + queryParam.agreement + "/filtered";

                        url = evidencesRegistryEndpoint + "?" +
                            "indicator=" + queryParam.indicator +
                            "&type=" + queryParam.type;
                        if (queryParam.at) url += "&at=" + queryParam.at;
                        else if (queryParam.from) url += "&from=" + queryParam.from;
                        //   +"&to=" + queryParam.to;
                        for (var scopeProp in queryParam.scope) {
                            url += "&scope." + scopeProp + "=" + queryParam.scope[scopeProp]
                        }

                        $http.get(url).then((response) => {
                            try {
                                var data = response.data;
                                if (!Array.isArray(data) ||
                                    data.length === 0 ||
                                    !data[0].evidences ||
                                    !Array.isArray(data[0].evidences) ||
                                    data[0].evidences.length === 0) {
                                    return reject({
                                        status: 500,
                                        message: 'Registry data is not an array with data'
                                    });
                                } else {
                                    data = data;
                                    return resolve(data);
                                }
                            } catch (err) {
                                return reject({
                                    status: 500,
                                    message: err
                                });
                            }
                        }, (response) => {
                            return reject({
                                status: response.codeStatus,
                                message: "Registry unexpected data " + JSON.stringify(response)
                            });
                        });
                    } else {
                        console.log(queryParam);
                        reject();
                    }

                });
            };

            var getBills = (from, to) => {
                return $q((resolve, reject) => {
                    var url;

                    var url = $rootScope.config.registry_endpoint + "/api/v" + $rootScope.config.registry_apiVersion + "/bills/" + $stateParams.agreement + "?from=" + from + "&to=" + to;

                    console.log(url)
                    $http.get(url).then((response) => {
                        try {
                            var data = response.data;
                            if (!Array.isArray(data)) {
                                return reject({
                                    status: 500,
                                    message: 'Registry data is not an array with data'
                                });
                            } else {
                                return resolve(data[0]);
                            }
                        } catch (err) {
                            return reject({
                                status: 500,
                                message: err
                            });
                        }
                    }, (response) => {
                        return reject({
                            status: response.codeStatus,
                            message: "Registry unexpected data " + JSON.stringify(response)
                        });
                    });
                });
            };

            var updateANS = (data) => {

                return $q((resolve, reject) => {
                    var url;
                    var evidencesRegistryEndpoint = $rootScope.config.registry_endpoint + "/api/v" + $rootScope.config.registry_apiVersion + "/states/" + $stateParams.agreement + "/guarantees/";

                    url = evidencesRegistryEndpoint + $stateParams.guarantee + "/overrides";

                    console.log("Post new override: " + url);

                    $http.post(url, data).then((response) => {
                        try {
                            if (response.status != 200) {
                                return reject({
                                    status: 500,
                                    message: 'Post override failed'
                                });
                            } else {
                                return resolve(data);
                            }
                        } catch (err) {
                            return reject({
                                status: 500,
                                message: err
                            });
                        }
                    }, (response) => {
                        return reject({
                            status: response.status,
                            message: "Registry unexpected data " + JSON.stringify(response)
                        });
                    });

                });
            }

            var getRegisteredOverrides = () => {
                return $q((resolve, reject) => {
                    var url;
                    var evidencesRegistryEndpoint = $rootScope.config.registry_endpoint + "/api/v" + $rootScope.config.registry_apiVersion + "/states/" + $stateParams.agreement + "/guarantees/";

                    url = evidencesRegistryEndpoint + $stateParams.guarantee + "/overrides";

                    console.log("Get registered overrides: " + url)
                    $http.get(url).then((response) => {
                        try {
                            var data = response.data;
                            if (!Array.isArray(data)) {
                                return reject({
                                    status: 500,
                                    message: 'Registry data is not an array'
                                });
                            } else {
                                return resolve(data);
                            }
                        } catch (err) {
                            return reject({
                                status: 500,
                                message: err
                            });
                        }
                    }, (response) => {
                        return reject({
                            status: response.codeStatus,
                            message: "Registry unexpected data " + JSON.stringify(response)
                        });
                    });

                });
            };

            var deleteOverride = (data) => {

                return $q((resolve, reject) => {
                    var url;
                    var evidencesRegistryEndpoint = $rootScope.config.registry_endpoint + "/api/v" + $rootScope.config.registry_apiVersion + "/states/" + $stateParams.agreement + "/guarantees/";

                    url = evidencesRegistryEndpoint + $stateParams.guarantee + "/overrides";

                    console.log("Delete override: " + url);

                    $http.delete(url, { data: data, headers: { 'Content-Type': 'application/json' } }).then((response) => {
                        try {
                            if (response.status != 200) {
                                return reject({
                                    status: 500,
                                    message: 'Delete override failed'
                                });
                            } else {
                                return resolve(data);
                            }
                        } catch (err) {
                            return reject({
                                status: 500,
                                message: err
                            });
                        }
                    }, (response) => {
                        return reject({
                            status: response.codeStatus,
                            message: "Registry unexpected data " + JSON.stringify(response)
                        });
                    });

                });
            }


            return {
                getEvidences: getEvidences,
                updateANS: updateANS,
                getRegisteredOverrides: getRegisteredOverrides,
                deleteOverride: deleteOverride,
                getBills: getBills
            };

        });

})();
