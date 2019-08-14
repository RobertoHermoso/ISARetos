/*!
governify-registry 3.0.1, built on: 2018-04-18
Copyright (C) 2017 ISA Group
http://www.isa.us.es/
http://registry.governify.io/

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/* global Materialize, jsyaml */
function printToastMessage(message, time) {
    if (!time) {
        time = 150000;
    }
    var $toastContent = $('<div class="center"><p class="white-text center">' + message + '</p><div class="preloader-wrapper active center"><div class="spinner-layer spinner-yellow-only"> <div class="circle-clipper left"> <div class="circle"></div> </div><div class="gap-patch"> <div class="circle"></div> </div><div class="circle-clipper right"> <div class="circle"></div> </div> </div> </div> </div>');
    Materialize.toast($toastContent, time);
}

defaultAgreementManagerEndpoint = 'https://designer.governify.io:10843/sas/PROSAS/agreement-manager/agreement-manager-config.json?accessToken=741b9259-8bbc-4e74-9865-68ce53287a81#';
productionRegistrtyAgreementsEndpoint = "http://registry.sas.governify.io/api/v1/agreements/";
develRegistrtyAgreementsEndpoint = "http://registry.sas-devel.governify.io/api/v1/agreements/";

$("#exec_button_pre").on("click", function () {
    var selectedAg = $("#agreementSelector").find(":selected");
    var selectedAgVal = selectedAg.val();
    if (!selectedAgVal) {
        selectedAgVal = "(no agreement selected)";
        $("#exec_button").hide();
    } else {
        $("#exec_button").show();
        selectedAgVal = selectedAgVal.split("/")[7].split("?")[0];
    }
    $("#agreementToLoad").text(selectedAgVal);
});

$("#exec_button").on("click", function () {
    var selectedAg = $("#agreementSelector").find(":selected");
    var selectedAgVal = selectedAg.val();
    var registryEndpoint = selectedAg.attr("data-registry");
    var deleteIfExists = $("#forceDelete").parent().find(':checked');
    getAgreementContent(selectedAgVal, registryEndpoint, deleteIfExists);
});


$(document).ready(function () {
    $('select').material_select();
    $('.modal-trigger').leanModal();

    $.ajax({
        url: defaultAgreementManagerEndpoint,
        type: "GET"
    }).done(function (res) {
        var configObj = JSON.parse(res);
        var selectAgreement = $("#agreementSelector");
        var level1 = [];
        var level2 = [];
        var level3 = [];
        var level4 = [];

        var optgroup1 = $("<optgroup>", {
            label: "logs.sas"
        });
        var optgroup2 = $("<optgroup>", {
            label: "logs-devel.sas"
        });
        var optgroup3 = $("<optgroup>", {
            label: "logs.sas-devel"
        });
        var optgroup4 = $("<optgroup>", {
            label: "logs-devel.sas-devel"
        });

        optgroup1.appendTo(selectAgreement);
        optgroup2.appendTo(selectAgreement);
        optgroup3.appendTo(selectAgreement);
        optgroup4.appendTo(selectAgreement);

        $.each(configObj["agreement-list"], function (index, agreement) {
            switch (this["logs-endpoint"]) {
                case "logs.sas":
                    level1.push(this);
                    break;
                case "logs-devel.sas":
                    level2.push(this);
                    break;
                case "logs.sas-devel":
                    level3.push(this);
                    break;
                case "logs-devel.sas-devel":
                    level4.push(this);
                    break;
                default:
                    break;
            }
        });

        //TODO: improve it later

        $.each(level1, function (index, agreement) {
            optgroup1.append(constructSingleOption(this["agreement-url"], this["name"], this["protected"], this["registry-endpoint"]));
        });
        $.each(level2, function (index, agreement) {
            optgroup2.append(constructSingleOption(this["agreement-url"], this["name"], this["protected"], this["registry-endpoint"]));
        });
        $.each(level3, function (index, agreement) {
            optgroup3.append(constructSingleOption(this["agreement-url"], this["name"], this["protected"], this["registry-endpoint"]));
        });
        $.each(level4, function (index, agreement) {
            optgroup4.append(constructSingleOption(this["agreement-url"], this["name"], this["protected"], this["registry-endpoint"]));
        });

        selectAgreement.material_select();

    }).fail(function (err) {
        printToastMessage("Error in JSON", 2500);
    });
});

function constructSingleOption(value, text, disabled, registryEndpoint) {
    var option = $("<option></option>").attr("value", value).attr("data-registry", registryEndpoint).text(text);
    if (disabled) {
        option.attr("disabled", "disabled");
    }
    return option;
}

function getAgreementContent(selectedAgVal, registryEndpoint, deleteIfExists) {

    $.ajax({
        url: selectedAgVal,
        type: "GET",
        beforeSend: function (request) {
            request.setRequestHeader("Content-Type", "text/plain; charset=utf-8");
        }
    }).done(function (res) {
        var agreement = jsyaml.load(res);
        if (!deleteIfExists.val()) {
            checkIfAgreementExists(agreement, registryEndpoint, uploadAgreement);
        } else {
            deleteAndUploadAgreement(agreement, registryEndpoint);
        }
    }).fail(function (err) {
        printToastMessage("Error in agreement", 2500);
    });
}

function checkIfAgreementExists(agreement, registryEndpoint) {
    var url = registryEndpoint + agreement["id"];
    $.ajax({
        url: url,
        type: "GET"
    }).done(function (res) {
        if (res) {
            printToastMessage("This agreement (" + agreement["id"] + ") already exists", 2500);
        } else { //TODO: change when server logic improve
            uploadAgreement(agreement, registryEndpoint);
        }
    }).fail(function (err) {
        if (err.status === 404) { //TODO: change when server logic improve
            uploadAgreement(agreement, registryEndpoint);
        } else {
            printToastMessage("Error while checking agreement existence", 2500);
        }
    });
}

function deleteAndUploadAgreement(agreement, registryEndpoint) {
    var deleteAgreementEndpoint = registryEndpoint + agreement["id"];
    $.ajax({
        url: deleteAgreementEndpoint,
        type: "DELETE"
    }).done(function (res) {
        uploadAgreement(agreement, registryEndpoint);
    }).fail(function (err) {
        printToastMessage("Error deleting agreement (" + agreement["id"] + ") on registry", 2500);
    });
}


function uploadAgreement(agreement, registryEndpoint) {
    $.ajax({
        url: registryEndpoint,
        type: "POST",
        data: JSON.stringify(agreement),
        contentType: "application/json; charset=utf-8",
        dataType: "json"
    }).done(function (res) {
        handleSuccessfulUpload(agreement);
    }).fail(function (err) {
        printToastMessage("Error posting agreement (" + agreement["id"] + ") into registry", 2500);
    });
}

function handleSuccessfulUpload(agreement) {
    printToastMessage("Agreement (" + agreement["id"] + ") has been successfully persisted", 2500);
}