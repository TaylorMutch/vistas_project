/**
 * Created by Taylor on 9/8/2015.
 */
/*
    Steal document for LEAA.
    Loads any scripts via jQuery and hands them over to the client, making them available
    right as the DOM finishes loading. This ensures that all assets are loaded before
    the user tries to do anything initially.
 */

var LEAA = { VERSION: '0.0.1'};

/**
 * Global functions that are pretty harmless overall
 */
function updateSodarLog(string, updateCurrentLabel) {
    $('#sodarLog').append('<li><a> ' + string + '</a></li>');
    if (updateCurrentLabel) {
        $('#current-timestamp-label').html(string);
    }
}

function formatTimestamp(date) {
    var datestring = String(date);
    var year = datestring.substring(0,2);
	var month = datestring.substring(2, 4);
	var day = datestring.substring(4, 6);
	var hour = datestring.substring(6, 8);
	var minute = datestring.substring(8, 10);
    var sec = datestring.substring(10,12);

	return  month + "/" + day + "/" + year + " at " + hour + ":" + minute + ":" + sec;
}

$(document).ready(function() {

    terrains = [];
    $.getJSON('/terrains/', function(json) {
        $.each(json, function(id, item) {
            terrains.push(item);
        });
    }).done(function(terrains) {
        $.each(terrains, function (id, terrain) {
            $("#demPicker").append('<li><a href="#" id="dem'+terrain.name +'" class="dem" value=' + id + '>' + terrain.name + '</a></li>');
        });
    });

    steal("leaa/ui/loadTerrain_test.js", function() {}); // Load rendering tools
    steal("leaa/ui/loadWind_test.js", function() {});    // Load data extraction tools
    steal("leaa/ui/animateWind_test.js", function() {}); // Wind controls
    //steal("leaa/ui/registration.js", function() {}); //TODO: Add registration functionality
    $("#registerBtn").on("click", function (event) {
        /**
         * Handle user clicking register button
         */
        //TODO: Implement
    });
    $("#signInBtn").on("click", function(event) {
        event.preventDefault();
        var loginForm = $("signInForm").serialize();
        console.log(loginForm);
        //TODO: Implement
    });
    // Toggles for tooltips, etc.
    $(function () {
        $('[data-toggle="tooltip-std"]').tooltip({placement: 'right', container: 'body'})
    });
    $(function () {
        $('[data-toggle="tooltip"]').tooltip({container: 'body'})
    });
    $(function () {
        $('.dropdown-toggle').dropdown();
    });
    /*
    $(function () {
        $('.collapse').collapse();
    })
    */
    $("#closehowtomodal").click(function() {
        $("#howtovideo")[0].pause();
    })
});

