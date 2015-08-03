from django.db import models
from django.contrib.auth.models import User
# Create your models here.

# Contains info specific to the Terrain that needs to be generated
class Terrain(models.Model):
    yMin = models.FloatField()
    yMax = models.FloatField()
    xMin = models.FloatField()
    xMax = models.FloatField()
    user = models.ManyToManyField(User)
    #path = models.FilePathField() #do we need this?

# Contains Latitude/Longitude to orient the station with a terrain
class Station(models.Model):
    latitude = models.FloatField()
    longitude = models.FloatField()
    terrain = models.ForeignKey('Terrain')

# Mimic a .SDR file, we collect the initial and ending timestamp from the file (first/last)
# We then collect the height readings, and then we related tables off of those heights
class Sodar(models.Model):
    recordDate = models.DateTimeField(auto_now=False, auto_now_add=False)
    station = models.ForeignKey('Station')  # A station can have many SODAR files

# Relates the arrow vectors with each specific height, speed and direction
class Record(models.Model):
    height = models.PositiveIntegerField()
    sodar = models.ForeignKey('Sodar')
    vcl = models.FloatField()               # speed
    dcl = models.IntegerField()             # direction in degrees

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
