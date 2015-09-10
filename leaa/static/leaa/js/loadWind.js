/**
 * Created by Taylor on 9/2/2015.
 */

//TODO: Select records to be shown and compile the VCL/DCL arrays



//TODO: Update the SODAR Log & Activity label with current record being shown

//TODO: Update the UI controls to be useful

steal(function () {
    $("ul").on("click", "a.sodar", function () {
        var sodar_id = this.id;
        records = [];
        temp_records = [];
        $.getJSON('/records/', function(json) {
            records = json;
            console.log(records);
        }).done(function(records) {
            $.each(records, function(id, record) {
                if (sodar_id == record.sodar) {
                    temp_records.push(record);
                }
            });
            console.log(temp_records);
        });

    });

});