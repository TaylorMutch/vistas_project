# __author__ = 'tmutch'
from django.conf.urls import url, include
from django.conf.urls.static import static
from rest_framework.urlpatterns import format_suffix_patterns
from leaa import views
from vistas_project_alpha import settings


urlpatterns = [
    url(r'^$', views.index, name="index"),
    #url(r'^test/', views.test, name="test"),
    url(r'^add_terrain/$', views.add_terrain, name="add_terrain"),
    url(r'^api-root/', views.api_root),
    url(r'^users/', views.UserList.as_view(),
        name='user-list'),
    url(r'^users/(?P<pk>[0-9]+)/', views.UserDetail.as_view(),
        name='user-detail'),
    url(r'^terrains/$', views.TerrainList.as_view(),
        name='terrain-list'),
    url(r'^terrains/(?P<pk>[0-9]+)/$', views.TerrainDetail.as_view(),
        name='terrain-detail'),
    url(r'^stations/$', views.StationList.as_view(),
        name='station-list'),
    url(r'^stations/(?P<pk>[0-9]+)/$', views.StationDetail.as_view(),
        name='station-detail'),
    url(r'^datafiles/$', views.DataFileList.as_view(),
        name='datafile-list'),
    url(r'^datafiles/(?P<pk>[0-9]+)/$', views.DataFileDetail.as_view(),
        name='datafile-detail'),
    url(r'^', include('leaa.visUrls')),

]

urlpatterns += [
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework'))
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns = format_suffix_patterns(urlpatterns)
