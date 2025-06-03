from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser

from django.contrib.auth import get_user_model
from ..serializers import UserSerializer

User = get_user_model()

class UsuarioViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
