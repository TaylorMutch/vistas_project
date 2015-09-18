__author__ = 'Taylor'
from leaa.serializers import *
from django.contrib.auth.models import User
from leaa.models import Terrain, Station, DataFile, Record, WindVector, TerrainView, Setting
from django.http import HttpResponse
import json
from rest_framework import status
from rest_framework.decorators import api_view


@api_view([u'GET'])
def getVectors(request):
    results = {}
    recordIDs = request.GET.getlist(u'recordIDs')
    #recordIDs = [1,2]
    if recordIDs == None:
        return HttpResponse(json.dumps(results), status=status.HTTP_404_NOT_FOUND)
    else:
        for id in recordIDs:
            vectors = WindVector.objects.filter(record=id)
            speeds = []
            directions = []
            heights = []
            for vector in vectors:
                speeds = speeds + [vector.vcl]
                directions = directions + [vector.dcl]
                heights = heights + [vector.height]
            results[id] = [speeds,directions,heights]

        return HttpResponse(json.dumps(results), status=status.HTTP_200_OK)

@api_view([u'GET'])
def getData(request):
    results = {}
    terrainID = request.GET[u'terrainID']
    stations = Station.objects.filter(terrain=terrainID)
    for station in stations:
        stationID = station.id
        datafiles = DataFile.objects.filter(station=stationID).values('id')
        results[stationID] = datafiles

    return HttpResponse(json.dumps(results), status=status.HTTP_200_OK)