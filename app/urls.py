from django.urls import re_path, path
from . import views

urlpatterns = [
    # re_path('^main/.*', views.index, name='index'),
    path('main/', views.index, name='index'),
    path('api/parts/<int:part_id>/', views.parts, name='parts'),
]