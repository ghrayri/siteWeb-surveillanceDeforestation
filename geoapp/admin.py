from django.contrib import admin
from django.contrib.gis.admin import GISModelAdmin
from django.contrib.gis.geos import GEOSGeometry
from django.utils.html import format_html
from django.urls import reverse
from .models import (
    Region, Point, DataLayer, Satellite, SatelliteImage, EOData, UserZone, IndexAnalysis, IoTData, RealTime)


@admin.register(Region)
class RegionAdmin(GISModelAdmin):
    list_display = ('name', 'code', 'population', 'area', 'created_at', 'view_on_map')
    search_fields = ('name', 'code')
    list_filter = ('created_at', 'updated_at')
    readonly_fields = ('area', 'view_on_map')
    
    def view_on_map(self, obj):
        if obj.geometry:
            return format_html('<a href="/admin/geoapp/region/{}/change/?map=1" target="_blank">Voir sur la carte</a>', obj.id)
        return "-"
    view_on_map.short_description = "Carte"


@admin.register(Point)
class PointAdmin(GISModelAdmin):
    list_display = ('name', 'category', 'region', 'created_at', 'view_on_map')
    search_fields = ('name', 'description')
    list_filter = ('category', 'region', 'created_at')
    readonly_fields = ('view_on_map',)
    
    def view_on_map(self, obj):
        if obj.location:
            return format_html('<a href="/admin/geoapp/point/{}/change/?map=1" target="_blank">Voir sur la carte</a>', obj.id)
        return "-"
    view_on_map.short_description = "Carte"


@admin.register(DataLayer)
class DataLayerAdmin(admin.ModelAdmin):
    list_display = ('name', 'file_type', 'created_by', 'created_at')
    search_fields = ('name', 'description')
    list_filter = ('file_type', 'created_by', 'created_at')
    readonly_fields = ('preview_file',)
    
    def preview_file(self, obj):
        if obj.file:
            return format_html('<a href="{}" target="_blank">Aperçu du fichier</a>', obj.file.url)
        return "-"
    preview_file.short_description = "Aperçu"


@admin.register(Satellite)
class SatelliteAdmin(admin.ModelAdmin):
    list_display = ('name', 'provider', 'resolution', 'revisit_time', 'active')
    search_fields = ('name', 'provider')
    list_filter = ('provider', 'active')
    list_editable = ('active',)


@admin.register(SatelliteImage)
class SatelliteImageAdmin(GISModelAdmin):
    list_display = ('image_id', 'satellite', 'region', 'acquisition_date', 'cloud_cover', 'processed', 'preview_image')
    search_fields = ('image_id', 'region__name')
    list_filter = ('satellite', 'region', 'processed', 'acquisition_date')
    readonly_fields = ('preview_image',)
    date_hierarchy = 'acquisition_date'
    
    def preview_image(self, obj):
        if obj.image:
            return format_html('<a href="{}" target="_blank"><img src="{}" width="50" height="50" /></a>', 
                              obj.image.url, obj.image.url)
        return "-"
    preview_image.short_description = "Aperçu"


@admin.register(EOData)
class EODataAdmin(admin.ModelAdmin):
    list_display = ('index_type', 'satellite_image', 'min_value', 'max_value', 'mean_value')
    search_fields = ('satellite_image__image_id', 'index_type')
    list_filter = ('index_type', 'satellite_image__region')
    readonly_fields = ('view_raster',)
    
    def view_raster(self, obj):
        if obj.raster_file:
            return format_html('<a href="{}" target="_blank">Voir le raster</a>', obj.raster_file.url)
        return "-"
    view_raster.short_description = "Visualisation"
    
    def save_model(self, request, obj, form, change):
        # Set default values if not provided
        if obj.min_value is None:
            obj.min_value = 0.0
        if obj.max_value is None:
            obj.max_value = 1.0
        if obj.mean_value is None:
            obj.mean_value = 0.5
        super().save_model(request, obj, form, change)


@admin.register(UserZone)
class UserZoneAdmin(GISModelAdmin):
    list_display = ('name', 'user', 'created_at', 'view_on_map')
    search_fields = ('name', 'user__username')
    list_filter = ('user', 'created_at')
    readonly_fields = ('view_on_map',)
    
    def view_on_map(self, obj):
        if obj.geometry:
            return format_html('<a href="/admin/geoapp/userzone/{}/change/?map=1" target="_blank">Voir sur la carte</a>', obj.id)
        return "-"
    view_on_map.short_description = "Carte"


@admin.register(IndexAnalysis)
class IndexAnalysisAdmin(admin.ModelAdmin):
    list_display = ('user_zone', 'get_index_type', 'get_acquisition_date', 'min_value', 'max_value', 'mean_value')
    search_fields = ('user_zone__name', 'eo_data__index_type')
    list_filter = ( 'user_zone', 'created_at')
    
    def get_index_type(self, obj):
        if obj.eo_data is None:
            return "N/A"
        return obj.eo_data.index_type
    get_index_type.short_description = "Type d'indice"
    #get_index_type.admin_order_field = 'eo_data__index_type'
    
    def get_acquisition_date(self, obj):
         if obj.eo_data is None:
            return "N/A"
         return obj.eo_data.satellite_image.acquisition_date
    get_acquisition_date.short_description = "Date d'acquisition"
    get_acquisition_date.admin_order_field = 'eo_data__satellite_image__acquisition_date'



@admin.register(IoTData)
class IoTData(admin.ModelAdmin):
    list_display = ('timestamp','amg_avg_temp', 'amg_max_temp','amg_min_temp', 
    'bme_temp','bme_humidity','bme_pressure','bme_gas','soil_moisture','luminosity',
    )
    search_fields = (
        'amg_avg_temp','bme_temp','bme_humidity',
    )
    list_filter = ('timestamp',)
    date_hierarchy = 'timestamp'

    
    #

 
@admin.register(RealTime)
class RealTimeAdmin(admin.ModelAdmin):
     list_display = ( 'source', 'region','timestamp')
     #search_fields = ('source', 'payload')
     list_filter = ( 'source','region', 'timestamp')
     date_hierarchy = 'timestamp'
