# __author__ = 'tmutch'
from django.conf import settings
from django.conf.urls import url
from django.conf.urls.static import static

from . import views

urlpatterns = [
    url(r'^$', views.tester, name="index"),
    #url(r'^$', views.index, name="index"),
    #url(r'^test/', views.index),
]