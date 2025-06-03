from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User

class UserIntegrationTests(APITestCase):
    def test_register_and_login(self):
        # Register user
        url_register = reverse('register')
        data = {
            'username': 'integrationuser',
            'email': 'integrationuser@example.com',
            'password': 'integrationpass123',
            'first_name': 'Integration',
            'last_name': 'User'
        }
        response = self.client.post(url_register, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Login user
        login = self.client.login(username='integrationuser', password='integrationpass123')
        self.assertTrue(login)

        # Get user profile
        url_profile = reverse('profile')
        response = self.client.get(url_profile)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'integrationuser')
