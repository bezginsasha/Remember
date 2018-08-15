from django.urls import re_path, path
from . import views

urlpatterns = [
    # re_path('^main/.*', views.index, name='index'),
    path('main/', views.index, name='index'),
    path('api/parts/', views.parts, name='parts'),
    path('api/parts/<int:part_id>/', views.parts, name='parts'),
    path('api/categories/', views.categories, name='categories'),
    path('api/categories/<int:category_id>/', views.categories, name='categories')
]