__author__ = 'Taylor'

from rest_framework import serializers
from leaa.models import *
from django.contrib.auth.models import User


class TerrainSerializer(serializers.ModelSerializer):

    class Meta:
        model = Terrain

class StationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Station

class SodarSerializer(serializers.ModelSerializer):

    class Meta:
        model = Sodar

class RecordSerializer(serializers.ModelSerializer):

    class Meta:
        model = Record

class TerrainViewSerializer(serializers.ModelSerializer):

    class Meta:
        model = TerrainView

class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User