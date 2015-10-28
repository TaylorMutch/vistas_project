from django.shortcuts import render, redirect
from leaa.models import Terrain,Station,DataFile,TerrainView,Setting
from leaa.serializers import *
from rest_framework import generics, permissions, renderers, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse
from django.contrib.auth.models import User
from .forms import TerrainForm, StationForm, DataFileForm
from add_terrain import create_terrain
import os
from fileReader import sdrDateToString
# Create your views here.


@api_view(('GET',))
def api_root(request):
    return Response({
        #'users'     : reverse('user-list', request=request),
        'terrains'  : reverse('terrain-list', request=request),
        'stations'  : reverse('station-list', request=request),
        'datafiles' : reverse('datafile-list', request=request),
    })


def index(request):
    # TODO: Replace with arbitrary user lookup
    user = User.objects.filter(id=2)[0]
    return render(request, 'leaa/index.html', {'user': user})


def add_terrain(request):
    if request.method == "POST":
        form = TerrainForm(request.POST)
        if form.is_valid():
            create_terrain(request.POST['name'],
                           request.POST['north_lat'],
                           request.POST['south_lat'],
                           request.POST['east_lng'],
                           request.POST['west_lng'],
                           request.POST['DEMx'],
                           request.POST['DEMy'],)
            return redirect('leaa.views.index')
    else:
        form = TerrainForm()
    return render(request, 'leaa/forms/add_terrain.html', {'form': form})


def add_station(request):
    if request.method == "POST":
        form = StationForm(request.POST)
        if form.is_valid():
            #create_station() # TODO: Finish implementing this. Should be pretty easy...
            t = Terrain.objects.filter(pk=int(request.POST['terrain']))[0]
            lat = float(request.POST['lat'])
            long = float(request.POST['long'])
            if lat <= t.north_lat and lat >= t.south_lat and long <= t.east_lng and long >= t.west_lng:
                s = Station(terrain=t, lat=lat, long=long)

            return redirect('leaa.views.index')
    else:
        form = StationForm()
    return render(request, 'leaa/forms/add_station.html', {'form': form})


def add_datafile(request):
    if request.method == "POST":
        form = DataFileForm(request.POST, request.FILES)
        if form.is_valid():
            #create_datafiles() # TODO: Implement
            uf = request.FILES['filePath']
            filename, file_ext = os.path.splitext(uf)
            # We got a single file
            if file_ext == '.sdr':
                with open(request.FILES['filePath']) as file:
                    data = file.readline(16)
                file.close()
                date = sdrDateToString(data[4:])
                date = date[:11]
                s = DataFile(creationDate=date,
                             station=int(request.POST['id_station']),
                             terrrain=int(request.POST['id_terrain']),
                             filePath=uf,
                             filename=filename)
                s.save()
            # We got a .zip
            elif file_ext == '.zip':
                pass
            else:
                form = DataFileForm()
                return render(request, 'leaa/forms/add_datafile.html', {'form': form, 'error': 'Not a valid file.'})
            return redirect('leaa.views.index')
    else:
        form = DataFileForm()
    return render(request, 'leaa/forms/add_datafile.html', {'form': form})


def test(request):
    return render(request, 'leaa/test_index_w_shaders.html')


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


class DataFileList(generics.ListAPIView):
    queryset = DataFile.objects.all()
    serializer_class = DataFileSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)


class DataFileDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = DataFile.objects.all()
    serializer_class = DataFileSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

# TODO: Permission changes to actually see users? Do we even need this?

class UserList(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    #permission_classes = (permissions.IsAuthenticatedOrReadOnly)

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)


class UserDetail(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    #permission_classes = (permissions.IsAuthenticatedOrReadOnly)
