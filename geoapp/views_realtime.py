from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.core.cache import cache
from geoapp.tasks import fetch_satellite_images
from geoapp.models import Satellite
from rest_framework.decorators import api_view, permission_classes
from rest_framework import serializers
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

class SatelliteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Satellite
        fields = ['id', 'name', 'active']

class SatelliteListView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request):
        satellites = Satellite.objects.filter(active=True)
        serializer = SatelliteSerializer(satellites, many=True)
        return Response(serializer.data)

@method_decorator(csrf_exempt, name='dispatch')
class TriggerFetchSatelliteImagesView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        region_id = request.data.get('region_id')
        days = request.data.get('days', 7)
        cloud_cover_max = request.data.get('cloud_cover_max', 30)
        task = fetch_satellite_images.delay(region_id=region_id, days=days, cloud_cover_max=cloud_cover_max)
        return Response({'task_id': task.id, 'status': 'started'})

@method_decorator(csrf_exempt, name='dispatch')
class TriggerProcessSatelliteImagesView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        return Response({'detail': 'Processing satellite images not implemented yet.'}, status=status.HTTP_501_NOT_IMPLEMENTED)

class RealTimeIndexDataView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request):
        region_id = request.query_params.get('region_id')
        cache_key = f"realtime_data_{region_id}" if region_id else "realtime_data_global"
        data = cache.get(cache_key)
        if data is None:
            return Response({'detail': 'No real-time data available'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'data': data})

class DownloadSatelliteImageView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, image_id):
        # Implement logic to serve the TIFF or JP2 file for the given image_id
        # For now, return a placeholder response
        return Response({'detail': f'Download for image {image_id} not implemented yet'}, status=status.HTTP_501_NOT_IMPLEMENTED)