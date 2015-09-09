/**
 * Created by Taylor on 9/2/2015.
 */

var terrains = [];
var terrainNames = [];
var stations;
var sodars;
var records;

/*
$.getJSON('/terrains/', function(json) {
    terrains = json;
    console.log(terrains);
    }).done(function(json) {
    // TODO:List the terrain names at the demPicker tag in index.html
    for (var i = 0, len < json.length; i<len; i++)
    {

        var names = []

        $("#demPicker").append('<li><a href="')
    }
});
*/

$.getJSON("/terrains/", function(json) {
    $.each(json, function(id, item) {
        // console.log(id);
        terrains.push(item);
    });
    }).done(function(terrains) {
    $.each(terrains, function(id, terrain) {
        terrainNames.push(terrain.name);
        $("#demPicker").append('<li><a href="#" class="dem" id="dem' +id + '" value=' + id + ' onclick="getDEM(this.value)">' + terrain.name + '</a></li>');
    });
});

//for (var i = 0, l = terrains.length; i < l; i++) {
//    terrainNames.push(terrains[i].name);
//}
// console.log(terrainNames);

//$.each(terrains, function(key, val) {
//    terrainNames.push(terrains[key].name);
//});

$.getJSON('/stations/', function(json) {
    stations = json;
    console.log(stations);
});

$.getJSON('/sodars/', function(json) {
    sodars = json;
    console.log(sodars);
    }).done(function(json) {
    // TODO: List the available readings available -- the logic probably won't go here, this is mainly for testing.
});

$.getJSON('/records/', function(json) {
    records = json;
    console.log(records);
    }).done(function(json) {
    // TODO: Process the records based on sodar_id
});