__author__ = 'Taylor'

#from django.core.files.base import ContentFile, File
from leaa.models import WindVector, Record, DataFile, Station
import os
from vistas_project_alpha.settings import SODAR_DIR
from django.utils import timezone
from datetime import datetime
'''
Reads in a SoDAR file and creates entries in our database to query upon.

file array length is a multiple of 136 because there are 1 header and 135 variable arrays

    for each record i in the datafile:
        line i*index, substr(4-20) contains the recordDate
        line i*index+1 contains the heights array (only need to get this once)
        line i*index + 121 contains VCL array
        line i*index + 122 contains DCL array
'''


def readSDR(fileName, stationName):

    with open(os.path.join(SODAR_DIR, stationName + '/' + fileName + '.sdr')) as datafile:
        data = datafile.readlines()
    datafile.close()
    numLines = len(data)  # TODO: Search for factors based on a variable flag - can't always trust the files to line up
    numRecords = int(numLines/136)  # 136 is the number of variables
    dates = []
    speeds = []
    directions = []

    heights = [int(i) for i in data[1].strip().split()[1:]]
    '''
    For each record in the datafile
        Get the date of the record (as datetime)
        Get the array of wind speeds (as floats)
        Get the direction of wind (as floats)
    '''
    for i in range(0,numRecords):
        #dates.append(sdrDateToDatetime(data[i*136][4:16]))     #can remain as strings for now
        dates.append(data[i*136][4:16])
        speeds.append([float(j) for j in data[i*136 + 121].strip().split()[1:]])
        directions.append([float(j) for j in data[i*136 + 122].strip().split()[1:]])

    return heights, dates, speeds, directions


    # Now that we have some data to work with, lets create some model instances


def sdrDateToDatetime(sdrDate):
    year = 2000 + int(sdrDate[0:2])
    month = int(sdrDate[2:4])
    day = int(sdrDate[4:6])
    hour = int(sdrDate[6:8])
    minute = int(sdrDate[8:10])
    sec = int(sdrDate[10:12])
    time = datetime(year, month, day, hour, minute, sec)
    return time


'''
    Generate models based off of the data retrieved from disk
'''

#TODO: Either rework or remove this.

'''
def generateModels(filePath, stationName):

    if (filePath is None or stationName is None):
        return "Error - bad filepath"
    # Identify which station we are linking the DataFile to.
    station = Station.objects.filter(name=stationName)[0]  #should only return one station

    # Generate a new DataFile model instance
    time = timezone.now()
    newDataFile = DataFile(creationDate=time, station=station, fileName=filePath)
    newDataFile.save()
    print("New DataFile - " + filePath)
    # For each date, generate a record
    heights, dates, speeds, directions = readSDR(filePath)
    for date in dates:
        newRecord = Record(recordDate=date, dataFile=newDataFile)
        newRecord.save()
        print("New Record - ")
        # For each record, generate the associated vectors
        for i in range(0, len(speeds)):
            # For each speed, generate a vector
            for j in range(0, len(speeds[i])):
                vcl = speeds[i][j]
                dcl = directions[i][j]
                height = heights[j]
                vector = WindVector(height=height, vcl=vcl, dcl=dcl, record=newRecord)
                vector.save()
    print("File added - model tables updated with new data")
'''
