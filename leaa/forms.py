__author__ = 'Taylor'

from django import forms

from .models import Terrain

class TerrainForm(forms.ModelForm):

    class Meta:
        model = Terrain
        fields = ('name','north_lat','south_lat','east_lng','west_lng')
        # Only forms needed, rest is processed