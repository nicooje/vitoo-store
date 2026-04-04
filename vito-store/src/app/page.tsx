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
    <div className="min-h-screen bg-gray-50 text-gray-800 pb-20">
      {/* Header superior simple y elegante */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">
              Agregar producto
            </h1>
            <p className="text-sm text-gray-500 mt-1">Panel de Carga - Vitoo Store 🎀</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* COLUMNA IZQUIERDA: Detalles (Toma 2 de 3 columnas en escritorio) */}
            <div className="lg:col-span-2 space-y-6">

              {/* Tarjeta: Información Básica */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Información básica</h2>
                <div className="space-y-4">
                  {/* Nombre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del producto
                    </label>
                    <input
                      type="text"
                      required
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej: Conjunto de Encaje Rojo"
                      className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                    />
                  </div>

                  {/* Categoría */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría
                    </label>
                    <select
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value)}
                      className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                    >
                      <option value="Conjuntos">Conjuntos</option>
                      <option value="Bikinis">Bikinis</option>
                      <option value="Bombachas">Bombachas</option>
                      <option value="Lubricantes & juegos">Lubricantes & juegos</option>
                      <option value="Corpiños-Tops">Corpiños / Tops</option>
                      <option value="Varios">Varios</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA: Precio y Fotos */}
            <div className="space-y-6">

              {/* Tarjeta: Precio */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Precio</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio de venta
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      required
                      value={precio}
                      onChange={(e) => setPrecio(e.target.value)}
                      placeholder="0.00"
                      className="w-full border border-gray-300 rounded-md py-2 pl-7 pr-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Tarjeta: Multimedia (Dropzone) */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Multimedia</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Foto del producto
                  </label>

                  {/* Área de Dropzone clickeable */}
                  <label
                    htmlFor="fileInput"
                    className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-pink-400 hover:bg-pink-50 transition-colors cursor-pointer group"
                  >
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400 group-hover:text-pink-500 transition-colors"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-pink-600 group-hover:text-pink-500">
                          Haz clic para seleccionar
                        </span>
                        <input
                          id="fileInput"
                          type="file"
                          accept="image/*"
                          required
                          onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                          className="sr-only" /* Oculta el input original pero lo mantiene funcional */
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {/* Si hay archivo, muestra el nombre. Si no, texto por defecto */}
                        {file ? (
                          <span className="font-medium text-pink-600 truncate block max-w-xs px-2">{file.name}</span>
                        ) : (
                          "PNG, JPG hasta 10MB"
                        )}
                      </p>
                    </div>
                  </label>
                </div>
              </div>

            </div>
          </div>

          {/* Barra Fija Inferior: Botón Guardar y Mensajes */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">

              {/* Mensaje de estado dinámico */}
              <div className="text-sm font-medium w-full sm:w-auto text-center sm:text-left">
                {mensaje ? (
                  <span className={`inline-flex items-center px-3 py-1 rounded-md ${mensaje.includes('error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                    {mensaje}
                  </span>
                ) : (
                  <span className="text-gray-500 hidden sm:inline-block">Completa todos los campos para publicar.</span>
                )}
              </div>

              {/* Botón Guardar Premium */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full sm:w-auto inline-flex justify-center items-center py-2.5 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading
                    ? 'bg-pink-400 cursor-not-allowed'
                    : 'bg-pink-600 hover:bg-pink-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500'
                  } transition-all duration-200`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {mensaje === 'Subiendo foto... ⏳' ? 'Procesando imagen...' : 'Guardando...'}
                  </>
                ) : (
                  'Guardar Producto'
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
