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
            stationData = result;
        }).done(function() {
                $.each(stationData, function(station, data) {
                    manager.ActiveStations.push(new Station(data));
                })
            }
        );
        console.log(recordDate);
        $("#current-timestamp-label").html(manager.ActiveDEM.name + ': ' + recordDate);
        updateSodarLog('Loaded records from: ' + recordDate, false);
    });
});