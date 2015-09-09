# __author__ = 'tmutch'
from django.conf.urls import url, include
from rest_framework.urlpatterns import format_suffix_patterns
from leaa import views


urlpatterns = [
    url(r'^old/', views.index, name="index"),
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
    url(r'^sodars/$', views.SodarList.as_view(),
        name='sodar-list'),
    url(r'^sodars/(?P<pk>[0-9]+)/$', views.SodarDetail.as_view(),
        name='sodar-detail'),
    url(r'^records/$', views.RecordList.as_view(),
        name='record-list'),
    url(r'^records/(?P<pk>[0-9]+)/$', views.RecordDetail.as_view(),
        name='record-detail'),
    url(r'^$', views.tester),
    url(r'^base/', views.base_terrain),
]

urlpatterns += [
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework'))
]

urlpatterns = format_suffix_patterns(urlpatterns)