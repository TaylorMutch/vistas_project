/**
 * Created by Taylor on 9/2/2015.
 */

//TODO: Select records to be shown and compile the VCL/DCL arrays

//TODO: Update the SODAR Log & Activity label with current record being shown

//TODO: Update the UI controls to be useful

steal(function () {
    $("ul").on("click", "a.datafile", function () {

        // Get the record handles
        var datafile_id = this.id;
        //console.log(datafile_id);
        all_records = [];
        temp_records = [];
        recordIDs = [];
        $.getJSON('/records/', function(json) {
            all_records = json;
            $.each(all_records, function(id, record) {
                if (datafile_id == record.dataFile) {
                    recordIDs.push(record.id);
                    temp_records.push(record);
                }
                /*
                    TODO: Store the recordDates somewhere so that we can access them later for the UI
                    Record dates will need to be stored in a global variable, and then whenever a new terrain is loaded
                    the variable needs to be emptied of its contents so that we can keep track of what actually is
                    loaded in the terrain/client.
                 */
            });
            console.log(recordIDs);
        });

        // Extract the wind data from the records
        speeds = [];
        directions = [];
        heights = [];
        $.getJSON('/getVectors/', {'recordIDs[]': recordIDs}, function(result) {
            //TODO: Create THREE.ArrowHelper objects based on response.
            //console.log(result);
            $.each(result, function(key, value) {
                speeds.push(value[0]);
                directions.push(value[1]);
                heights.push(value[2]);
            });
        });
        var name = $(this).html();
        console.log(name);
        $("#current-timestamp-label").html("Loaded " + name);
    });
});