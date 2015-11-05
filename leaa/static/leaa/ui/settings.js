/**
 * Created by Taylor on 11/4/2015.
 */

/***
 * User settings handling
 */
$(document).ready(function () {
    $.getJSON('/getSettings/', function(response) {
        manager.VectorHeight = response['VectorHeight'];
        manager.VectorLength = response['VectorLength'];
        manager.SceneHeight  = response['SceneHeight'];
        manager.LiveUpdate  = response['LiveUpdate'];
        manager.ArrowColor = parseInt(response['ArrowColor']);
        $("#saveSettings").removeClass('disabled');
        // TODO: Remove 'disabled' from $('#saveViews') when we get to loading saved views.
    });

    $('#saveSettings').on('click', function(){
        var http = new XMLHttpRequest();
        http.open("POST", "/setSettings/", true);
        http.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        var liveUpdate = (manager.LiveUpdate == true) ? 1 : 0;
        var params = "live=" + liveUpdate.toString()
            + "&color=" + manager.ArrowColor.toString()
            + "&vheight=" + manager.VectorHeight.toString()
            + "&vlength=" + manager.VectorLength.toString()
            + "&sheight=" + manager.SceneHeight.toString();
        //alert(params);
        http.send(params);
        //http.onload = function(){
        //    alert(http.responseText);
        //}
    })
});