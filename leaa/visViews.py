__author__ = 'Taylor'
from leaa.serializers import *
from django.contrib.auth.models import User
from leaa.models import Terrain, Station, DataFile, Record, WindVector, TerrainView, Setting
from django.http import HttpResponse
import json
from rest_framework import status
from rest_framework.decorators import api_view
from fileReader import readSDR

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
'''
@api_view(['GET'])
def getVectors(request):
    results = {}
    stationName = request.GET.get('stationName')
    fileName = request.GET.get('fileName')
    heights, dates, speeds, directions = readSDR(fileName, stationName)
    results['heights'] = heights
    results['dates'] = dates
    results['speeds'] = speeds
    results['directions'] = directions
    return HttpResponse(json.dumps(results), status=status.HTTP_200_OK)


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
            names.append(file.fileName)
            IDList.append(file.id)

    results['names'] = names
    results['IDList'] = IDList
    return HttpResponse(json.dumps(results), status=status.HTTP_200_OK)