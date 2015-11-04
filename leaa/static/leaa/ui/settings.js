/**
 * Created by Taylor on 11/4/2015.
 */

$(document).ready(function () {
    $.getJSON('/getSettings/', function(response) {
        /*manager.VectorHeight = response['VectorHeight'];
        manager.VectorLength = response['VectorLength'];
        manager.SceneHeight  = response['SceneHeight'];
        manager.LiveUpdate  = response['LiveUpdate'];
        manager.ArrowColor = parseInt(response['ArrowColor']);*/
        console.log(response['VectorHeight']);
        console.log(response['VectorLength']);
        console.log(response['SceneHeight']);
        console.log(response['LiveUpdate']);
        console.log(parseInt(response['ArrowColor']));
    })
});