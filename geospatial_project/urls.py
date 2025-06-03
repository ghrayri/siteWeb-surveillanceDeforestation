from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
from django.contrib.auth import views as auth_views
from django.views.static import serve

urlpatterns = [
    # Admin interface
    path('admin/', admin.site.urls),
    
    # API endpoints - used by React frontend
    path('api/', include('api.urls')),
    
    # Traditional Django views - will be replaced by React Router in production
    path('', include('geoapp.urls')),
    
    # Account activation endpoint
    path('activate/', include('geoapp.urls')),
    
    # Static files
    path('favicon.ico', RedirectView.as_view(url='/static/favicon.ico')),
    path('assets/<path:path>', serve, {'document_root': settings.BASE_DIR / 'assets'}),
    
    # Authentication URLs - will be handled by React in production
    path('accounts/login/', auth_views.LoginView.as_view(template_name='geoapp/login.html'), name='accounts_login'),
    path('accounts/logout/', auth_views.LogoutView.as_view(next_page='/'), name='logout'),
]

# Serve media and static files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)