from django.db import models
from django.db.models.signals import pre_delete
from django.dispatch import receiver
from django.contrib.auth.models import User
import logging, os
from vistas_project_alpha.settings import MEDIA_ROOT

logger = logging.getLogger('valcex.logger')

class Terrain(models.Model):
    '''
        A terrain with a north/south latitude and east/west longitude bounding box
    '''
    name = models.CharField(max_length=100)
    owner = models.ForeignKey('auth.User')
    MAPx = models.IntegerField()
    MAPy = models.IntegerField()
    DEMx = models.IntegerField()
    DEMy = models.IntegerField()
    maxHeight = models.IntegerField()
    fileName = models.CharField(max_length=100)
    north_lat = models.FloatField()
    south_lat = models.FloatField()
    east_lng = models.FloatField()
    west_lng = models.FloatField()

    def __str__(self):
        return self.name


class Station(models.Model):
    '''
        A station located within a terrain's bounding box
    '''
    name    = models.CharField(max_length=100)
    owner   = models.ForeignKey('auth.User')
    lat     = models.FloatField()
    long    = models.FloatField()
    demX    = models.IntegerField()
    demY    = models.IntegerField()
    terrain = models.ForeignKey('Terrain')

    def __str__(self):
        return self.name


class DataFile(models.Model):
    '''
        Django representation of datafiles that can be sent to the application
    '''
    owner = models.ForeignKey('auth.User')
    creationDate = models.DateField(auto_now_add=False)
    station = models.ForeignKey('Station')
    terrain = models.ForeignKey('Terrain')
    fileName = models.CharField(max_length=50)
    #filePath = models.FileField(upload_to=datafile_directory_path)

    def __str__(self):
        return str(self.creationDate)


class Setting(models.Model):
    '''
        Settings for a user looking at a specific terrain/visualization
    '''
    vectorLength = models.FloatField(default=1)
    vectorHeight = models.FloatField(default=1)
    vectorColor = models.CharField(default='#ffff00', max_length=8)
    sceneHeight = models.FloatField(default=1)
    liveUpdate = models.BooleanField(default=False)
    user = models.ForeignKey(User)
    terrain = models.ForeignKey('Terrain')


class TerrainView(models.Model):
    '''
        Camera positions with respect to a given terrain
    '''
    name  = models.CharField(max_length=50)
    pos_x = models.FloatField()
    pos_y = models.FloatField()
    pos_z = models.FloatField()
    terrain = models.ForeignKey('Terrain')
    user = models.ForeignKey(User)


@receiver(pre_delete, sender=DataFile)
def delete_sodar_file(sender, instance, **kwargs):
    '''
        We handle deleting sodar files manually based on the project structure
    '''
    file = os.path.join(MEDIA_ROOT, "{0}/{1}/{2}/{3}"
                        .format(instance.terrain.name,
                                instance.station.name,
                                instance.creationDate.year,
                                instance.fileName)
                        )
    os.remove(file)
    logger.info("Deleted record {0} from station {1}".format(instance.creationDate, instance.station.name))