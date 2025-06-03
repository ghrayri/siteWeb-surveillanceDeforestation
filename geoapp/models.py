from django.contrib.gis.db import models
from django.contrib.auth.models import User
import uuid
class Region(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    geometry = models.MultiPolygonField()
    population = models.IntegerField(null=True, blank=True)
    area = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.name

class Point(models.Model):
    name = models.CharField(max_length=100)
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='points')
    location = models.PointField()
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.name

class DataLayer(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='layers/')
    file_type = models.CharField(max_length=50, blank=True, null=True)
    category = models.CharField(max_length=100, blank=True, null=True)
    provider = models.CharField(max_length=100, blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_layers')
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    active = models.BooleanField(default=True)
    def __str__(self):
        return self.name

class Satellite(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    provider = models.CharField(max_length=100, blank=True, null=True)
    resolution = models.CharField(max_length=50, blank=True, null=True)
    revisit_time = models.CharField(max_length=50, blank=True, null=True)
    active = models.BooleanField(default=True)
    def __str__(self):
        return self.name

class SatelliteImage(models.Model):
    satellite = models.ForeignKey(Satellite, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='satellite_images/', null=True, blank=True)
    image_id = models.CharField(max_length=100, blank=True, null=True)
    date_captured = models.DateField(null=True, blank=True)
    acquisition_date = models.DateField(blank=True, null=True)
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='satellite_images')
    cloud_cover = models.FloatField(blank=True, null=True)
    processed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    def __str__(self):
        return f"{self.satellite.name} - {self.date_captured}"


class EOData(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    satellite_image = models.ForeignKey(SatelliteImage, on_delete=models.CASCADE, related_name='eo_data', null=True, blank=True)
    index_type = models.CharField(max_length=50, blank=True, null=True)
    mean_value = models.FloatField(null=True, blank=True)
    max_value = models.FloatField(null=True, blank=True)
    min_value = models.FloatField(null=True, blank=True)
    acquisition_date =models.DateField(null=True, blank=True)
    #created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='eo_data', null=True, blank=True)
    class Meta:
        unique_together = ('satellite_image', 'index_type')
    def __str__(self):
        return f"{self.index_type} for {self.satellite_image}"
class Cartographical(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    geometry = models.JSONField(null=True, blank=True)
    acquisition_date = models.DateField(null=True, blank=True)
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='cartographicals', null=True, blank=True)
    def __str__(self):
        return f"Cartographical: {self.name or self.id}"


class IoTData(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    amg_avg_temp = models.FloatField(null=True, blank=True)
    amg_max_temp = models.FloatField(null=True, blank=True)
    amg_min_temp = models.FloatField(null=True, blank=True)
    bme_temp = models.FloatField(null=True, blank=True)
    bme_humidity = models.FloatField(null=True, blank=True)
    bme_pressure = models.FloatField(null=True, blank=True)
    bme_gas = models.FloatField(null=True, blank=True)
    soil_moisture = models.FloatField(null=True, blank=True)
    luminosity = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"Data @ {self.timestamp}"



class RealTime(models.Model):
    id = models.UUIDField(primary_key=True)
    source = models.CharField(max_length=100,null=True, blank=True)
    timestamp = models.DateTimeField()
    metadata = models.JSONField(null=True, blank=True)
    update_interval = models.IntegerField(null=True, blank=True)
    last_update = models.DateTimeField(null=True, blank=True)
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='realtime', null=True, blank=True)
   
    def __str__(self):
        return f"{self.source} at {self.timestamp}"

class UserZone(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='zones')
    name = models.CharField(max_length=100)
    geometry = models.MultiPolygonField()
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.name

class IndexType(models.Model):
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.name

class IndexAnalysis(models.Model):
    user_zone = models.ForeignKey(UserZone, on_delete=models.CASCADE, related_name='index_analyses')
    eo_data = models.ForeignKey(EOData, on_delete=models.CASCADE, related_name='analyses',null=True, blank=True)
    analysis_result = models.TextField(default='')
    min_value = models.FloatField(null=True, blank=True)
    max_value = models.FloatField(null=True, blank=True)
    mean_value = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Analysis for {self.user_zone.name}"