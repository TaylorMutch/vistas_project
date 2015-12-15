__author__ = 'Taylor'

from rest_framework import serializers
from leaa.models import *
from django.contrib.auth.models import User


class TerrainSerializer(serializers.HyperlinkedModelSerializer):

    url = serializers.HyperlinkedIdentityField(view_name='terrain-detail', format='json')

    class Meta:
        model = Terrain
        fields = ('id', 'url', 'name', 'MAPx', 'MAPy', 'DEMx', 'DEMy',
                  'maxHeight', 'fileName', 'north_lat',
                  'south_lat', 'east_lng', 'west_lng',
                  )


class StationSerializer(serializers.HyperlinkedModelSerializer):

    url = serializers.HyperlinkedIdentityField(view_name='station-detail', format='json')

    class Meta:
        model = Station
        fields = ('id', 'url', 'name', 'lat', 'long',
                  'demX', 'demY', 'terrain',
                  )


class DataFileSerializer(serializers.HyperlinkedModelSerializer):

    url = serializers.HyperlinkedIdentityField(view_name='datafile-detail', format='json')

    class Meta:
        model = DataFile
        fields = ('id', 'creationDate',
                  'station', 'terrain',
                  'url', 'fileName',
                  )


class TerrainViewSerializer(serializers.ModelSerializer):

    class Meta:
        model = TerrainView


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User


class SettingSerializer(serializers.ModelSerializer):

    class Meta:
        model = Setting
