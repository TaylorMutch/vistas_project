from django.shortcuts import render
from leaa.models import Terrain,Station,DataFile,TerrainView,Setting
from leaa.serializers import *
from rest_framework import generics, permissions, renderers, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse
from django.contrib.auth.models import User
from .forms import TerrainForm

# Create your views here.


@api_view(('GET',))
def api_root(request):
    return Response({
        'users': reverse('user-list', request=request),
        'terrains': reverse('terrain-list', request=request),
        'stations': reverse('station-list', request=request),
        'datafiles': reverse('datafile-list', request=request),
    })


def index(request):
    # TODO: Replace with arbitrary user lookup
    user = User.objects.filter(id=2)[0]
    return render(request, 'leaa/index.html', {'user': user})


def add_terrain(request):
    form = TerrainForm()
    return render(request, 'leaa/forms/add_terrain.html', {'form': form})


def test(request):
    return render(request, 'leaa/test_index.html')


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
