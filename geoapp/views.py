from django.shortcuts import get_object_or_404, redirect
from django.http import JsonResponse, HttpResponse
from django.contrib.auth.decorators import login_required
from rest_framework import viewsets, permissions
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, IsAdminUser, AllowAny
from rest_framework.response import Response
from .models import Region, Point, DataLayer, Satellite, SatelliteImage, EOData, IoTData, RealTime, UserZone, IndexAnalysis, Cartographical
from api.serializers import RegionSerializer, PointSerializer, DataLayerSerializer, SatelliteSerializer, SatelliteImageSerializer, EODataSerializer, IoTDataSerializer, RealTimeSerializer, RegionSerializer, IndexAnalysisSerializer, CartographicalSerializer
from api.permissions import IsOwnerOrReadOnly, IsAdminOrReadOnly
from django.core.serializers import serialize
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import get_user_model
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from .tokens import account_activation_token

# Ce fichier ne contient que les fonctions utilitaires nécessaires
# Toutes les vues basées sur des templates ont été migrées vers l'API

@login_required
def export_region_geojson(request, pk):
    region = get_object_or_404(Region, pk=pk)
    geojson = serialize('geojson', [region], geometry_field='geometry', fields=('name', 'code', 'population', 'area'))
    response = HttpResponse(geojson, content_type='application/json')
    response['Content-Disposition'] = f'attachment; filename="{region.name}.geojson"'
    return response

@login_required
def get_region_statistics(request, pk):
    region = get_object_or_404(Region, pk=pk)
    points = Point.objects.filter(region=region)
    categories = {}
    for point in points:
        if point.category in categories:
            categories[point.category] += 1
        else:
            categories[point.category] = 1
    return JsonResponse({
        'region': region.name,
        'total_points': points.count(),
        'categories': categories,
        'population': region.population,
        'area': region.area
    })

# Vues API CRUD sécurisées pour les modèles principaux
class RegionViewSet(viewsets.ModelViewSet):
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    permission_classes = [AllowAny]

class PointViewSet(viewsets.ModelViewSet):
    queryset = Point.objects.all()
    serializer_class = PointSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class DataLayerViewSet(viewsets.ModelViewSet):
    queryset = DataLayer.objects.all()
    serializer_class = DataLayerSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class SatelliteViewSet(viewsets.ModelViewSet):
    queryset = Satellite.objects.all()
    serializer_class = SatelliteSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class SatelliteImageViewSet(viewsets.ModelViewSet):
    queryset = SatelliteImage.objects.all()
    serializer_class = SatelliteImageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class EODataViewSet(viewsets.ModelViewSet):
    queryset = EOData.objects.all()
    serializer_class = EODataSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['satellite_image__image_id', 'index_type']

class IoTDataViewSet(viewsets.ModelViewSet):
    queryset = IoTData.objects.all()
    serializer_class = IoTDataSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = [ 'amg_avg_temp','bme_temp','bme_humidity']
    filterset_fields = [ 'amg_avg_temp','bme_temp','bme_humidity']

class RealTimeViewSet(viewsets.ModelViewSet):
    queryset = RealTime.objects.all()
    serializer_class = RealTimeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['source', 'region', 'timestamp']

class UserZoneViewSet(viewsets.ModelViewSet):
    queryset = UserZone.objects.all()
    serializer_class = RegionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class IndexAnalysisViewSet(viewsets.ModelViewSet):
    queryset = IndexAnalysis.objects.all()
    serializer_class = IndexAnalysisSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class CartographicalViewSet(viewsets.ModelViewSet):
    queryset = Cartographical.objects.all()
    serializer_class = CartographicalSerializer

def activate_account(request, uidb64, token):
    User = get_user_model()
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user is not None and account_activation_token.check_token(user, token):
        user.is_active = True
        user.save()
        frontend_url = f"{settings.FRONTEND_DOMAIN}/activate?uid={uidb64}&token={token}"
        return redirect(frontend_url)
    else:
        return HttpResponse('Le lien d\'activation est invalide ou a expiré.')