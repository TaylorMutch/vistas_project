__author__ = 'Taylor'
import json

from django.http import HttpResponse
from rest_framework import status

from rest_framework.decorators import api_view

from leaa.models import Terrain, Station, DataFile
from fileReader import readSDR, readRecordDateToString, dateStringToDate

'''
    Returns a simple list of terrain names
'''
@api_view(['GET'])
def getTerrainNames(request):
    names = []
    terrains = Terrain.objects.all()
    for terrain in terrains:
        names.append(terrain.name)
    return HttpResponse(json.dumps(names), status=status.HTTP_200_OK)

'''
    Returns a list of stations with their demX and demY coordinates,
    which is then converted by frontend code to 3D objects
'''
@api_view(['GET'])
def getStations(request):
    results = {}
    terrainName = request.GET.get('terrainName')
    terrain = Terrain.objects.filter(name=terrainName)[0] #Should only return one terrain instance
    stations = Station.objects.filter(terrain=terrain)
    #results['']
    for station in stations:
        name = station.name
        values = [station.demX, station.demY]
        results[name] = values
    return HttpResponse(json.dumps(results), status=status.HTTP_200_OK)

'''
    Returns the necessary arrays for computing 3D vectors
    Arrays get returned as 2D arrays
    speeds[i][j] is the ith speed (in the ith record) at the jth height
'''
@api_view(['GET'])
def getVectors(request):
    results = {}
    stationNames = request.GET.getlist('stations[]')
    recordDate = str(request.GET.get('recordDate'))
    #date = dateStringToDate(recordDate)
    datafiles = DataFile.objects.filter(creationDate=recordDate)
    for stationName in stationNames:
        station = Station.objects.filter(name=stationName)[0]
        for file in datafiles:
            #if file.station is station:
                heights, dates, speeds, directions = readSDR(file.fileName, station.name)
                result = {'heights': heights, 'dates': dates, 'speeds': speeds, 'directions': directions}
                results[stationName] = result

    #heights, dates, speeds, directions = readSDR(fileName, stationName)
    #results['heights'] = heights
    #results['dates'] = dates
    #results['speeds'] = speeds
    #results['directions'] = directions
    return HttpResponse(json.dumps(results), status=status.HTTP_200_OK)


#TODO: Rework or remove
@api_view(['GET'])
def getDataFiles(request):
    results = {}
    terrainID = request.GET.get('terrainID')
    stations = Station.objects.filter(terrain=terrainID)
    names = []
    IDList = []
    for station in stations:
        datafile = DataFile.objects.filter(station=station)
        for file in datafile:
            #results[file.fileName] = file.id
            results[str(file.id)] = [file.fileName, readRecordDateToString(file.fileName, station.name)]
            #names.append(file.fileName)
            #IDList.append(file.id)

    #results['names'] = names
    #results['IDList'] = IDList
    return HttpResponse(json.dumps(results), status=status.HTTP_200_OK)


@api_view(['GET'])
def getDates(request):
    #results = {}
    terrainID = request.GET.get('terrainID')
    stations = Station.objects.filter(terrain=terrainID)
    dates = []
    for station in stations:
        datafile = DataFile.objects.filter(station=station)
        for file in datafile:
            date = str(file.creationDate)[:10]
            if not (date in dates):
                dates.append(date)
    return HttpResponse(json.dumps(dates), status=status.HTTP_200_OK)