__author__ = 'Taylor'

from rest_framework import serializers
from leaa.models import *
from django.contrib.auth.models import User


class TerrainSerializer(serializers.ModelSerializer):

    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Terrain
        fields = ('id', 'name', 'MAPx', 'MAPy', 'DEMx', 'DEMy',
                  'maxHeight', 'fileName', 'north_lat',
                  'south_lat', 'east_lng', 'west_lng', 'owner',
                  )


class StationSerializer(serializers.ModelSerializer):

    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Station
        fields = ('id', 'name', 'lat', 'long',
                  'demX', 'demY', 'terrain', 'owner'
                  )


class DataFileSerializer(serializers.ModelSerializer):

    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = DataFile
        fields = ('id', 'creationDate',
                  'station', 'terrain',
                  'fileName', 'owner'
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
