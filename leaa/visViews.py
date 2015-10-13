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
    return HttpResponse(json.dumps(results), status=status.HTTP_200_OK)


@api_view(['GET'])
def getDates(request):
    #results = {}
    terrainID = request.GET.get('terrainID')
    stations = Station.objects.filter(terrain=terrainID)
    dates = []
    stationNames = []
    for station in stations:
        stationNames.append(station.name)
        datafile = DataFile.objects.filter(station=station)
        for file in datafile:
            date = str(file.creationDate)[:10]
            if not (date in dates):
                dates.append(date)
    result = {'dates':dates, 'stationNames':stationNames}
    return HttpResponse(json.dumps(result), status=status.HTTP_200_OK)


@api_view(['GET'])
def getStationObjects(request):
    stationNames = request.GET.getlist('stations[]')
    recordDate = str(request.GET.get('recordDate'))
    result = {}
    datafiles = DataFile.objects.filter(creationDate=recordDate)
    for stationName in stationNames:
        stationResult = {}
        station = Station.objects.filter(name=stationName)[0] # There should only return one
        for file in datafiles:
            # Get data from file on disk
            heights, dates, speeds, directions = readSDR(file.fileName, station.name)
            stationResult = {'heights': heights, 'dates': dates, 'speeds': speeds, 'directions': directions}
            # Get data from sqlite db
            stationResult['name']       = station.name
            stationResult['demX']       = station.demX
            stationResult['demY']       = station.demY
            stationResult['utmY']       = station.utmY
            stationResult['utmX']       = station.utmX
            stationResult['lat']        = station.lat
            stationResult['long']       = station.long
            stationResult['terrain']    = station.terrain_id
            stationResult['id'] = station.id
        result[stationName] = stationResult
    return HttpResponse(json.dumps(result), status=status.HTTP_200_OK)