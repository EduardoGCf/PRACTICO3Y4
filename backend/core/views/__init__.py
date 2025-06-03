from .genero_views import GeneroViewSet
from .libro_views import LibroViewSet
from .compra_views import CompraViewSet
from .usuario_views import UsuarioViewSet
from .auth_views import (RegisterView,
    LoginView,
    LogoutView,
    UserDetailView,
    obtain_csrf_token,
)