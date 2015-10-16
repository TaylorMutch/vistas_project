/**
 * Created by Taylor on 10/11/2015.
 */

//TODO: Get back from Christoph if they are index 0 or index 1 timestamps
months = {'Jan':'01',
          'Feb':'02',
          'Mar':'03',
          'Apr':'04',
          'May':'05',
          'Jun':'06',
          'Jul':'07',
          'Aug':'08',
          'Sep':'09',
          'Oct':'10',
          'Nov':'11',
          'Dec':'12'
};

//TODO: Make this function... prettier? It's pretty garbled
function calcTimestep(value) {
    var currentDate = new Date();
    currentDate.setTime(value);
    var currentDateStr = currentDate.toString();
    // parse month
    var _month = currentDateStr.substr(4,3);
    var monthValue;
    $.each(months, function(month, value) {
        if (month == _month) {monthValue = value;}});
    var currentParsed = currentDateStr.substr(13,2) + monthValue + currentDateStr.substr(8,2)
        + currentDateStr.substr(16,2) + currentDateStr.substr(19,2) + currentDateStr.substr(22,2);
    return parseInt(currentParsed);
    //console.log(currentInt);
}

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
    this.TerrainLoader = new THREE.TerrainLoader();
    this.Animating = false;
    this.ShowWireFrame = false;
    this.Timeline = new Timeline();
    this.SceneHeight = 1;
    this.VectorHeight = 1;
    this.VectorLength = 1;
    this.ArrowColor = null; //TODO: Add colorpicking back into the mix...
}

/**
 * Reset all stations to their initial index.
 * @constructor
 */
VisManager.prototype.ResetStations = function() {
    clearArrows();
    $('#timelineSlider').slider({value: this.Timeline.beginTime.getTime()});
    this.CurrentTimestamp = this.Timeline.beginTime.getTime();
    for (var i = 0; i < this.ActiveStations.length; i++) {
        this.ActiveStations[i].ResetIndex();
        this.ActiveStations[i].isCurrent = true;
        renderArrows(this.ActiveStations[i]);
    }
};
/**
 * Step forward.
 * @constructor
 */
VisManager.prototype.StepForward = function() {
    $('#timelineSlider').slider({value: this.CurrentTimestamp + this.Timeline.timeStep});
    this.Step(true);
};
/**
 * Step backward.
 * @constructor
 */
VisManager.prototype.StepBackward = function() {
    $('#timelineSlider').slider({value: this.CurrentTimestamp - this.Timeline.timeStep});
    this.Step(false);

};
/**
 * Steps our animation forward or backward
 * @param forward - boolean, true means we are moving forward, false means backwards
 * @constructor
 */
VisManager.prototype.Step = function(forward) {
    clearArrows();
    this.CompareDates(forward);
    for (var i = 0; i < this.ActiveStations.length; i++) {
        var station = this.ActiveStations[i];
        if (station.isCurrent) {
            console.log('Rendering ' + station.name);
            if (forward) {
                station.Forward();
            }
            else {
                station.Backward();
            }
            renderArrows(station);
        }
    }
    this.CurrentTimestamp = $('#timelineSlider').slider('option', 'value');
    this.CurrentDate = calcTimestep(this.CurrentTimestamp);
};

/**
 * Intelligently determine which stations we need to render in the upcoming animation loop.
 * @param {boolean} increasing - if true, then we are steppingForward. Otherwise we are decreasing (XOR)
 * @constructor
 * @return array of booleans, true means to render, false otherwise
 */
VisManager.prototype.CompareDates = function(increasing) {
    var datesToCompare = [];

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
    console.log('Comparing these dates: ' + datesToCompare);
    // Now we check if we can just use all the stations or if we need to drop one or more.
    if (Math.max.apply(Math, datesToCompare) == Math.min.apply(Math, datesToCompare)) {
        console.log('Dates match');
        updateSodarLog('Timestamp: ' + formatTimestamp(Math.max.apply(Math, datesToCompare)), true);
        for (var i = 0; i < this.ActiveStations.length; i++) {
            this.ActiveStations[i].isCurrent = true;
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
            manager.ActiveStations[id].isCurrent = date == checkDate;
        });
        updateSodarLog('Timestamp: ' + formatTimestamp(checkDate), true);
    }
};
