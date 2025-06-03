from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, IsAdminUser, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.gis.geos import GEOSGeometry
from django.contrib.gis.measure import D
from django.contrib.auth.models import User
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.contrib.sites.shortcuts import get_current_site
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import EmailMessage
from datetime import timedelta

from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponse
import json
import csv
from django.core.serializers import serialize


def export_iot_data(data, format):
    """Helper function to export IoT data in different formats"""
    if format == 'json':
        return JsonResponse(data, safe=False)
    elif format == 'geojson':
        features = []
        for item in data:
            feature = {
                "type": "Feature",
                "properties": item,
                "geometry": None  # Add geometry if available
            }
            features.append(feature)
        geojson = {"type": "FeatureCollection", "features": features}
        return JsonResponse(geojson)
    elif format == 'csv':
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="iot_data.csv"'
        writer = csv.writer(response)
        if data and len(data) > 0:
            writer.writerow(data[0].keys())
            for item in data:
                writer.writerow(item.values())
        return response
    return JsonResponse({'error': 'Invalid format'}, status=400)


@csrf_exempt
def receive_data(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        IoT.objects.create(
            amg_avg_temp=data.get('amg_avg_temp'),
            amg_max_temp=data.get('amg_max_temp'),
            amg_min_temp=data.get('amg_min_temp'),
            bme_temp=data.get('bme_temp'),
            bme_humidity=data.get('bme_humidity'),
            bme_pressure=data.get('bme_pressure'),
            bme_gas=data.get('bme_gas'),
            soil_moisture=data.get('soil_moisture'),
            luminosity=data.get('luminosity'),
        )
        return JsonResponse({'status': 'success'})

    return JsonResponse({'error': 'Only POST allowed'}, status=405)


from geoapp.models import (
    Region, Point, DataLayer, Satellite, SatelliteImage, 
    EOData, UserZone, IndexAnalysis, IndexType , IoTData, Cartographical
)
from .serializers import (
    RegionSerializer, PointSerializer, DataLayerSerializer, UserSerializer,
    SatelliteSerializer, SatelliteImageSerializer, EODataSerializer,
    UserZoneSerializer, IndexAnalysisSerializer, UserZoneWithAnalysisSerializer ,IoTDataSerializer
)
from .permissions import IsOwnerOrReadOnly, IsAdminOrReadOnly
from geoapp.tokens import account_activation_token
from rest_framework.authtoken.models import Token


@api_view(['POST'])
@csrf_exempt
@permission_classes([AllowAny])
def register_user(request):
    """
    Register a new user with email verification
    """
    try:
        print(f"Registration request data: {request.data}")
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = User.objects.create_user(
                username=serializer.validated_data['username'],
                email=serializer.validated_data['email'],
                password=request.data['password'],
                first_name=serializer.validated_data.get('first_name', ''),
                last_name=serializer.validated_data.get('last_name', '')
            )
            # Set user as inactive until email verification
            user.is_active = False
            user.save()
            
            # Send activation email
            current_site = get_current_site(request)
            mail_subject = 'Activez votre compte GeoX'
            frontend_domain = "http://localhost:3000"
            message = render_to_string('email/account_activation_email.html', {
                'user': user,
                'domain': current_site.domain,
                'frontend_domain': frontend_domain,
                'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                'token': account_activation_token.make_token(user),
            })
            to_email = user.email
            email = EmailMessage(mail_subject, message, to=[to_email])
            email.content_subtype = "html" # Main content is now HTML
            try:
                email.send()
                print("Activation email sent successfully.")
            except Exception as email_error:
                print(f"Error sending activation email: {email_error}")
                # Optionally, re-raise the exception or handle it differently
                # raise email_error
            
            return Response({
                'message': 'Votre compte a été créé avec succès. Veuillez vérifier votre email pour activer votre compte.',
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        print(f"Serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(f"Registration error: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def custom_obtain_auth_token(request):
    """
    Vue personnalisée pour obtenir un token d'authentification (remplace ObtainAuthToken)
    """
    from django.contrib.auth import authenticate
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user is not None:
        if user.is_active:
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key})
        else:
            return Response({'error': "Le compte n'est pas activé."}, status=status.HTTP_403_FORBIDDEN)
    else:
        return Response({'error': 'Nom d\'utilisateur ou mot de passe invalide.'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    """
    Get the profile of the authenticated user
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


class RegionViewSet(viewsets.ModelViewSet):
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['name', 'code']
    search_fields = ['name', 'code']
    ordering_fields = ['name', 'code']


class PointViewSet(viewsets.ModelViewSet):
    queryset = Point.objects.all()
    serializer_class = PointSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['name', 'category', 'region']
    search_fields = ['name', 'category']
    ordering_fields = ['name', 'category']


class DataLayerViewSet(viewsets.ModelViewSet):
    queryset = DataLayer.objects.all()
    serializer_class = DataLayerSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['name']
    search_fields = ['name']




class UserZoneViewSet(viewsets.ModelViewSet):
    queryset = UserZone.objects.all()
    serializer_class = UserZoneSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['name', 'user']
    search_fields = ['name']
    ordering_fields = ['name']





class IoTDataViewSet(viewsets.ModelViewSet):
    queryset = IoTData.objects.all().order_by('-timestamp') # Order by timestamp descending
    serializer_class = IoTDataSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['region', 'timestamp'] # Add relevant fields for filtering
    ordering_fields = ['timestamp']

