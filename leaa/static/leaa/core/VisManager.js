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
function VisManager(){ //TODO: Could we use this to associate a given scene with our user? hmm...
    // Setable attributes
    this.ActiveStations = [];
    this.SceneObjects = [];
    this.TerrainMap = [];
    this.ActiveDEM = undefined; // gets set later, we just need an initial attribute to define later.
    this.Loader = new THREE.TerrainLoader();
}


/**
 * Reset all stations to their initial index.
 * @constructor
 */
VisManager.prototype.ResetStations = function() {
    for (var i = 0; i < this.ActiveStations.length -1; i++) {
        this.ActiveStations[i].ResetIndex();
    }
};

VisManager.prototype.StepBackward = function() {
    var stationsToRender = this.CompareDates(false);
    for (var i = 0; i < this.ActiveStations.length-1; i++) {
        if (stationsToRender[i] == true) {
            var station = this.ActiveStations[i];
            station.Backward();
            renderArrows(station);
        }
    }
};

VisManager.prototype.StepForward = function() {
    var stationsToRender = this.CompareDates(true);
    for (var i = 0; i < this.ActiveStations.length-1; i++) {
        if (stationsToRender[i] == true) {
            var station = this.ActiveStations[i];
            station.Forward();
            renderArrows(station);
        }
    }
};

/**
 * Intelligently determine which stations we need to render in the upcoming animation loop.
 * @param {boolean} increasing - if true, then we are steppingForward. Otherwise we are decreasing (XOR)
 * @constructor
 * @return array of booleans, true means to render, false otherwise
 */
VisManager.prototype.CompareDates = function(increasing) {
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
    console.log(datesToCompare);
    // Now we check if we can just use all the stations or if we go get them all.
    if (Math.max.apply(Math, datesToCompare) == Math.min.apply(Math, datesToCompare)) {
        console.log('All dates match');
        for (var i = 0; i < datesToCompare.length-1; i++) {
            stationsToRender.push(true);
        }
    } else {
        console.log('Date mismatch, picking dates now');
        var checkDate;
        if (increasing) {
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
    console.log(stationToRender);
    return stationsToRender;
};
