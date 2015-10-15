/**
 * Created by Taylor on 9/2/2015.
 */

/**
 * Get the station objects from server so that we can operate on them.
 */
steal(function () {
    $("ul").on("click", "a.recordDate", function () {
        clearArrows();
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

        /**
         * Here we should update our timeline with the number of values
         */
        // Get the beginning and ending days from each station, and then set minimum and maximum times
        var minDates = [];
        var maxDates = [];
        $.each(manager.ActiveStations, function(id, station) {
            minDates.push(Math.max.apply(Math, station.dates));
            maxDates.push(Math.min.apply(Math, station.dates));
        });

        var max = Math.max.apply(Math, maxDates);
        var min = Math.min.apply(Math, minDates);
        timeline = new Timeline(min, max, min, 500);


        console.log(recordDate);
        $("#current-timestamp-label").html(manager.ActiveDEM.name + ': ' + recordDate);
        updateSodarLog('Loaded records from: ' + recordDate, false);
    });
});