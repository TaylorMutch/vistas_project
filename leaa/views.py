from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.template import RequestContext
from leaa import templates

# Create your views here.

def index(request):
    return render(request, 'leaa/index.html')
