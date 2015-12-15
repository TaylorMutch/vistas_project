
from django.conf.urls import include, url

urlpatterns = [
    url(r'^', include('leaa.urls')),
    url(r'^login/$', 'leaa.views.login_view', name='login'),
    url(r'^logout/$', 'leaa.views.logout_view', name='logout'),
]
