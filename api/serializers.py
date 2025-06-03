from rest_framework import serializers
from django.contrib.auth.models import User
from geoapp.models import Region, Point, DataLayer, UserZone, RealTime, Satellite, SatelliteImage, EOData, IoTData, IndexAnalysis, Cartographical

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active']

class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = ['id', 'name', 'code', 'geometry', 'population', 'area', 'created_at', 'updated_at']

class PointSerializer(serializers.ModelSerializer):
    class Meta:
        model = Point
        fields = ['id', 'name', 'category', 'region', 'location']

class DataLayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataLayer
        fields = ['id', 'name', 'description', 'created_at', 'updated_at']

class UserZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserZone
        fields = ['id', 'name', 'user', 'geometry']

class RealTimeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RealTime
        fields = ['id', 'source', 'timestamp', 'metadata', 'update_interval', 'last_update', 'region']

class SatelliteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Satellite
        fields = '__all__'

class SatelliteImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = SatelliteImage
        fields = '__all__'

class EODataSerializer(serializers.ModelSerializer):
    class Meta:
        model = EOData
        fields = '__all__'

class CartographicalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cartographical
        fields = '__all__'

class IoTDataSerializer(serializers.ModelSerializer):
    timeseries = serializers.SerializerMethodField()
    class Meta:
        model = IoTData
        fields = [
            'id',
            'timestamp',
            'amg_avg_temp',
            'amg_max_temp',
            'amg_min_temp',
            'bme_temp',
            'bme_humidity',
            'bme_pressure',
            'bme_gas',
            'soil_moisture',
            'luminosity',
            'timeseries'
        ]

    def get_timeseries(self, obj):
        historical_data = IoTData.objects.filter(timestamp__lt=obj.timestamp).order_by('-timestamp')[:100]
        return [{'timestamp': point.timestamp, 'value': point.bme_temp} for point in reversed(historical_data)]

class IndexAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = IndexAnalysis
        fields = '__all__'

class UserZoneWithAnalysisSerializer(serializers.ModelSerializer):
    analysis = IndexAnalysisSerializer(many=True, read_only=True)
    
    class Meta:
        model = UserZone
        fields = ['id', 'name', 'user', 'geometry', 'analysis']
