import os
import re
from datetime import datetime
from pathlib import Path
import xml.etree.ElementTree as ET
from osgeo import gdal
import numpy as np
import uuid

import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "geospatial_project.settings")
django.setup()

from geoapp.models import EOData, Region, SatelliteImage, Satellite

# Configuration
root_folder = Path(r"D:/wilayet/nabeul/ruster")
region = Region.objects.get(name__iexact="Nabeul")
sentinel = Satellite.objects.get(name__iexact="Sentinel-2")
DEFAULT_CLOUD_COVER = 5  # Default cloud cover percentage

# File patterns
filename_pattern = re.compile(
    r"(?P<tile>T\d{2}[A-Z]{3})_(?P<datetime>\d{8}T\d{6})_(?P<index>[a-z]+)_(?P<resolution>\d+m)\.tif(?:\.aux)?(?:\.xml)?",
    re.IGNORECASE
)

def normalize(val):
    """Normalize Sentinel-2 values"""
    return val / 10000.0 if val is not None else None

def get_or_create_satellite_image(tile, date, resolution):
    """Ensure we have a valid SatelliteImage with all required fields"""
    img, created = SatelliteImage.objects.get_or_create(
        satellite=sentinel,
        acquisition_date=date,
        region=region,
        defaults={
            'date_captured': date,
            'processed': True,
            'image_id': f"{tile}_{date.strftime('%Y%m%d')}_{resolution}",
            'cloud_cover': DEFAULT_CLOUD_COVER
        }
    )
    return img

def create_eodata_record(img, index_type, stats, date):
    """Create EOData record with all required fields"""
    eodata_id = uuid.uuid4()
    EOData.objects.update_or_create(
        id=eodata_id,
        satellite_image=img,
        index_type=index_type,
        defaults={
            'mean_value': normalize(stats['STATISTICS_MEAN']),
            'max_value': normalize(stats['STATISTICS_MAXIMUM']),
            'min_value': normalize(stats['STATISTICS_MINIMUM']),
            'acquisition_date': date,
            'region': region
        }
    )

    EOData.objects.update_or_create(
        satellite_image=img,
        index_type=index_type,
        defaults={
            'mean_value': normalize(stats['STATISTICS_MEAN']),
            'max_value': normalize(stats['STATISTICS_MAXIMUM']),
            'min_value': normalize(stats['STATISTICS_MINIMUM']),
            'raster_file': file_path.name
        }
    )

def create_eodata_record(img, index_type, stats):
    """Create EOData record"""
    EOData.objects.create(
        satellite_image=img,
        index_type=index_type,
        mean_value=normalize(stats.get('STATISTICS_MEAN')),
        max_value=normalize(stats.get('STATISTICS_MAXIMUM')),
        min_value=normalize(stats.get('STATISTICS_MINIMUM'))
    )

def process_file(file_path):
    """Process a single file with proper XML value handling"""
    try:
        match = filename_pattern.match(file_path.name)
        if not match:
            return

        tile = match.group("tile")
        date = datetime.strptime(match.group("datetime"), "%Y%m%dT%H%M%S").date()
        index_type = match.group("index").lower()
        resolution = match.group("resolution")

        # Parse statistics from XML
        tree = ET.parse(file_path)
        stats = {}
        
        for elem in tree.findall(".//MDI"):
            key = elem.attrib.get('key', '')
            if not key.startswith('STATISTICS_'):
                continue
                
            # Only process numeric statistics fields
            if key in ['STATISTICS_MINIMUM', 'STATISTICS_MAXIMUM', 'STATISTICS_MEAN']:
                try:
                    stats[key] = float(elem.text)
                except (ValueError, TypeError):
                    print(f"⚠️ Could not convert {key} value '{elem.text}' in {file_path.name}")
                    stats[key] = None

        # Skip if we're missing required stats
        if None in [stats.get('STATISTICS_MEAN'), stats.get('STATISTICS_MINIMUM'), stats.get('STATISTICS_MAXIMUM')]:
            print(f"⚠️ Missing required statistics in {file_path.name}")
            return

        # Get or create satellite image
        img = get_or_create_satellite_image(tile, date, resolution)

        # Create records
        eodata_id = uuid.uuid4()
        EOData.objects.update_or_create(
            id=eodata_id,
            satellite_image=img,
            index_type=index_type,
            defaults={
                'mean_value': normalize(stats['STATISTICS_MEAN']),
                'max_value': normalize(stats['STATISTICS_MAXIMUM']),
                'min_value': normalize(stats['STATISTICS_MINIMUM']),
                'acquisition_date': date,
                'region': region
            }
        )

        IndexData.objects.update_or_create(
            satellite_image=img,
            index_type=index_type,
            defaults={
                'mean_value': normalize(stats['STATISTICS_MEAN']),
                'max_value': normalize(stats['STATISTICS_MAXIMUM']),
                'min_value': normalize(stats['STATISTICS_MINIMUM'])
            }
        )

        print(f"✅ Processed {index_type} for {date} (Mean: {normalize(stats['STATISTICS_MEAN']):.4f})")

    except ET.ParseError:
        print(f"❌ XML parsing failed for {file_path.name}")
    except Exception as e:
        print(f"❌ Unexpected error processing {file_path.name}: {str(e)}")
def main():
    # Process all XML files
    for xml_file in root_folder.rglob("*.tif.aux.xml"):
        process_file(xml_file)

if __name__ == "__main__":
    main()