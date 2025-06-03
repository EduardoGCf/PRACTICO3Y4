import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState, useRef, useEffect } from 'react';

export default function Header() {
  const { user, logoutUser } = useAuth();
  const { items } = useCart();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-gray-800 text-white p-4 mb-6">
      <nav className="max-w-4xl mx-auto flex justify-between items-center">
        <Link to="/" className="font-bold text-xl">
          Mi Librería
        </Link>
        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Link to="/carrito" className="relative">
                <span>Carrito</span>
                {items.length > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {items.reduce((acc, i) => acc + i.cantidad, 0)}
                  </span>
                )}
              </Link>
              <Link to="/mis-compras" className="hover:underline">
                Mis Compras
              </Link>
              <span>Hola, {user.username}</span>
              {user.is_staff && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setOpen((prev) => !prev)}
                    className="hover:underline flex items-center gap-1"
                  >
                    Panel Admin
                    <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {open && (
                    <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg z-20 border">
                      <Link to="/admin/compras" className="block px-4 py-2 hover:bg-gray-100">Compras</Link>
                      <Link to="/admin/usuarios" className="block px-4 py-2 hover:bg-gray-100">Usuarios</Link>
                      <Link to="/admin/libros" className="block px-4 py-2 hover:bg-gray-100">Libros</Link>
                      <Link to="/admin/generos" className="block px-4 py-2 hover:bg-gray-100">Géneros</Link>
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={logoutUser}
                className="hover:underline text-red-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">
                Login
              </Link>
              <Link to="/register" className="hover:underline">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
