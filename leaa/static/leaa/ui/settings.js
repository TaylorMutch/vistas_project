/**
 * Created by Taylor on 11/4/2015.
 */

/***
 * UI settings handling
 */

dirty_views = false; //TODO: Decide if this is a good thing to have or if we should eliminate it.

$(document).ready(function () {
    var ul = $("ul");
    /***
     * Settings for terrain and for wind vectors. Uniform across terrains.
     */
    ul.on('click', 'a.dem',  function(){
        var id = terrains[$(this).attr('value')].id;
        $.getJSON('/getSettings/', {'terrainID':id}, function(response) {
            manager.VectorHeight = response['VectorHeight'];
            manager.VectorLength = response['VectorLength'];
            manager.SceneHeight  = response['SceneHeight'];  // TODO: Should scene height be saved?
            manager.LiveUpdate  = response['LiveUpdate'];
            manager.ArrowColor = parseInt(response['ArrowColor']);
        }).done(function(){
            $('#vectorHeight').slider('option', 'value', manager.VectorHeight);
            $('#vectorLength').slider('option', 'value', manager.VectorLength);
            $('#sceneHeight').slider('option', 'value', manager.SceneHeight);
            $('#colorSelector').ColorPickerSetColor(manager.ArrowColor.toString(16));
            $('#colorSelector div').css('backgroundColor', '#' + manager.ArrowColor.toString(16));
        }).fail(function(jqxhr, status, error){
            console.error("Request failed: " + status + ", " + error);
        }).always(function() {
            $("#saveSettings").removeClass('disabled');
        });
    });
    /***
     * Saves the settings to the server
     */
    $('#saveSettings').on('click', function(){
        var save_to_server = confirm('Save current settings to the server?');
        if (save_to_server) {
            var http = new XMLHttpRequest();
            http.open("POST", "/setSettings/", true);
            http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            var liveUpdate = (manager.LiveUpdate == true) ? 1 : 0;
            var params = "live=" + liveUpdate.toString()
                + "&color=" + manager.ArrowColor.toString()
                + "&vheight=" + manager.VectorHeight.toString()
                + "&vlength=" + manager.VectorLength.toString()
                + "&sheight=" + manager.SceneHeight.toString()
                + "&terrainID=" + manager.ActiveDEM.id.toString();

            //http.send(params);
                //        http.onload = function(){
              //  alert(http.responseText);
            //};
             //alert(params);
        }
    });
    /***
     * Get terrain views from the server.
     */
    ul.on('click', 'a.dem', function() {
        var id = terrains[$(this).attr('value')].id;
        if (dirty_views) {
            dirty_views = confirm('You have created views which are not saved to the server. ' +
                'Would you like to save them now?');
            if (dirty_views) {
                // TODO: Implement way to save views not already added to the server.
                dirty_views = false;
            }
        }
        manager.TerrainViews = [];
        $.getJSON('/getTerrainViews/', {'terrainID':id}, function(response) {
            $.each(response, function(handle, view) {
                manager.TerrainViews.push(view);
            })
        }).done(function() {
            var viewPicker = $('#viewPicker');
            viewPicker.empty();
            $.each(manager.TerrainViews, function(handle, view) {
                viewPicker.append('<li><a href="#" class="terrainView">' + view.name + '</a></li>')
            });
            $("#saveViews").removeClass('disabled');
        })
    });
    /***
     * Saving a view for the user. Has the option to be local or to store on server.
     */
    $('#saveViews').on('click', function(){
        var name = prompt('Please give this view a name.');
        if (name !== null && name !== "") {
            var save_to_server = confirm('Would you like to save this to the server?');
            var view = {
                name: name,
                pos: camera.position
            };
            manager.TerrainViews.push(view);
            $("#viewPicker").append('<li><a href="#" class="terrainView">' + name + '</a></li>');
            if (save_to_server) {
                var saved_view = JSON.parse(JSON.stringify(view));
                saved_view.terrain = manager.ActiveDEM.id;
                var http = new XMLHttpRequest();
                var params = 'name=' + name
                        + "&x=" + saved_view.pos.x.toString()
                        + "&y=" + saved_view.pos.y.toString()
                        + "&z=" + saved_view.pos.z.toString()
                        + "&terrainID=" + saved_view.terrain.toString();
                http.open("POST", "/saveTerrainView/", true);
                http.setRequestHeader("Content-type","application/x-www-form-urlencoded");
                http.send(params);
                /*http.onload = function(){
                    alert(http.responseText);
                };
                alert(params);*/
            }
            else {
                dirty_views = true;
            }
        }
    });
    /***
     * Sets the camera to a saved position.
     */
    ul.on('click', 'a.terrainView', function() {
        var name = $(this).html();
        var i;
        for (i = 0; i < manager.TerrainViews.length; i++) {
            if (manager.TerrainViews[i].name == name) break;
        }
        var view = manager.TerrainViews[i];
        orbit.reset();
        camera.position.x = view.pos.x;
        camera.position.y = view.pos.y;
        camera.position.z = view.pos.z;
    })
});