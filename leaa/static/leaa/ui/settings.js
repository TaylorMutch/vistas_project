/**
 * Created by Taylor on 11/4/2015.
 */

/***
 * UI settings handling
 */

/***
 * Settings for terrain and for wind vectors
 */
function getSettings(id) {
    $.getJSON('/getSettings/', {'terrainID': id}, function (response) {
        manager.VectorHeight = response['VectorHeight'];
        manager.VectorLength = response['VectorLength'];
        manager.SceneHeight = response['SceneHeight'];  // TODO: Should scene height be saved?
        manager.LiveUpdate = response['LiveUpdate'];
        manager.ArrowColor = response['ArrowColor'];
    })
        .fail(function (jqxhr, status, error) {
            console.error("Request failed: " + status + ", " + error);
        });
}

/***
 *Get terrain views from the server.
 */
function getTerrainViews(id) {
    if (dirty_views) {
        dirty_views = confirm('You have created views which are not saved to the server. ' +
            'Would you like to save them now?');
        if (dirty_views) {
            // TODO: Implement way to save views that exist locally but are not added to the server.
            dirty_views = false;
        }
    }
    manager.TerrainViews = [];
    $.getJSON('/getTerrainViews/', {'terrainID': id}, function (response) {
        $.each(response, function (handle, view) {
            manager.TerrainViews.push(view);
        })
    }).done(function () {
        var viewPicker = $('#viewPicker');
        viewPicker.empty();
        $.each(manager.TerrainViews, function (handle, view) {
            viewPicker.append('<li><a href="#" class="terrainView">' + view.name + '</a></li>')
        });
        $("#saveViews").removeClass('disabled');
    })
}

dirty_views = false; //TODO: Decide if this is a good thing to have or if we should eliminate it.