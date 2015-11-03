__author__ = 'Taylor'

from django import forms
from django.forms import ModelForm
from django.contrib.auth import login
from django.views.generic.edit import FormView
from django.http import HttpResponseRedirect
from .models import Terrain, Station, DataFile
from django.contrib.auth.models import User
from django.contrib.auth.forms import AuthenticationForm


class UserForm(ModelForm):

    class Meta:
        model = User
        fields = ('username', 'email', 'password')


class TerrainForm(ModelForm):

    class Meta:
        model = Terrain
        fields = ('name','north_lat','south_lat','east_lng','west_lng','DEMx','DEMy')


class StationForm(ModelForm):

    class Meta:
        model = Station
        fields = ('name','terrain','lat','long')


class DataFileForm(ModelForm):

    file = forms.FileField(
        label='Select a file (.zip or .sdr only):'
    )

    class Meta:
        model = DataFile
        fields = ('station','terrain')