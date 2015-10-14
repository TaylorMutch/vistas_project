/**
 * Created by Taylor on 9/2/2015.
 */

/**
 * Get the station objects from server so that we can operate on them.
 */
steal(function () {
    $("ul").on("click", "a.recordDate", function () {
        //var stationNames = ['McRae', 'Primet'];
        // Get the record handles
        var recordDate = $(this).html();
        $.getJSON('/getStationObjects/', {'stations[]':stationNames, 'recordDate':recordDate}, function(result) {
            rawStationData = result;
        }).done(function() {
                manager.ActiveStations = [];
                $.each(rawStationData, function(station, data) {
                    manager.ActiveStations.push(new Station(data));
                });
                $.each(manager.ActiveStations, function(id, station) {
                    station.pos = manager.TerrainMap[(station.demY*manager.ActiveDEM.DEMx)+station.demX];
                    renderArrows(station);
                });
            }
        );
        console.log(recordDate);
        $("#current-timestamp-label").html(manager.ActiveDEM.name + ': ' + recordDate);
        updateSodarLog('Loaded records from: ' + recordDate, false);
    });
});