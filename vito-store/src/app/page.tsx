'use client';

import { useState } from 'react';

export default function AdminPage() {
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('Conjuntos');
  const [precio, setPrecio] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');

  // Tus credenciales maestras
  const CLOUD_NAME = "dzhz0gz5i";
  const UPLOAD_PRESET = "vitoo_store";
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyhNhp7fmaqKKJAxfY5Dsmlh5P_iugTi_M6QxF7pXolKKDpBOgTHFzF_HbzL3jZoCuM4Q/exec";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje('Subiendo foto... ⏳');

    try {
      let imageUrl = '';

      // 1. Subir foto a Cloudinary
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: formData,
        });

        const cloudinaryData = await cloudinaryRes.json();
        if (cloudinaryData.secure_url) {
          imageUrl = cloudinaryData.secure_url;
        } else {
          throw new Error('No se pudo subir la foto a Cloudinary');
        }
      }

      setMensaje('Guardando en Excel... ⏳');

      // 2. Armar paquete de datos para Excel
      const productData = {
        nombre: nombre,
        categoria: categoria,
        precio: parseFloat(precio),
        imagenUrl: imageUrl,
        stock: 1 // Por defecto le ponemos 1 para que figure "SI" en stock
      };

      // 3. Mandar a Google Sheets
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Evita errores de seguridad en el navegador
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(productData)
      });

      // 4. ¡Éxito!
      setMensaje('¡Producto subido con éxito a la tienda! 🎉');

      // Limpiar formulario para cargar otro
      setNombre('');
      setPrecio('');
      setFile(null);
      (document.getElementById('fileInput') as HTMLInputElement).value = '';

    } catch (error) {
      console.error(error);
      setMensaje('❌ Hubo un error. Revisá tu conexión o las claves.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
        <h2 className="text-2xl font-bold text-center text-pink-600 mb-8">
          Panel de Carga - Vitoo Store 🎀
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre del Producto</label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
              placeholder="Ej: Conjunto de Encaje Rojo"
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Categoría</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="Conjuntos">Conjuntos</option>
              <option value="Bikinis">Bikinis</option>
              <option value="Bombachas">Bombachas</option>
              <option value="Lubricantes & juegos">Lubricantes & juegos</option>
              <option value="Corpiños-Tops">Corpiños / Tops</option>
              <option value="Varios">Varios</option>
            </select>
          </div>

          {/* Precio */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Precio ($)</label>
            <input
              type="number"
              required
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
              placeholder="Ej: 15000"
            />
          </div>

          {/* Foto */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Foto del Producto</label>
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              required
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
            />
          </div>

          {/* Botón Guardar */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading ? 'bg-pink-300 cursor-not-allowed' : 'bg-pink-600 hover:bg-pink-700'
              } transition-colors`}
          >
            {loading ? 'Subiendo...' : 'Publicar Producto 🚀'}
          </button>
        </form>

        {/* Mensaje de estado */}
        {mensaje && (
          <div className="mt-6 text-center text-sm font-semibold text-gray-800 bg-gray-100 p-3 rounded-md border border-gray-200">
            {mensaje}
          </div>
        )}
      </div>
    </div>
  );
}