__author__ = 'Taylor'
import json

from django.http import HttpResponse
from rest_framework import status

from rest_framework.decorators import api_view

from leaa.models import Terrain, Station, DataFile
from fileReader import readSDR, readRecordDateToString, dateStringToDate

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