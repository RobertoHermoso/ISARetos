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
        .controller('billsCtrl', BillsController);

    BillsController.$inject = ['billsService', '$rootScope', '$state', '$scope', '$q', '$http', '$timeout', '$stateParams'];

    function BillsController(billsService, $rootScope, $state, $scope, $q, $http, $timeout, $stateParams) {

       
        $rootScope.configPromise.then(function(){ //Config must be loaded
        $scope.agreement = $stateParams.agreement;

      
        $scope.years = []
        $scope.yearMonths = {};
        var calculateMonths = (bills) => {
            for(var i=bills.length-1;i>=0;i--){
                var billl = bills[i];
                var formatDate = bills[i].period.from.split("T")[0];
                var year = moment(formatDate).add(1,"month").format('YYYY', 'es');
                var month = moment(formatDate).add(1,"month").format('MMMM', 'es');

                month = month.charAt(0).toUpperCase() + month.slice(1);
            
                if($scope.yearMonths[year]){
                    if($scope.yearMonths[year].indexOf(month)<0){
                        $scope.yearMonths[year].push({month: month, state: bills[i].state, closeDate: bills[i].closeDate, bill: bills[i]});
                    }
                }else{
                    $scope.yearMonths[year] = [{month: month, state: bills[i].state, closeDate: bills[i].closeDate, bill: bills[i]}];
                    $scope.years.push(year);
                }

            }

            console.log($scope.yearMonths)

            $scope.years;
            $scope.firstBill = $scope.yearMonths[Object.keys($scope.yearMonths)[0]][0].month + " " + Object.keys($scope.yearMonths)[0];
            $scope.lastBill =  $scope.yearMonths[Object.keys($scope.yearMonths)[Object.keys($scope.yearMonths).length-1]][0].month + " " + Object.keys($scope.yearMonths)[Object.keys($scope.yearMonths).length-1];

        };

        $scope.closeBill = (bill) => {
            var index = $scope.bills.indexOf(bill);
            var closeDate = moment().toISOString();

            bill.closeDate = closeDate;
            bill.state = "closed";

            $scope.bills[index] = bill;

            var updatedBill = {"agreementId": $stateParams.agreement,
                            "billId": bill.billId.toString(),
                            "period":
                                {"from":bill.period.from,
                                 "to":bill.period.to},
                            "state":"closed",
                            "closeDate": closeDate
                            }

            billsService.updateBills(updatedBill).then((response) => {

                $scope.years = []
                $scope.yearMonths = {};
                calculateMonths($scope.bills);

            }, (err) => {
                console.error(err);
                $scope.loadingOverrides = false;
                $scope.calculated = true;
            });

        }

        $scope.changeCloseData = (bill, month, year) => {
            $scope.currentBill = bill;
            $scope.currentMonth = month;
            $scope.currentYear = year;
        }
        
        
        
        $scope.getBills = () => {
            billsService.getBills().then((bills) => {
                $scope.bills = bills;
                calculateMonths(bills);

            }, (err) => {
                console.error(err);
                $scope.loadingOverrides = false;
                $scope.calculated = true;
            });

        }

        if ($stateParams.agreement){
            $scope.getBills();
        }


    })
    }
        
}());