from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    '''
    Custom permission to allow only owners to edit/remove an object
    '''

    def has_object_permission(self, request, view, obj):
        # Allow read permissions if method is GET, HEAD or OPTIONS, or is an admin/superuser
        if request.method in permissions.SAFE_METHODS or request.user.is_superuser:
            return True

        # Otherwise, check the owner
        return obj.owner == request.user