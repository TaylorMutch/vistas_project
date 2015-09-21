__author__ = 'Taylor'

#from django.core.files.base import ContentFile, File
from leaa.models import WindVector, Record, DataFile, Station
import os
from vistas_project_alpha.settings import SODAR_DIR
from django.utils import timezone
from datetime import datetime, date
'''
Reads in a SoDAR file and creates entries in our database to query upon.

file array length is a multiple of 136 because there are 1 header and 135 variable arrays

    for each record i in the datafile:
        line i*index, substr(4-20) contains the recordDate
        line i*index+1 contains the heights array (only need to get this once)
        line i*index + 121 contains VCL array
        line i*index + 122 contains DCL array
'''

months = [None, "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

tags   = {'DCL', 'VCL', 'SDR'}

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
        #dates.append(sdrDateToDatetime(data[i*136][4:16])) TODO: Remove this line if we go with string implementation
        #dates.append(data[i*136][4:16])         #dates.append(sdrDateToDatetime(data[i*136][4:16]))
        dates.append(sdrDateToString(data[i*136][4:16]))
        speeds.append([float(j) for j in data[i*136 + 121].strip().split()[1:]])
        directions.append([float(j) for j in data[i*136 + 122].strip().split()[1:]])

    return heights, dates, speeds, directions




def readRecordDateToDatetime(fileName, stationName):
    with open(os.path.join(SODAR_DIR, stationName + '/' + fileName + '.sdr')) as f:
        data = f.readline(16)
    f.close()
    date = sdrDateToDatetime(data[4:])
    return date


def readRecordDateToString(fileName, stationName):
    with open(os.path.join(SODAR_DIR, stationName + '/' + fileName + '.sdr')) as f:
        data = f.readline(16)
    f.close()
    date = sdrDateToString(data[4:])
    date = date[:11]
    return date


def createDataFile(fileName, stationName, creationDate):
    station_match = Station.objects.filter(name=stationName)[0]
    newDataFile = DataFile(station=station_match, fileName=fileName, creationDate=creationDate)
    newDataFile.save()
    print('Added ' + fileName + ' to station' + stationName)


def dateStringToDate(strDate):
    _date = date(int(strDate[:4]),int(strDate[4:6]),int(strDate[6:]))
    return _date

def sdrDateToDatetime(sdrDate):
    year = 2000 + int(sdrDate[0:2])
    month = int(sdrDate[2:4])
    day = int(sdrDate[4:6])
    hour = int(sdrDate[6:8])
    minute = int(sdrDate[8:10])
    sec = int(sdrDate[10:12])
    time = datetime(year, month, day, hour, minute, sec)
    return time


def sdrDateToString(sdrDate):
    year = str(2000 + int(sdrDate[0:2]))
    month = months[int(sdrDate[2:4])]
    day = str(int(sdrDate[4:6]))
    hour = sdrDate[6:8]
    minute = sdrDate[8:10]
    sec = sdrDate[10:12]
    time =  day +' '+month+', ' + year +' - ' + hour+':' + minute +':'+ sec
    return time


