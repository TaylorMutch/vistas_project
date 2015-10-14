from django.db import models
from django.contrib.auth.models import User
# Create your models here.

# Contains info specific to the Terrain that needs to be generated
class Terrain(models.Model):
    name = models.CharField(max_length=100)
    MAPx = models.IntegerField()
    MAPy = models.IntegerField()
    DEMx = models.IntegerField()
    DEMy = models.IntegerField()
    maxHeight = models.IntegerField()
    user = models.ManyToManyField(User)
    fileName = models.CharField(max_length=100)

    #utm_MINy = models.FloatField() #TODO: Determine whether these are actually necessary for any of this.
    #utm_MAXy = models.FloatField()
    #utm_MINx = models.FloatField()
    #utm_MAXx = models.FloatField()
    #NE_LAT   = models.FloatField()
    #NE_LONG  = models.FloatField()
    #NW_LAT   = models.FloatField()
    #NW_LONG  = models.FloatField()
    #SE_LAT   = models.FloatField()
    #SE_LONG  = models.FloatField()
    #SW_LAT   = models.FloatField()
    #SW_LONG  = models.FloatField()

    def __str__(self):
        return self.name

# Contains Latitude/Longitude to orient the station with a terrain
class Station(models.Model):
    name    = models.CharField(max_length=100)
    lat     = models.FloatField()
    long    = models.FloatField()
    demX    = models.IntegerField()
    demY    = models.IntegerField()
    utmX    = models.IntegerField()
    utmY    = models.IntegerField()
    terrain = models.ForeignKey('Terrain')

    def __str__(self):
        return self.name

# Mimic a .SDR file, we collect the initial and ending timestamp from the file (first/last)
class DataFile(models.Model):
    creationDate = models.DateField(auto_now_add=False)  #TODO: Revise this to be the date at which the data was created
    station = models.ForeignKey('Station')
    terrain = models.ForeignKey('Terrain')
    fileName = models.CharField(max_length=50)

    #def __str__(self):
    #    return self.fileName + ' - ' + str(self.creationDate)


class Setting(models.Model):
    vectorLength = models.IntegerField()
    vectorHeight = models.IntegerField()
    #TODO: Add in color picker for vectorColor
    terrainScale = models.IntegerField()
    animationSpeed = models.IntegerField()
    user = models.OneToOneField(User, primary_key=True)

    def __str__(self):
        user_name = "testname"
        return user_name + ' ' + str(self.user_id)

class TerrainView(models.Model):
    controlPos = (models.FloatField(), models.FloatField(), models.FloatField())
    cameraPos = (models.FloatField(), models.FloatField(), models.FloatField())
    worldPos = (models.FloatField(), models.FloatField(), models.FloatField())

import datetime