/**
 * Created by Taylor on 9/2/2015.
 */

var terrains;
var stations;
var sodars;
var records;

$.getJSON('/terrains/', function(json) {
    terrains = json;
    console.log(terrains);
    }).done(function(json) {
    // TODO:List the terrain names at the demPicker tag in index.html
});

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