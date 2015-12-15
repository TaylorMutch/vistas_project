from django.shortcuts import render, redirect, render_to_response
from django.http import HttpResponseRedirect
from leaa.models import Terrain, Station, DataFile, TerrainView, Setting
from leaa.serializers import *
from rest_framework import generics, permissions, renderers, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, logout, authenticate
from leaa.forms import TerrainForm, StationForm, DataFileForm, UserForm
from leaa.permissions import IsOwnerOrReadOnly
from create_models import *
import os
from fileReader import sdrDateToString_YYYYMMDD
import zipfile as z
# Create your views here.


@api_view(('GET',))
def api_root(request):
    return Response({
        'terrains'  : reverse('terrain-list', request=request),
        'stations'  : reverse('station-list', request=request),
        'datafiles' : reverse('datafile-list', request=request),
    })


def login_view(request):
    if request.method == 'POST':

        redirect_to = request.POST.get('next', request.GET.get('next', ''))

        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(username=username, password=password)
        if user is not None:
            if user.is_active:
                login(request, user)
                if redirect_to is not "":
                    return HttpResponseRedirect(redirect_to)
                else:
                    return redirect('leaa.views.index')
        return render(request, 'leaa/forms/login.html')
    else:
        return render(request, 'leaa/forms/login.html')


def logout_view(request):
    logout(request)
    return redirect('leaa.views.index') # redirect to logout page


def add_user(request):
    if request.method == 'POST':
        form = UserForm(request.POST)
        if form.is_valid():
            new_user = User.objects.create_user(**form.cleaned_data)
            return redirect('leaa.views.index')
    else:
        form = UserForm()
    return render(request, 'leaa/forms/signup.html', {'form':form})


def index(request):
    return render(request, 'leaa/index.html')


@login_required
def add_noform(request):
    return render(request, 'leaa/forms/no_form.html')


@login_required
def add_terrain(request):
    if request.method == "POST":
        form = TerrainForm(request.POST)
        if form.is_valid():
            create_terrain(request.user, request.POST['name'],request.POST['north_lat'],request.POST['south_lat'],
                           request.POST['east_lng'],request.POST['west_lng'],request.POST['DEMx'],request.POST['DEMy'],)
            return redirect('leaa.views.index')
    else:
        form = TerrainForm()
    return render(request, 'leaa/forms/add_terrain.html', {'form': form})


@login_required
def add_station(request):
    if request.method == "POST":
        form = StationForm(request.POST)
        if form.is_valid():
            t = Terrain.objects.filter(pk=int(request.POST['terrain']))[0]
            lat = float(request.POST['lat'])
            long = float(request.POST['long'])
            # check if the station actually lies inside of the specified terrain
            if lat <= t.north_lat and lat >= t.south_lat and long <= t.east_lng and long >= t.west_lng:
                name = request.POST['name']
                create_station(request.user, name, t, lat, long)
                return redirect('leaa.views.index')
            else:
                form = StationForm()
                render(request, 'leaa/forms/add_station.html', {'form': form})
    else:
        form = StationForm()
    return render(request, 'leaa/forms/add_station.html', {'form': form})


@login_required
def add_datafile(request):
    if request.method == "POST":
        form = DataFileForm(request.POST, request.FILES)
        if form.is_valid():
            s = Station.objects.get(pk=int(request.POST['station']))
            t = Terrain.objects.get(pk=int(request.POST['terrain']))

            # Validate that the station is in the terrain
            if s.terrain == t:
                # Determine which filetype we got # TODO: Add more security than this, this is easily thwarted...
                uf = request.FILES['file']
                file_ext = os.path.splitext(uf.name)[1]
                # We got a single file
                if file_ext == '.sdr':
                    date = uf.readline(16).decode('ascii')
                    date = sdrDateToString_YYYYMMDD(date[4:])

                    d_path = os.path.join(MEDIA_ROOT, t.name + '/' + s.name + '/' + date[:4] + '/')
                    if not os.path.exists(d_path):
                        os.mkdir(d_path)
                    with open(os.path.join(d_path, uf.name), 'wb') as d_file:
                        for chunk in uf.chunks():
                            d_file.write(chunk)
                    d = DataFile(owner=request.user,creationDate=date,station=s,terrain=t,fileName=uf.name)
                    d.save()
                # We got a .zip
                elif file_ext == '.zip':
                    zf = z.ZipFile(uf, 'r')
                    for file in zf.namelist():
                        filename = os.path.basename(file)
                        data = zf.read(file)
                        date = data[4:16].decode('ascii')
                        date = sdrDateToString_YYYYMMDD(date)
                        d_path = os.path.join(MEDIA_ROOT, t.name + '/' + s.name + '/' + date[:4] + '/')
                        if not os.path.exists(d_path):
                            os.mkdir(d_path)

                        d_file = open(os.path.join(d_path, filename), 'wb')
                        d_file.write(data)
                        d_file.close()
                        d = DataFile(owner=request.user,creationDate=date,station=s,terrain=t,fileName=filename)
                        d.save()
                else:
                    form = DataFileForm()
                    return render(request, 'leaa/forms/add_datafile.html', {'form': form})
                return redirect('leaa.views.index')
            return render(request, 'leaa/forms/add_datafile.html', {'form': DataFileForm()})
    else:
        form = DataFileForm()
    return render(request, 'leaa/forms/add_datafile.html', {'form': form})


class TerrainList(generics.ListAPIView):
    queryset = Terrain.objects.all()
    serializer_class = TerrainSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    #def perform_create(self, serializer):
    #    serializer.save(owner=self.request.user)

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)


class TerrainDetail(generics.RetrieveUpdateDestroyAPIView):

    queryset = Terrain.objects.all()
    serializer_class = TerrainSerializer
    permission_classes = (IsOwnerOrReadOnly,)


class StationList(generics.ListAPIView):
    queryset = Station.objects.all()
    serializer_class = StationSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)


class StationDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Station.objects.all()
    serializer_class = StationSerializer
    permission_classes = (IsOwnerOrReadOnly,)


class DataFileList(generics.ListAPIView):
    queryset = DataFile.objects.all()
    serializer_class = DataFileSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)


class DataFileDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = DataFile.objects.all()
    serializer_class = DataFileSerializer
    permission_classes = (IsOwnerOrReadOnly,)
