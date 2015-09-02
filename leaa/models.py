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
    #path = models.FilePathField() #TODO: Add mechanism to refer to a file on the server with the binary data
                                   # so that we can submit the correct data to the client

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
    utmX    = models.IntegerField()
    utmY    = models.IntegerField()
    terrain = models.ForeignKey('Terrain')

    def __str__(self):
        return self.name

# Mimic a .SDR file, we collect the initial and ending timestamp from the file (first/last)
# We then collect the height readings, and then we related tables off of those heights
class Sodar(models.Model):
    recordDate = models.DateTimeField(auto_now=False, auto_now_add=False)
    station = models.ForeignKey('Station')  # A station can have many SODAR files

    def __str__(self):
        return str(self.recordDate)

# Relates the arrow vectors with each specific height, speed and direction
class Record(models.Model):
    height = models.PositiveIntegerField()
    sodar = models.ForeignKey('Sodar')
    vcl = models.FloatField()               # speed
    dcl = models.IntegerField()             # direction in degrees

    def __str__(self):
        return str(self.height) + ' - ' + str(self.sodar)

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
