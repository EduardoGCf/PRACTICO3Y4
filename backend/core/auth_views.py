from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout, get_user_model

User = get_user_model()


# ----------------- Register -----------------
class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Las contraseñas no coinciden")
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        return User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'detail': 'Usuario creado correctamente'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ----------------- Login -----------------
class LoginView(APIView):
    permission_classes = [AllowAny]

    class InputSerializer(serializers.Serializer):
        username = serializers.CharField()
        password = serializers.CharField(write_only=True)

    def post(self, request):
        print("----- LLAMADA A LoginView.post -----")
        print("Headers recibidas:")
        for k, v in request.headers.items():
            print(f"  {k}: {v}")
        print("Cookies recibidas:")
        for k, v in request.COOKIES.items():
            print(f"  {k}: {v}")
        print("Body (request.data):", request.data)
        print("--------------------------------------")


        serializer = self.InputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        user = authenticate(request, username=username, password=password)
        if user:
            if user.is_active:
                login(request, user)
                return Response({'detail': 'Login exitoso'}, status=status.HTTP_200_OK)
            else:
                return Response({'detail': 'Usuario inactivo'}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            return Response({'detail': 'Credenciales inválidas'}, status=status.HTTP_401_UNAUTHORIZED)


# ----------------- Logout -----------------
class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):

        print("----- LLAMADA A LogoutView.post -----")
        print("User:", getattr(request, 'user', 'AnonymousUser'))
        print("Headers recibidas:")
        for k, v in request.headers.items():
            print(f"  {k}: {v}")
        print("Cookies recibidas:")
        for k, v in request.COOKIES.items():
            print(f"  {k}: {v}")
        print("Body (request.data):", request.data)
        print("---------------------------------------")



        if hasattr(request, 'user') and request.user.is_authenticated:
            logout(request)
            return Response({'detail': 'Se ha cerrado sesión correctamente'}, status=status.HTTP_200_OK)
        else:
            return Response({'detail': 'No había sesión activa'}, status=status.HTTP_200_OK)


# ----------------- detale del usuario -----------------
class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_staff': user.is_staff,
        }
        return Response(data, status=status.HTTP_200_OK)


# ----------------- Obtengo Token -----------------
@api_view(['GET'])
@permission_classes([AllowAny])
def obtain_csrf_token(request):
    token = get_token(request)
    print(f"[DEBUG] CSRF token generado: {token}")
    return Response({'detail': 'CSRF cookie set', 'csrf_token': token})