from django.urls import path, include

from catalog.views import SearchView, SearchResultsView

urlpatterns = [
    path('search/', SearchView.as_view(), name='search'),
    path('search/results/', SearchResultsView.as_view(), name='search-results'),
]