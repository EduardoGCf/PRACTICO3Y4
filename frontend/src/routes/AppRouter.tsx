// frontend/src/routes/AppRouter.tsx
import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import GeneroPage from '../pages/GeneroPage';
import LibroDetailPage from '../pages/LibroDetailPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import PrivateRoute from '../components/PrivateRoute';
import AdminComprasPage from "../pages/AdminComprasPage";
import AdminUsuariosPage from "../pages/AdminUsuariosPage";
import AdminLibrosPage from "../pages/AdminLibrosPage";
import AdminGenerosPage from "../pages/AdminGenerosPage";
import NuevoLibroPage from '../pages/NuevoLibroPage';
import EditarLibroPage from '../pages/EditarLibroPage';
import MisComprasPage from '../pages/MisComprasPage';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/genero/:id" element={<GeneroPage />} />
      <Route path="/libro/:id" element={<LibroDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/carrito"
        element={
          <PrivateRoute>
            <CartPage />
          </PrivateRoute>
        }
      />
      

    <Route path="/admin/compras" element={<AdminComprasPage />} />
    <Route path="/admin/usuarios" element={<AdminUsuariosPage />} />
    <Route path="/admin/libros" element={<AdminLibrosPage />} />
    <Route path="/admin/generos" element={<AdminGenerosPage />} />
    <Route path="/admin/libros/crear" element={<NuevoLibroPage />} />
    <Route path="/admin/libros/editar/:id" element={<EditarLibroPage />} />
    <Route path="/checkout/:id" element={<CheckoutPage />} />
    <Route path="/mis-compras" element={<PrivateRoute><MisComprasPage /></PrivateRoute>} />
    </Routes>
  );
}
