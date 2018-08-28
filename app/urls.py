from django.urls import re_path, path
from . import views

urlpatterns = [
    # re_path('^main/.*', views.index, name='index'),
    path('main/', views.index),
    path('settings/', views.index),
    path('api/parts/', views.parts),
    path('api/parts/<int:part_id>/', views.parts),
    path('api/categories/', views.categories),
    path('api/categories/<int:category_id>/', views.categories),
    path('api/words/', views.words),
    path('api/words/hard/', views.words_hard),
    path('api/words/category/<int:category_id>/', views.words_get_category),
    path('api/words/self/<int:word_id>/', views.words_get_self)
]