__author__ = 'Taylor'
from django.conf.urls import url
from leaa import visViews


urlpatterns = [
    url(r'^getVectors/', visViews.getVectors),
    url(r'^getData/', visViews.getData),

    ]
