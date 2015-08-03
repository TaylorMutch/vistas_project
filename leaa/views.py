from django.shortcuts import render
from django.http import JsonResponse, HttpResponse

# Create your views here.

def index(request):
    return HttpResponse("Hello Dave. I see that you finally found me.")