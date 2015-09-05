from django.shortcuts import render, get_object_or_404
import json
from django.core.serializers.json import DjangoJSONEncoder
from leaa.models import Terrain,Station,Sodar,Record,TerrainView,Setting
from leaa.serializers import *
from rest_framework import generics, permissions, renderers
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse
from django.contrib.auth.models import User
# Create your views here.


@api_view(('GET',))
def api_root(request):
    return Response({
        'users': reverse('user-list', request=request),
        'terrains': reverse('terrain-list', request=request),
        'stations': reverse('station-list', request=request),
        'sodars': reverse('sodar-list', request=request),
        'records': reverse('record-list',request=request),
    })


class TerrainList(generics.ListAPIView):
    queryset = Terrain.objects.all()
    serializer_class = TerrainSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

class TerrainDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Terrain.objects.all()
    serializer_class = TerrainSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)


class StationList(generics.ListAPIView):
    queryset = Station.objects.all()
    serializer_class = StationSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)


class StationDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Station.objects.all()
    serializer_class = StationSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)


class SodarList(generics.ListAPIView):
    queryset = Sodar.objects.all()
    serializer_class = SodarSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)


class SodarDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Sodar.objects.all()
    serializer_class = SodarSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)


class RecordList(generics.ListAPIView):
    queryset = Record.objects.all()
    serializer_class = RecordSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)


class RecordDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Record.objects.all()
    serializer_class = RecordSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)


class UserList(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class UserDetail(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

def index(request):
    # Identify our iterable objects
    Terrains = Terrain.objects
    Stations = Station.objects
    Sodars   = Sodar.objects
    Records  = Record.objects
    Settings = Setting.objects


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

