from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permission personnalisée pour permettre uniquement aux propriétaires d'un objet de le modifier.
    """

    def has_permission(self, request, view):
        # Autoriser toutes les méthodes de lecture sans authentification
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Les permissions en lecture sont autorisées pour toute requête,
        # donc nous autorisons toujours GET, HEAD ou OPTIONS
        if request.method in permissions.SAFE_METHODS:
            return True

        # Les permissions d'écriture ne sont accordées qu'au propriétaire de l'objet
        # ou si l'utilisateur est un administrateur
        if hasattr(obj, 'user'):
            return obj.user == request.user or request.user.is_staff
        elif hasattr(obj, 'created_by'):
            return obj.created_by == request.user or request.user.is_staff
        elif hasattr(obj, 'user_zone'):
            return obj.user_zone.user == request.user or request.user.is_staff
        
        # Par défaut, refuser la permission
        return False


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permission personnalisée pour permettre uniquement aux administrateurs de modifier les objets et aux utilisateurs authentifiés de lire.
    """

    def has_permission(self, request, view):
        # Autoriser toutes les méthodes de lecture sans authentification
        if request.method in permissions.SAFE_METHODS:
            return True
        # Les permissions d'écriture ne sont accordées qu'aux administrateurs
        return request.user and request.user.is_authenticated and request.user.is_staff


class AllowPostAny(permissions.BasePermission):
    """
    Custom permission to allow any POST request without authentication,
    and allow safe methods for everyone.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.method == 'POST':
            return True
        return request.user and request.user.is_authenticated
