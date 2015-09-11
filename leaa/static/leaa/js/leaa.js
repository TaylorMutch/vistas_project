/**
 * Created by Taylor on 9/8/2015.
 */
/*
    Steal document for LEAA.
    Loads any scripts via jQuery and hands them over to the client, making them available
    right as the DOM finishes loading. This ensures that all assets are loaded before
    the user tries to do anything initially.
 */
//$.ajaxSetup({
//   async: true
//});

var terrainMap;

$(document).ready(function() {

    // Retrieve terrains from API
    terrains = [];
    terrainNames = [];
    $.getJSON('/terrains/', function(json) {
        $.each(json, function(id, item) {
            terrains.push(item);
        });
    }).done(function(terrains) {
        $.each(terrains, function (id, terrain) {
            terrainNames.push(terrain.name);
            $("#demPicker").append('<li><a href="#" id="dem'+terrain.name +'" class="dem" value=' + id + '>' + terrain.name + '</a></li>');
        });
    });

    steal("leaa/js/loadTerrain.js", function() {}); // Load rendering tools
    steal("leaa/js/loadWind.js", function() {}); // Load data extraction tools
    steal("leaa/js/animateWind.js", function() {});

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

});