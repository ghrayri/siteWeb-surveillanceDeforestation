"""
Utilitaires pour le traitement des données satellitaires et le calcul d'indices
"""
import os
import tempfile
import numpy as np
import rasterio
from rasterio.warp import calculate_default_transform, reproject, Resampling
from rasterio.mask import mask
from rasterio.features import bounds as feature_bounds
import xarray as xr
from sentinelsat import SentinelAPI
from datetime import datetime, timedelta
import planetary_computer
import pystac_client
import stackstac
from shapely.geometry import shape, mapping
from django.conf import settings
from django.contrib.gis.geos import GEOSGeometry
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage


def calculate_ndvi(nir_band, red_band):
    """
    Calcule l'indice NDVI (Normalized Difference Vegetation Index)
    NDVI = (NIR - RED) / (NIR + RED)
    """
    # Éviter la division par zéro
    denominator = nir_band + red_band
    mask = denominator > 0
    
    # Initialiser le tableau de résultats avec des NaN
    ndvi = np.full_like(nir_band, np.nan, dtype=np.float32)
    
    # Calculer NDVI uniquement où le dénominateur est > 0
    ndvi[mask] = (nir_band[mask] - red_band[mask]) / denominator[mask]
    
    # Limiter les valeurs entre -1 et 1
    ndvi = np.clip(ndvi, -1.0, 1.0)
    
    return ndvi


def calculate_ndwi(nir_band, green_band):
    """
    Calcule l'indice NDWI (Normalized Difference Water Index)
    NDWI = (GREEN - NIR) / (GREEN + NIR)
    """
    # Éviter la division par zéro
    denominator = green_band + nir_band
    mask = denominator > 0
    
    # Initialiser le tableau de résultats avec des NaN
    ndwi = np.full_like(nir_band, np.nan, dtype=np.float32)
    
    # Calculer NDWI uniquement où le dénominateur est > 0
    ndwi[mask] = (green_band[mask] - nir_band[mask]) / denominator[mask]
    
    # Limiter les valeurs entre -1 et 1
    ndwi = np.clip(ndwi, -1.0, 1.0)
    
    return ndwi


def calculate_nbr(nir_band, swir_band):
    """
    Calcule l'indice NBR (Normalized Burn Ratio)
    NBR = (NIR - SWIR) / (NIR + SWIR)
    """
    # Éviter la division par zéro
    denominator = nir_band + swir_band
    mask = denominator > 0
    
    # Initialiser le tableau de résultats avec des NaN
    nbr = np.full_like(nir_band, np.nan, dtype=np.float32)
    
    # Calculer NBR uniquement où le dénominateur est > 0
    nbr[mask] = (nir_band[mask] - swir_band[mask]) / denominator[mask]
    
    # Limiter les valeurs entre -1 et 1
    nbr = np.clip(nbr, -1.0, 1.0)
    
    return nbr


def calculate_ndmi(nir_band, swir_band):
    """
    Calcule l'indice NDMI (Normalized Difference Moisture Index)
    NDMI = (NIR - SWIR) / (NIR + SWIR)
    Note: NDMI est similaire à NBR mais utilise généralement une bande SWIR différente
    """
    # Éviter la division par zéro
    denominator = nir_band + swir_band
    mask = denominator > 0
    
    # Initialiser le tableau de résultats avec des NaN
    ndmi = np.full_like(nir_band, np.nan, dtype=np.float32)
    
    # Calculer NDMI uniquement où le dénominateur est > 0
    ndmi[mask] = (nir_band[mask] - swir_band[mask]) / denominator[mask]
    
    # Limiter les valeurs entre -1 et 1
    ndmi = np.clip(ndmi, -1.0, 1.0)
    
    return ndmi


def save_raster(data, transform, crs, filename):
    """
    Sauvegarde les données raster dans un fichier GeoTIFF
    """
    # Créer un fichier temporaire
    with tempfile.NamedTemporaryFile(suffix='.tif', delete=False) as tmp:
        tmp_path = tmp.name
    
    # Écrire les données dans le fichier GeoTIFF
    with rasterio.open(
        tmp_path,
        'w',
        driver='GTiff',
        height=data.shape[0],
        width=data.shape[1],
        count=1,
        dtype=data.dtype,
        crs=crs,
        transform=transform,
        nodata=np.nan
    ) as dst:
        dst.write(data, 1)
    
    # Lire le fichier temporaire et le sauvegarder dans le stockage Django
    with open(tmp_path, 'rb') as f:
        content = f.read()
    
    # Sauvegarder le fichier dans le stockage Django
    file_path = f'indices/{filename}'
    saved_path = default_storage.save(file_path, ContentFile(content))
    
    # Supprimer le fichier temporaire
    os.unlink(tmp_path)
    
    return saved_path


def get_sentinel_data(api_user, api_password, geometry, start_date, end_date, cloud_cover_max=30):
    """
    Récupère les données Sentinel-2 pour une géométrie et une période données
    """
    # Convertir la géométrie en WKT
    if isinstance(geometry, GEOSGeometry):
        footprint = geometry.wkt
    else:
        footprint = geometry
    
    # Initialiser l'API Sentinel
    api = SentinelAPI(api_user, api_password, 'https://scihub.copernicus.eu/dhus')
    
    # Rechercher les produits Sentinel-2
    products = api.query(
        footprint,
        date=(start_date, end_date),
        platformname='Sentinel-2',
        processinglevel='Level-2A',
        cloudcoverpercentage=(0, cloud_cover_max)
    )
    
    return api.to_dataframe(products)


def get_planetary_computer_data(geometry, start_date, end_date, collection='sentinel-2-l2a', cloud_cover_max=30):
    """
    Récupère les données satellitaires depuis Microsoft Planetary Computer
    """
    # Convertir la géométrie en GeoJSON
    if isinstance(geometry, GEOSGeometry):
        geojson = mapping(shape(geometry.json))
    else:
        geojson = geometry
    
    # Initialiser le client STAC
    catalog = pystac_client.Client.open(
        "https://planetarycomputer.microsoft.com/api/stac/v1",
        modifier=planetary_computer.sign_inplace
    )
    
    # Rechercher les données
    search = catalog.search(
        collections=[collection],
        datetime=f"{start_date.isoformat()}/{end_date.isoformat()}",
        intersects=geojson,
        query={"eo:cloud_cover": {"lt": cloud_cover_max}}
    )
    
    # Récupérer les items
    items = list(search.get_items())
    
    return items


def process_sentinel2_for_index(item, geometry, index_type):
    """
    Traite une image Sentinel-2 pour calculer un indice spécifique
    """
    # Convertir la géométrie en GeoJSON
    if isinstance(geometry, GEOSGeometry):
        geojson = mapping(shape(geometry.json))
    else:
        geojson = geometry
    
    # Charger les données avec stackstac
    try:
        # Définir les bandes nécessaires en fonction de l'indice
        if index_type == 'NDVI':
            bands = ['B08', 'B04']  # NIR, RED
        elif index_type == 'NDWI':
            bands = ['B08', 'B03']  # NIR, GREEN
        elif index_type in ['NBR', 'NDMI']:
            bands = ['B08', 'B11']  # NIR, SWIR
        else:
            raise ValueError(f"Type d'indice non pris en charge: {index_type}")
        
        # Charger les données
        stac_data = stackstac.stack(
            [item],
            bands=bands,
            resolution=10,
            bounds=feature_bounds(geojson),
            epsg=4326
        )
        
        # Appliquer le masque de la géométrie
        stac_data = stac_data.rio.clip([geojson])
        
        # Calculer l'indice
        if index_type == 'NDVI':
            nir = stac_data.sel(band='B08').values
            red = stac_data.sel(band='B04').values
            eo_data = calculate_ndvi(nir, red)
        elif index_type == 'NDWI':
            nir = stac_data.sel(band='B08').values
            green = stac_data.sel(band='B03').values
            eo_data = calculate_ndwi(nir, green)
        elif index_type == 'NBR':
            nir = stac_data.sel(band='B08').values
            swir = stac_data.sel(band='B11').values
            eo_data = calculate_nbr(nir, swir)
        elif index_type == 'NDMI':
            nir = stac_data.sel(band='B08').values
            swir = stac_data.sel(band='B11').values
            eo_data = calculate_ndmi(nir, swir)
        
        # Calculer les statistiques
        valid_data = eo_data[~np.isnan(eo_data)]
        min_value = float(np.min(valid_data)) if len(valid_data) > 0 else -1.0
        max_value = float(np.max(valid_data)) if len(valid_data) > 0 else 1.0
        mean_value = float(np.mean(valid_data)) if len(valid_data) > 0 else 0.0
        
        # Sauvegarder le raster
        filename = f"{index_type}_{item.id}_{datetime.now().strftime('%Y%m%d%H%M%S')}.tif"
        transform = stac_data.rio.transform()
        crs = stac_data.rio.crs
        file_path = save_raster(eo_data, transform, crs, filename)
        
        return {
            'file_path': file_path,
            'min_value': min_value,
            'max_value': max_value,
            'mean_value': mean_value
        }
    
    except Exception as e:
        print(f"Erreur lors du traitement de l'image: {e}")
        return None


def calculate_zone_statistics(eo_data_path, zone_geometry):
    """
    Calcule les statistiques d'un indice pour une zone spécifique
    """
    # Convertir la géométrie en GeoJSON
    if isinstance(zone_geometry, GEOSGeometry):
        geojson = [mapping(shape(zone_geometry.json))]
    else:
        geojson = [zone_geometry]
    
    try:
        # Ouvrir le fichier raster
        with rasterio.open(eo_data_path) as src:
            # Masquer le raster avec la géométrie de la zone
            out_image, out_transform = mask(src, geojson, crop=True, nodata=np.nan)
            
            # Extraire les données
            data = out_image[0]
            
            # Calculer les statistiques
            valid_data = data[~np.isnan(data)]
            min_value = float(np.min(valid_data)) if len(valid_data) > 0 else -1.0
            max_value = float(np.max(valid_data)) if len(valid_data) > 0 else 1.0
            mean_value = float(np.mean(valid_data)) if len(valid_data) > 0 else 0.0
            
            return {
                'min_value': min_value,
                'max_value': max_value,
                'mean_value': mean_value
            }
    
    except Exception as e:
        print(f"Erreur lors du calcul des statistiques de zone: {e}")
        return None