/**
 * Created by Taylor on 9/2/2015.
 */


//TODO: Update the SODAR Log & Activity label with current record being shown

//TODO: Update the UI controls to be useful

steal(function () {

    // Load a set of data from the server
    $("ul").on("click", "a.recordDate", function () {

        // Get the record handles
        recordDate = $(this).html();
        stationData = [];
        $.getJSON('/getVectors/', {'stations[]':stationNames, 'recordDate':recordDate}, function(result) {
            $.each(result, function(name, data) {
                stationData.push(data);
            });
        });
        console.log(recordDate);
        $("#current-timestamp-label").html(temp_terrain.name + ': ' + recordDate);
    });



});