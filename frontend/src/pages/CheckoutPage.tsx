import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import qrImg from '../assets/qr.png';

interface Libro {
  id: number;
  titulo: string;
  precio: number;
}

interface ItemCompra {
  id: number;
  libro: Libro;
  precio_unitario: number;
  cantidad: number;
}

interface CompraConItems {
  id: number;
  usuario: string;
  fecha: string;
  total: string;
  estado: string;
  comprobante: string | null;
  items: ItemCompra[];
}

export default function CheckoutPage() {
  const { clearCart } = useCart();
  const [carrito, setCarrito] = useState<CompraConItems | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<CompraConItems>('/compras/mi-carrito/');
        if (!data || !data.items || data.items.length === 0) {
          setError('Tu carrito está vacío.');
        } else {
          setCarrito(data);
        }
      } catch {
        setError('Error al cargar tu carrito.');
      }
    })();
  }, []);

  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !carrito) {
      setError('Debes seleccionar un archivo.');
      return;
    }
    setSubiendo(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('comprobante', file);
      await api.post(`/compras/${carrito.id}/subir-comprobante/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { data: nuevoCarrito } = await api.get<CompraConItems>('/compras/mi-carrito/');
      if (!nuevoCarrito || !nuevoCarrito.items || nuevoCarrito.items.length === 0) {
        clearCart();
      } else {
        clearCart();
      }
      navigate('/');
    } catch {
      setError('Error al subir el comprobante.');
    } finally {
      setSubiendo(false);
    }
  };

  if (error) {
    return (
      <div className="max-w-md mx-auto p-6 mt-12 bg-white rounded-xl shadow-lg border border-gray-100">
        <h1 className="text-2xl font-bold mb-4 text-blue-700">Checkout</h1>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!carrito) {
    return (
      <div className="max-w-md mx-auto p-6 mt-12 bg-white rounded-xl shadow-lg border border-gray-100">
        <h1 className="text-2xl font-bold mb-4 text-blue-700">Checkout</h1>
        <p>Cargando carrito...</p>
      </div>
    );
  }


  const total = carrito.items.reduce(
    (acc, i) => acc + Number(i.libro.precio) * i.cantidad,
    0
  );

  return (
    <div className="max-w-md mx-auto p-6 mt-12 bg-white rounded-xl shadow-lg border border-gray-100">
      <h1 className="text-3xl font-bold mb-4 text-blue-700 flex items-center gap-2">
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2l4 -4" />
          <circle cx={12} cy={12} r={10} stroke="currentColor" strokeWidth={2} />
        </svg>
        Checkout
      </h1>
      <div className="mb-3 p-3 rounded-md bg-blue-50 border border-blue-100 text-blue-700 font-medium flex flex-col items-center gap-1">
        <span className="text-lg">Escanea el QR y paga por transferencia</span>
        <img
          src={qrImg}
          alt="QR para pago"
          className="w-36 h-36 rounded border shadow-sm my-1"
        />
        <small className="text-gray-500 font-normal">Cuenta bancaria: <span className="font-bold">1234567890</span></small>
      </div>

      <div className="mb-4">
        <div className="text-gray-600 font-semibold mb-1">Resumen de tu compra:</div>
        <ul className="divide-y divide-gray-100 rounded-md overflow-hidden bg-gray-50 border">
          {carrito.items.map((i) => (
            <li key={i.id} className="flex justify-between items-center px-3 py-2">
              <div>
                <span className="font-medium">{i.cantidad} x {i.libro.titulo}</span>
                <span className="ml-2 text-xs text-gray-400">(${Number(i.libro.precio).toFixed(2)} c/u)</span>
              </div>
              <span className="font-mono">${(i.cantidad * Number(i.libro.precio)).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-end mt-2 text-lg">
          <span>Total: <b>${total.toFixed(2)}</b></span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <label className="flex flex-col gap-2 font-medium text-gray-700">
          <span className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12v8m0 0l3.5-3.5M12 20l-3.5-3.5" />
            </svg>
            Subir comprobante de pago:
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100
                        w transition-all duration-150 ease-in-out
                        mt-1"
          />
        </label>


        {preview && (
          <div className="flex flex-col items-center mb-2">
            <span className="text-xs text-gray-500 mb-1">Previsualización del comprobante:</span>
            <img src={preview} alt="Preview comprobante" className="w-32 h-32 rounded-lg shadow border object-contain" />
          </div>
        )}

        <button
          type="submit"
          disabled={subiendo}
          className={`w-full py-2 font-semibold rounded transition-all duration-150 shadow
            ${subiendo ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'} text-white
            focus:ring-2 focus:ring-blue-300`}
        >
          {subiendo ? 'Subiendo...' : 'Enviar comprobante'}
        </button>
      </form>
    </div>
  );
}
