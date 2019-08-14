/*!
governify-render 1.0.0, built on: 2018-05-09
Copyright (C) 2018 ISA group
http://www.isa.us.es/
https://github.com/isa-group/governify-render#readme

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




$scope.date = new Date().toISOString();

$scope.favourites = {}
$scope.colors = {}


$scope.addCat = function addCat(cat){
    if(!$scope.favourites[cat.name]){
        $scope.favourites[cat.name] = cat
        updateColors(cat)
    }

}



    function updateColors(cat){
        var colors = cat.color.split("and")
        colors.forEach(element => {
            var color = element.toLowerCase().trim()
            if (!$scope.colors[color]) {
                $scope.colors[color] = 0
            }
            $scope.colors[color] += 1;
        
        });
    }

    

$scope.seeCats = function createCat(cat){
    const fs = require('fs');
    let rowdata = fs.readFileSync('index/model.json', 'utf8')
    let json = JSON.parse(rowdata)
    console.log(json);
    if(!$scope.test[cat.name]){
        json[cat.name]=angular.toJson(cat)
    }
    return json
}