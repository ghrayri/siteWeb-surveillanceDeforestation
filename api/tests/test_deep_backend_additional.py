from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User
from geoapp.models import EOData, UserZone, IndexAnalysis, IndexType, SatelliteImage
from django.contrib.gis.geos import MultiPolygon, Polygon

class EODataViewSetDeepTests(APITestCase):
    def setUp(self):
        from django.utils import timezone
        from geoapp.models import Satellite, Region
        self.user = User.objects.create_user(username='eodata_user', password='eodata_pass')
        self.client.login(username='eodata_user', password='eodata_pass')
        self.satellite_obj = Satellite.objects.create(name='TestSatellite', active=True, provider='TestProvider', resolution=10.0, revisit_time=5)
        self.region_obj = Region.objects.create(
            name='TestRegion',
            code='TR1',
            geometry='MULTIPOLYGON(((0 0, 0 1, 1 1, 1 0, 0 0)))',
            population=1000,
            area=100.0
        )
        self.satellite = SatelliteImage.objects.create(
            satellite=self.satellite_obj,
            acquisition_date=timezone.now(),
            cloud_cover=0.1,
            region=self.region_obj,
            image_id='IMG12345'
        )
        self.eo_data = EOData.objects.create(
            index_type=IndexType.NDVI,
            min_value=0.1,
            max_value=0.9,
            mean_value=0.5,
            satellite_image=self.satellite
        )

    def test_create_eodata(self):
        url = reverse('eodata-list')
        data = {
            'index_type': IndexType.NDWI,
            'min_value': 0.2,
            'max_value': 0.8,
            'mean_value': 0.6,
            'satellite_image': self.satellite.id
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['index_type'], IndexType.NDWI)

    def test_update_eodata(self):
        url = reverse('eodata-detail', args=[self.eo_data.id])
        data = {
            'index_type': IndexType.NDVI,
            'min_value': 0.15,
            'max_value': 0.85,
            'mean_value': 0.55,
            'satellite_image': self.satellite.id
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['min_value'], 0.15)

    def test_delete_eodata(self):
        url = reverse('eodata-detail', args=[self.eo_data.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

class UserZoneViewSetDeepTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='userzone_user', password='userzone_pass')
        self.client.login(username='userzone_user', password='userzone_pass')
        polygon = Polygon(((0,0), (0,1), (1,1), (1,0), (0,0)))
        multipolygon = MultiPolygon(polygon)
        self.user_zone = UserZone.objects.create(name='TestZone', user=self.user, geometry=multipolygon)

    def setUp(self):
        from django.contrib.gis.geos import Polygon, MultiPolygon
        self.user = User.objects.create_user(username='userzone_user', password='userzone_pass')
        self.client.login(username='userzone_user', password='userzone_pass')
        polygon = Polygon(((0,0), (0,1), (1,1), (1,0), (0,0)))
        multipolygon = MultiPolygon(polygon)
        self.user_zone = UserZone.objects.create(name='TestZone', user=self.user, geometry=multipolygon)

    def test_create_user_zone(self):
        url = reverse('userzone-list')
        polygon = Polygon(((0,0), (0,1), (1,1), (1,0), (0,0)))
        multipolygon = MultiPolygon(polygon)
        data = {
            'name': 'NewZone',
            'geometry': multipolygon.wkt
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'NewZone')

    def test_update_user_zone(self):
        url = reverse('userzone-detail', args=[self.user_zone.id])
        polygon = Polygon(((0,0), (0,1), (1,1), (1,0), (0,0)))
        multipolygon = MultiPolygon(polygon)
        data = {
            'name': 'UpdatedZone',
            'geometry': multipolygon.wkt
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'UpdatedZone')

    def test_delete_user_zone(self):
        url = reverse('userzone-detail', args=[self.user_zone.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
