from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse, HttpResponse
from django.template import RequestContext
from leaa import templates
from leaa import models

# Create your views here.

def index(request):
    # Identify our iterable objects
    Terrains = models.Terrain.objects
    # Get our names for displaying
    names = []
    for item in Terrains.values('name'):
        value = item.get('name')
        names.append(value)

    # Get the coordinates from models
    coords = []
    for item in Terrains.values('MAPx','MAPy','DEMx','DEMy','maxHeight'): #TODO: Probably a more elegant way to do this.
        MAPx = item.get('MAPx')
        MAPy = item.get('MAPy')
        DEMx = item.get('DEMx')
        DEMy = item.get('DEMy')
        maxHeight = item.get('maxHeight')
        result = [MAPx,MAPy,DEMx,DEMy,maxHeight]
        coords.append(result)
    terrain_list = zip(names,coords)
    return render(request, 'leaa/index.html', {'terrain_list': terrain_list})

def tester(request):
    return render(request, 'leaa/base_terrain.html')

