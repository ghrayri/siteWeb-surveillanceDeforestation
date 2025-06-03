from django.urls import path, include
from rest_framework.routers import DefaultRouter
from geoapp import views
from geoapp import views_realtime
from api.views_api import receive_data
from api.views_api import register_user, custom_obtain_auth_token, get_user_profile
from api.views_activation import activate_account_api

router = DefaultRouter()
router.register(r'regions', views.RegionViewSet)
router.register(r'points', views.PointViewSet)
router.register(r'datalayers', views.DataLayerViewSet)
router.register(r'satellites', views.SatelliteViewSet)
router.register(r'satellite-images', views.SatelliteImageViewSet)
router.register(r'eo-data', views.EODataViewSet)
router.register(r'cartographicals', views.CartographicalViewSet)
router.register(r'iot-data', views.IoTDataViewSet)
router.register(r'realtime-data', views.RealTimeViewSet)
router.register(r'realtime', views.RealTimeViewSet, basename='realtime-api')
router.register(r'user-zones', views.UserZoneViewSet)
router.register(r'index-analysis', views.IndexAnalysisViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('export-region-geojson/<int:pk>/', views.export_region_geojson, name='export_region_geojson'),
    path('region-statistics/<int:pk>/', views.get_region_statistics, name='get_region_statistics'),
    path('register/', register_user, name='register'),
    path('activate/', activate_account_api, name='activate'),
    path('auth/token/', custom_obtain_auth_token, name='token'),
    path('token/', custom_obtain_auth_token, name='token_legacy'),
    path('profile/', get_user_profile, name='profile'),
    path('satellites/', views_realtime.SatelliteListView.as_view(), name='satellite-list'),
    path('satellite-tasks/fetch-images/', views_realtime.TriggerFetchSatelliteImagesView.as_view(), name='fetch-satellite-images'),
    path('satellite-tasks/process-images/', views_realtime.TriggerProcessSatelliteImagesView.as_view(), name='process-satellite-images'),
    path('realtime-data/indices/', views_realtime.RealTimeIndexDataView.as_view(), name='realtime-index-data'),
  
    path('satellites/download/<int:image_id>/', views_realtime.DownloadSatelliteImageView.as_view(), name='download-satellite-image'),
]
