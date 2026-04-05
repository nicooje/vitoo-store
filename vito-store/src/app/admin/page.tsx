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
        <div className="min-h-screen bg-gray-50 text-gray-900 pb-24 font-sans">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-5 shadow-sm">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Agregar producto</h1>
                        <p className="text-sm text-gray-600 mt-1">Panel de Carga - Vitoo Store 🎀</p>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto p-6 md:p-8">
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                        
                        {/* COLUMNA IZQUIERDA: Detalles */}
                        <div className="md:col-span-7 flex flex-col gap-6">
                            {/* Tarjeta: Información Básica */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Información básica</h2>
                                <div className="flex flex-col gap-5">
                                    
                                    {/* Nombre */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del producto</label>
                                        <input
                                            type="text"
                                            required
                                            value={nombre}
                                            onChange={(e) => setNombre(e.target.value)}
                                            placeholder="Ej: Conjunto de Encaje Rojo"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all placeholder-gray-400"
                                        />
                                    </div>

                                    {/* Categoría */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                                        <select
                                            value={categoria}
                                            onChange={(e) => setCategoria(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all appearance-none cursor-pointer"
                                            style={{
                                                backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'right 16px top 50%',
                                                backgroundSize: '12px auto',
                                            }}
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
                        <div className="md:col-span-5 flex flex-col gap-6">
                            
                            {/* Tarjeta: Precio */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Precio</h2>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Precio de venta</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <span className="text-gray-400 font-medium">$</span>
                                        </div>
                                        <input
                                            type="number"
                                            required
                                            value={precio}
                                            onChange={(e) => setPrecio(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all placeholder-gray-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Tarjeta: Multimedia (Modificado) */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Multimedia</h2>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Foto del producto</label>
                                    <div className="flex flex-col gap-3">
                                        <input
                                            id="fileInput"
                                            type="file"
                                            accept="image/*"
                                            required
                                            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                                            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-600 hover:file:bg-pink-100 file:transition-colors file:cursor-pointer cursor-pointer border border-gray-200 rounded-full py-1.5 focus:outline-none"
                                        />
                                        <p className="text-xs text-gray-500 ml-2">PNG, JPG hasta 10MB</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Barra Fija Inferior */}
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                            
                            <div className="text-sm flex-1">
                                {mensaje ? (
                                    <span className={`inline-flex items-center px-4 py-2 rounded-lg font-medium border ${
                                        mensaje.includes('error') ? 'bg-red-50 text-red-700 border-red-200' :
                                        mensaje.includes('éxito') ? 'bg-green-50 text-green-700 border-green-200' :
                                        'bg-blue-50 text-blue-700 border-blue-200'
                                    }`}>
                                        {mensaje}
                                    </span>
                                ) : (
                                    <span className="text-gray-500">Completa todos los campos para publicar.</span>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex justify-center items-center px-8 py-3.5 rounded-xl font-bold text-white transition-all min-w-[220px] shadow-sm ${
                                    loading 
                                    ? 'bg-pink-400 cursor-not-allowed shadow-none' 
                                    : 'bg-pink-600 hover:bg-pink-700 hover:shadow-pink-600/30 hover:-translate-y-0.5 active:translate-y-0'
                                }`}
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {mensaje === 'Subiendo foto... ⏳' ? 'Subiendo foto...' : 'Guardando...'}
                                    </span>
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
