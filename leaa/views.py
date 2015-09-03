from django.shortcuts import render, get_object_or_404
import json
from django.core.serializers.json import DjangoJSONEncoder
from django.http import JsonResponse, HttpResponse
from django.template import RequestContext
from leaa import templates
from leaa import models

# Create your views here.


def index(request):
    # Identify our iterable objects
    Terrains = models.Terrain.objects
    Stations = models.Station.objects
    Sodars   = models.Sodar.objects
    Records  = models.Record.objects
    Settings = models.Setting.objects


    # Get our names for displaying
    names = []
    for item in Terrains.values('name'):
        value = item.get('name')
        names.append(value)

    # Get the coordinates from Terrain models
    TerrainCoords = []
    for item in Terrains.values('MAPx','MAPy','DEMx','DEMy','maxHeight'): #TODO: Probably a more elegant way to do this.
        MAPx = item.get('MAPx')
        MAPy = item.get('MAPy')
        DEMx = item.get('DEMx')
        DEMy = item.get('DEMy')
        maxHeight = item.get('maxHeight')
        result = [MAPx,MAPy,DEMx,DEMy,maxHeight]
        TerrainCoords.append(result)

    terrain_list = zip(names,TerrainCoords)

    # Get DEMx/y coords from Stations #TODO: Stations don't need to be presented to the user, so we don't need names
    StationCoords = []
    for item in Stations.values('demX','demY','terrain'):
        demX = item.get('demX')
        demY = item.get('demY')
        terrainID = item.get('terrain_id')
        result = [terrainID,demX,demY]
        StationCoords.append(result)

    # Get the SoDAR data
    #SodarDates = []
    #SodarIDs = []
    #for item in Sodars.values():
    #    recordDate = item.get('recordDate')
    #    sodar = item.get('station_id')
    #    result = [sodar,recordDate]
    #    SodarIDs.append(sodar)
    #    SodarDates.append(result)
    #SodarList = zip(SodarIDs,SodarDates)

    SodarList = json.dumps(list(Sodars.values()), cls=DjangoJSONEncoder)


    # Get the Records
    RecordList = []
    for item in Records.values():
        sodar = item.get('sodar_id')
        height = item.get('height')
        vcl = item.get('vcl')
        dcl = item.get('dcl')
        result = [sodar,height,vcl,dcl]
        RecordList.append(result)


    context = {'terrain_list': terrain_list, 'station_coords' : StationCoords, 'sodar_list' : SodarList, 'record_list' : RecordList}
    return render(request, 'leaa/index.html', context)


def tester(request):
    return render(request, 'leaa/base_terrain.html')

