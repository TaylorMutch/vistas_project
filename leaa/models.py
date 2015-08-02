from django.db import models
from django.contrib.auth.models import User
# Create your models here.

# Contains info specific to the Terrain that needs to be generated
class Terrain(models.Model):
    nLat = models.FloatField()
    sLat = models.FloatField()
    eLat = models.FloatField()
    wLat = models.FloatField()
    nLong = models.FloatField()
    sLong = models.FloatField()
    eLong = models.FloatField()
    wLong = models.FloatField()
    #path = models.FilePathField() #do we need this?

# Contains Latitude/Longitude to orient the station with a terrain
class Station(models.Model):
    latitude = models.FloatField()
    longitude = models.FloatField()
    terrain = models.ForeignKey('Terrain')

# Mimic a .SDR file, we collect the initial and ending timestamp from the file (first/last)
# We then collect the height readings, and then we related tables off of those heights
class Sodar(models.Model):
    beginTimestamp = models.DateTimeField(auto_now=False, auto_now_add=False)
    endTimestamp = models.DateTimeField(auto_now=False, auto_now_add=False)
    station = models.ForeignKey('Station') # A station can have many SODAR files
    #TODO: How do we do heights in Django model/database in general?

class SodarInstance(models.Model):  #maybe add heightID of some kind to allow us the proper model generation?
    sodar = models.ForeignKey('Sodar')
    #TODO: Figure out how to add in the correct model for the arrays


class Setting(models.Model):
    vectorLength = models.IntegerField()
    vectorHeight = models.IntegerField()
    #TODO: Add in color picker for vectorColor
    terrainScale = models.IntegerField()
    animationSpeed = models.IntegerField()
    user = models.OneToOneField(User, primary_key=True)

class TerrainView(models.Model):
    controlPos = (models.FloatField(), models.FloatField(), models.FloatField())
    cameraPos = (models.FloatField(), models.FloatField(), models.FloatField())
    worldPos = (models.FloatField(), models.FloatField(), models.FloatField())
