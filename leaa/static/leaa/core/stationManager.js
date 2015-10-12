/**
 * Created by Taylor on 10/11/2015.
 */
/**
 * Abstract manager for handling visualization interactions.
 * Since some data may be 'dirty', in that not all data values are valid for every timestep
 * in a visualization, we need to be able to handle dropping some stations while still
 * rendering the correct ones in the scene.
 * @constructor
 */
function StationManager(){
    this.ActiveStations = [];
}

StationManager.prototype.AppendStation = function(station){
    this.ActiveStations.push(station);
};

StationManager.prototype.ClearStations = function(){
    this.ActiveStations = [];
};

//TODO: Does this belong here?
StationManager.prototype.StepBackward = function() {
};
//TODO: Does this belong here?
StationManager.prototype.StepForward = function() {
};

StationManager.prototype.ResetStations = function() {
    for (var i = 0; i < this.ActiveStations.length -1; i++) {
        ActiveStations[i].ResetIndex();
    }
};

/**
 * Intelligently determine which stations we need to render in the upcoming animation loop.
 * @param {boolean} increasing - if true, then we are steppingForward. Otherwise we are decreasing (XOR)
 * @constructor
 * @return array of booleans, true means to render, false otherwise
 */
StationManager.prototype.CompareDates = function(increasing) {
    var datesToCompare = [];
    var stationsToRender = []; //boolean array

    // The dates we check will be different whether we are increasing
    // or decreasing, so check which way we are going
    if (increasing) {
        $.each(this.ActiveStations, function(id, station) {
            datesToCompare.push(station.dates[station.CheckForward()]);
        });
    } else {
        $.each(this.ActiveStations, function(id, station) {
            datesToCompare.push(station.dates[station.CheckBackward()]);
        });
    }

    // Now we check if we can just use all the stations or if we go get them all.
    if (Math.max.apply(Math, datesToCompare) == Math.min.apply(Math, datesToCompare)) {
        console.log('All dates match');
        for (var i = 0; i < datesToCompare.length-1; i++) {
            stationsToRender.push(true);
        }
    } else {
        console.log('Date mismatch, picking dates now');
        var checkDate;
        if (isIncreasing) {
            checkDate = Math.min.apply(Math, datesToCompare);
        } else {
            checkDate = Math.max.apply(Math, datesToCompare);
        }
        $.each(datesToCompare, function(id, date) {
            if (date == checkDate) {
                stationsToRender.push(true);
            }
            else {
                stationsToRender.push(false);
            }
        })
    }
    return stationsToRender;
};
