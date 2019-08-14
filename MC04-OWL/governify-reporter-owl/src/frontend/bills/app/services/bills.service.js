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
        .service('billsService', function billsService($state, $q, $http, $stateParams, $rootScope) {


            var getBills = () => {
                return $q((resolve, reject) => {
                    var url;
                    if ($stateParams.agreement) {
                        var url = $rootScope.config.registry_endpoint + "/api/v" + $rootScope.config.registry_apiVersion + "/bills/" + $stateParams.agreement;
                        
                        console.log(url);

                        $http.get(url).then((response) => {
                            try {
                                var data = response.data;
                                if (!Array.isArray(data)) {
                                    return reject({
                                        status: 500,
                                        message: 'Registry data is not an array with data'
                                    });
                                } else {
                                    console.log("Data received");
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

            var updateBills = (data) => {

                return $q((resolve, reject) => {
                    var url = $rootScope.config.registry_endpoint + "/api/v" + $rootScope.config.registry_apiVersion + "/bills/" + $stateParams.agreement + "/" + data.billId;


                    console.log("Put bill: " +url);
                    console.log(data)

                    $http.put(url,data).then((response) => {
                        try {
                            if(response.status != 200){
                                return reject({
                                    status: 500,
                                    message: 'Put bills failed'
                                });
                            }else{
                                return resolve(data);
                            }
                        } catch (err) {
                            return reject({
                                status: 500,
                                message: err
                            });
                        }
                    }, (response) => {
                        if(response.status == 403){
                            alert("La factura no puede editarse porque está cerrada.")
                        }
                        return reject({
                            status: response.codeStatus,
                            message: "Registry unexpected data " + JSON.stringify(response)
                        });
                    });

            });
        }

        return {
            updateBills: updateBills,
            getBills: getBills
        };
           

        });

})();
