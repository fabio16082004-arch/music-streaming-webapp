from django.urls import path, include
from catalog import views
urlpatterns = [
    path('search/', views.global_search_view, name='search'),
]