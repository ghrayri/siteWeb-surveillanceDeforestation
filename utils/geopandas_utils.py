import geopandas as gpd
import pandas as pd
import numpy as np
from django.contrib.gis.geos import GEOSGeometry
from geoapp.models import Region, Point, DataLayer
import os
import tempfile
import zipfile
import json


def import_shapefile(data_layer):
    """
    Importe un fichier Shapefile dans la base de données
    
    Args:
        data_layer: Instance du modèle DataLayer contenant le fichier Shapefile
    
    Returns:
        bool: True si l'importation a réussi, False sinon
    """
    try:
        # Créer un répertoire temporaire pour extraire le fichier zip
        with tempfile.TemporaryDirectory() as temp_dir:
            # Extraire le fichier zip s'il s'agit d'un zip
            if data_layer.file_type.lower() == 'zip':
                with zipfile.ZipFile(data_layer.file.path, 'r') as zip_ref:
                    zip_ref.extractall(temp_dir)
                
                # Trouver le fichier .shp dans le répertoire
                shp_files = [f for f in os.listdir(temp_dir) if f.endswith('.shp')]
                if not shp_files:
                    return False
                
                shapefile_path = os.path.join(temp_dir, shp_files[0])
            else:
                shapefile_path = data_layer.file.path
            
            # Lire le fichier avec GeoPandas
            gdf = gpd.read_file(shapefile_path)
            
            # Assurer que le CRS est WGS84 (EPSG:4326)
            if gdf.crs is None or gdf.crs.to_epsg() != 4326:
                gdf = gdf.to_crs(epsg=4326)
            
            return gdf
    except Exception as e:
        print(f"Erreur lors de l'importation du Shapefile: {e}")
        return False


def import_geojson(data_layer):
    """
    Importe un fichier GeoJSON dans la base de données
    
    Args:
        data_layer: Instance du modèle DataLayer contenant le fichier GeoJSON
    
    Returns:
        GeoDataFrame: DataFrame GeoPandas contenant les données du GeoJSON
    """
    try:
        # Lire le fichier GeoJSON avec GeoPandas
        gdf = gpd.read_file(data_layer.file.path)
        
        # Assurer que le CRS est WGS84 (EPSG:4326)
        if gdf.crs is None or gdf.crs.to_epsg() != 4326:
            gdf = gdf.to_crs(epsg=4326)
        
        return gdf
    except Exception as e:
        print(f"Erreur lors de l'importation du GeoJSON: {e}")
        return False


def create_regions_from_gdf(gdf, name_field, code_field=None, population_field=None, area_field=None):
    """
    Crée des objets Region à partir d'un GeoDataFrame
    
    Args:
        gdf: GeoDataFrame contenant les données géospatiales
        name_field: Nom du champ contenant le nom de la région
        code_field: Nom du champ contenant le code de la région
        population_field: Nom du champ contenant la population
        area_field: Nom du champ contenant la superficie
    
    Returns:
        int: Nombre de régions créées
    """
    count = 0
    for idx, row in gdf.iterrows():
        try:
            # Extraire les valeurs des champs
            name = str(row[name_field]) if name_field in row else f"Region {idx}"
            code = str(row[code_field]) if code_field and code_field in row else f"R{idx}"
            population = int(row[population_field]) if population_field and population_field in row else None
            area = float(row[area_field]) if area_field and area_field in row else None
            
            # Convertir la géométrie en format WKT
            geom_wkt = row['geometry'].wkt
            
            # Créer l'objet Region
            region, created = Region.objects.get_or_create(
                code=code,
                defaults={
                    'name': name,
                    'geometry': GEOSGeometry(geom_wkt),
                    'population': population,
                    'area': area
                }
            )
            
            if created:
                count += 1
        except Exception as e:
            print(f"Erreur lors de la création de la région {idx}: {e}")
    
    return count


def spatial_join(points_gdf, regions_gdf):
    """
    Effectue une jointure spatiale entre des points et des régions
    
    Args:
        points_gdf: GeoDataFrame contenant des points
        regions_gdf: GeoDataFrame contenant des régions
    
    Returns:
        GeoDataFrame: Résultat de la jointure spatiale
    """
    # Effectuer la jointure spatiale
    joined = gpd.sjoin(points_gdf, regions_gdf, how="inner", op="within")
    return joined


def calculate_statistics(region_id):
    """
    Calcule des statistiques pour une région donnée
    
    Args:
        region_id: ID de la région
    
    Returns:
        dict: Dictionnaire contenant les statistiques
    """
    try:
        region = Region.objects.get(id=region_id)
        points = Point.objects.filter(region=region)
        
        # Compter les points par catégorie
        category_counts = {}
        for point in points:
            category = point.category or 'Non catégorisé'
            if category in category_counts:
                category_counts[category] += 1
            else:
                category_counts[category] = 1
        
        # Calculer d'autres statistiques si nécessaire
        stats = {
            'region_name': region.name,
            'total_points': points.count(),
            'points_by_category': category_counts,
            'population': region.population,
            'area': region.area,
            'density': region.population / region.area if region.population and region.area else None
        }
        
        return stats
    except Region.DoesNotExist:
        return {'error': 'Région non trouvée'}
    except Exception as e:
        return {'error': str(e)}


def export_to_geojson(queryset, output_path):
    """
    Exporte un queryset de modèles géospatiaux vers un fichier GeoJSON
    
    Args:
        queryset: QuerySet de modèles géospatiaux (Region ou Point)
        output_path: Chemin du fichier de sortie
    
    Returns:
        bool: True si l'exportation a réussi, False sinon
    """
    try:
        # Créer une liste de features GeoJSON
        features = []
        
        for obj in queryset:
            # Déterminer le champ géométrique en fonction du type d'objet
            if hasattr(obj, 'geometry'):
                geom = obj.geometry
                geom_field = 'geometry'
            elif hasattr(obj, 'location'):
                geom = obj.location
                geom_field = 'location'
            else:
                continue
            
            # Créer un dictionnaire de propriétés
            properties = {}
            for field in obj._meta.fields:
                if field.name != geom_field and not field.name.endswith('_ptr'):
                    value = getattr(obj, field.name)
                    if value is not None and not callable(value):
                        properties[field.name] = str(value)
            
            # Créer la feature GeoJSON
            feature = {
                'type': 'Feature',
                'geometry': json.loads(geom.json),
                'properties': properties
            }
            
            features.append(feature)
        
        # Créer la collection de features
        geojson = {
            'type': 'FeatureCollection',
            'features': features
        }
        
        # Écrire dans le fichier
        with open(output_path, 'w') as f:
            json.dump(geojson, f)
        
        return True
    except Exception as e:
        print(f"Erreur lors de l'exportation vers GeoJSON: {e}")
        return False