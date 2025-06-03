from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from geoapp.tokens import account_activation_token

@api_view(['GET'])
@permission_classes([AllowAny])
def activate_account_api(request):
    """
    API endpoint to activate a user account via frontend
    """
    uid = request.query_params.get('uid')
    token = request.query_params.get('token')
    
    if not uid or not token:
        return Response({'message': 'Paramètres d\'activation manquants'}, status=400)
    
    try:
        uid = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError) as e:
        print(f"Erreur de décodage UID: {e}")
        user = None
    except User.DoesNotExist:
        print(f"Utilisateur avec UID {uid} non trouvé")
        user = None
    
    if user is not None:
        if user.is_active:
            return Response({
                'message': 'Votre compte est déjà activé.',
                'success': True
            })
        if account_activation_token.check_token(user, token):
            user.is_active = True
            user.save()
            print(f"Compte {user.username} activé avec succès")
            return Response({
                'message': 'Votre compte a été activé avec succès!',
                'success': True
            })
        else:
            print(f"Token invalide pour l'utilisateur {user.username}")
    
    return Response({
        'message': 'Le lien d\'activation est invalide ou a expiré.',
        'success': False
    }, status=400)