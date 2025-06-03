from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    GeneroViewSet,
    LibroViewSet,
    CompraViewSet,
    UsuarioViewSet,
    RegisterView,
    LoginView,
    LogoutView,
    UserDetailView,
    obtain_csrf_token,
)

router = DefaultRouter()
router.register(r'generos', GeneroViewSet, basename='genero')
router.register(r'libros', LibroViewSet, basename='libro')
router.register(r'compras', CompraViewSet, basename='compra')
router.register(r'usuarios', UsuarioViewSet, basename='usuario')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', RegisterView.as_view(), name='auth-register'),
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('auth/logout/', LogoutView.as_view(), name='auth-logout'),
    path('auth/user/', UserDetailView.as_view(), name='auth-user'),
    path('auth/csrf/', obtain_csrf_token, name='auth-csrf'),
]
