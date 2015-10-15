/**
 * Created by Taylor on 10/11/2015.
 */
/**
 * Abstract timeline for moving timeline events forward and back.
 * @param beginTime
 * @param endTime
 * @param currentTime
 * @param timeStep
 * @constructor
 */
function Timeline(beginTime, endTime, currentTime, timeStep) {
    this.startTime = beginTime;
    this.endTime = endTime;
    this.currentTime = currentTime;
    this.timeStep = timeStep;
}

Timeline.prototype.Forward = function()
{
    if (this.currentTime + this.timeStep < this.endTime) {
        this.currentTime += this.timeStep;
    }
};

Timeline.prototype.Backward = function()
{
    if (this.currentTIme - this.timeStep >= this.startTime) {
        this.currentTime -= this.timeStep;
    }
};

/*
function v_time(timestamp) {
    this.year = null;
    this.month = null;
    this.day = null;
    this.hour = null;
    this.minute = null;
    this.second = null;
}
*/