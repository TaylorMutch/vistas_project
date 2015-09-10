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
    return render(request, 'leaa/index.html')


def base_terrain(request):
    return render(request, 'leaa/test_index.html')
