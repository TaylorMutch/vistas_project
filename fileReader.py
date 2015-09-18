__author__ = 'Taylor'

#from django.core.files.base import ContentFile, File
from leaa.models import WindVector, Record, DataFile, Station
from django.utils import timezone
'''
Reads in a SoDAR file and creates entries in our database to query upon.

file array length is a multiple of 136 because there are 1 header and 135 variable arrays

    for each record i in the datafile:
        line i*index, substr(4-20) contains the recordDate
        line i*index+1 contains the heights array (only need to get this once)
        line i*index + 121 contains VCL array
        line i*index + 122 contains DCL array

'''

# speeds_f = [[float(i) for i in lst] for lst in speeds] #converts str vals to float vals

def DataFileReader(filePath, stationName):

    #with open("leaa/static/leaa/resources/mcrae/0101.sdr", "r") as datafile:
    with open(filePath, 'r') as datafile:
        data = datafile.readlines()
    datafile.close()
    numLines = len(data)
    numRecords = int(numLines/136)  # 136 is the number of variables
    dates = []
    speeds = []
    directions = []

    heights = data[1].strip().split()[1:]
    '''
    For each record in the datafile
        Get the date of the record
        Get the array of wind speeds (as floats)
        Get the direction of wind (as floats)
    '''
    for i in range(0,numRecords):
        dates.append(data[i*136][4:16])     #can remain as strings for now
        speeds.append([float(j) for j in data[i*136 + 121].strip().split()[1:]])
        directions.append([float(j) for j in data[i*136 + 122].strip().split()[1:]])

    # check to see if all the numbers match up
    #print(len(dates))
    #print(len(speeds))
    #print(len(directions))

    result = {'dates' : dates, 'speeds': speeds, 'directions': directions}
    return result


    # Now that we have some data to work with, lets create some model instances


    #station = Station.objects.filter(name=stationName)

    #newDataFile = DataFile(creationDate=timezone.now(), station=station[0].id, fileName="Test me")
