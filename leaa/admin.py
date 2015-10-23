from django.contrib import admin
from django.conf.urls import patterns
from django.http import HttpResponse

# Register your models here.

from .models import *

admin.site.register(Terrain)
admin.site.register(Station)
admin.site.register(DataFile)
admin.site.register(Setting)


def my_view(request):
    return HttpResponse('Sup bro')

def get_admin_urls(urls):
    def get_urls():
        my_urls = patterns("",
            (r'^add_terrain/$', admin.site.admin_view(my_view))
        )
        return my_urls + urls
    return get_urls

admin_urls = get_admin_urls(admin.site.get_urls())
admin.site.get_urls = admin_urls
