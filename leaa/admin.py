from django.contrib import admin

# Register your models here.

from .models import *

admin.site.register(Terrain)
admin.site.register(Station)
admin.site.register(Sodar)
admin.site.register(SodarInstance)
admin.site.register(Setting)