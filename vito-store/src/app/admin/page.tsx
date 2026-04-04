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
        <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', color: '#1f2937', paddingBottom: '90px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

            {/* Header superior simple y elegante */}
            <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #eaedf1', padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>
                            Agregar producto
                        </h1>
                        <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>Panel de Carga - Vitoo Store 🎀</p>
                    </div>
                </div>
            </header>

            <main style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 24px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>

                        {/* COLUMNA IZQUIERDA: Detalles */}
                        <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {/* Tarjeta: Información Básica */}
                            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03), 0 2px 4px -1px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9', padding: '28px' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 20px 0' }}>Información básica</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                                    {/* Nombre */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                                            Nombre del producto
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={nombre}
                                            onChange={(e) => setNombre(e.target.value)}
                                            placeholder="Ej: Conjunto de Encaje Rojo"
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#ec4899';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(236, 72, 153, 0.15)';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#e5e7eb';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                            style={{
                                                width: '100%',
                                                boxSizing: 'border-box',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                padding: '12px 16px',
                                                fontSize: '15px',
                                                color: '#1f2937',
                                                backgroundColor: '#ffffff',
                                                outline: 'none',
                                                transition: 'all 0.2s ease',
                                            }}
                                        />
                                    </div>

                                    {/* Categoría */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                                            Categoría
                                        </label>
                                        <select
                                            value={categoria}
                                            onChange={(e) => setCategoria(e.target.value)}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#ec4899';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(236, 72, 153, 0.15)';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#e5e7eb';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                            style={{
                                                width: '100%',
                                                boxSizing: 'border-box',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                padding: '12px 16px',
                                                fontSize: '15px',
                                                color: '#1f2937',
                                                backgroundColor: '#ffffff',
                                                outline: 'none',
                                                transition: 'all 0.2s ease',
                                                cursor: 'pointer',
                                                appearance: 'none', // Quita la flecha por defecto para poner una propia
                                                backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'right 16px top 50%',
                                                backgroundSize: '10px auto',
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
                        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                            {/* Tarjeta: Precio */}
                            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03), 0 2px 4px -1px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9', padding: '28px' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 20px 0' }}>Precio</h2>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                                        Precio de venta
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ position: 'absolute', top: '0', bottom: '0', left: '0', paddingLeft: '14px', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                                            <span style={{ color: '#9ca3af', fontSize: '15px' }}>$</span>
                                        </div>
                                        <input
                                            type="number"
                                            required
                                            value={precio}
                                            onChange={(e) => setPrecio(e.target.value)}
                                            placeholder="0.00"
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#ec4899';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(236, 72, 153, 0.15)';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#e5e7eb';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                            style={{
                                                width: '100%',
                                                boxSizing: 'border-box',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                padding: '12px 16px 12px 32px',
                                                fontSize: '15px',
                                                color: '#1f2937',
                                                backgroundColor: '#ffffff',
                                                outline: 'none',
                                                transition: 'all 0.2s ease',
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Tarjeta: Multimedia (Dropzone) */}
                            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03), 0 2px 4px -1px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9', padding: '28px' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 20px 0' }}>Multimedia</h2>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '12px' }}>
                                        Foto del producto
                                    </label>

                                    {/* Dropzone con interacciones manejadas en Javascript */}
                                    <label
                                        htmlFor="fileInput"
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = '#f472b6';
                                            e.currentTarget.style.backgroundColor = '#fdf2f8'; // Tono muy sutil de rosa
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = '#e5e7eb';
                                            e.currentTarget.style.backgroundColor = '#fafafa';
                                        }}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '32px 24px',
                                            border: '2px dashed #e5e7eb',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            backgroundColor: '#fafafa',
                                            textAlign: 'center'
                                        }}
                                    >
                                        <svg
                                            style={{ width: '48px', height: '48px', color: '#9ca3af', marginBottom: '16px' }}
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
                                        <div style={{ fontSize: '14px', color: '#4b5563' }}>
                                            <span style={{ fontWeight: '600', color: '#ec4899' }}>
                                                Haz clic para seleccionar
                                            </span>
                                            {/* Ocultamiento del input estándar accesible */}
                                            <input
                                                id="fileInput"
                                                type="file"
                                                accept="image/*"
                                                required
                                                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                                                style={{
                                                    position: 'absolute', width: '1px', height: '1px', padding: '0',
                                                    margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)',
                                                    whiteSpace: 'nowrap', borderWidth: '0'
                                                }}
                                            />
                                        </div>
                                        <p style={{ fontSize: '12px', color: '#6b7280', margin: '8px 0 0 0' }}>
                                            {file ? (
                                                <span style={{ fontWeight: '500', color: '#db2777', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%', display: 'inline-block' }}>{file.name}</span>
                                            ) : (
                                                "PNG, JPG hasta 10MB"
                                            )}
                                        </p>
                                    </label>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Barra Fija Inferior */}
                    <div style={{ position: 'fixed', bottom: '0', left: '0', right: '0', backgroundColor: '#ffffff', borderTop: '1px solid #eaedf1', padding: '16px 24px', boxShadow: '0 -4px 12px rgba(0,0,0,0.03)', zIndex: 10 }}>
                        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>

                            <div style={{ fontSize: '14px', flex: '1 1 auto', minWidth: '200px' }}>
                                {mensaje ? (
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        fontWeight: '500',
                                        backgroundColor: mensaje.includes('error') ? '#fef2f2' : (mensaje.includes('éxito') ? '#f0fdf4' : '#f0f9ff'),
                                        color: mensaje.includes('error') ? '#b91c1c' : (mensaje.includes('éxito') ? '#15803d' : '#0369a1'),
                                        border: '1px solid ' + (mensaje.includes('error') ? '#fecaca' : (mensaje.includes('éxito') ? '#bbf7d0' : '#bae6fd'))
                                    }}>
                                        {mensaje}
                                    </span>
                                ) : (
                                    <span style={{ color: '#6b7280' }}>Completa todos los campos para publicar.</span>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                onMouseEnter={(e) => {
                                    if (!loading) {
                                        e.currentTarget.style.backgroundColor = '#be185d'; // Rosa oscuro
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                        e.currentTarget.style.boxShadow = '0 6px 12px -2px rgba(236,72,153,0.3)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!loading) {
                                        e.currentTarget.style.backgroundColor = '#ec4899'; // Rosa original
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(236,72,153,0.2)';
                                    }
                                }}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    padding: '12px 28px',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    color: '#ffffff',
                                    backgroundColor: loading ? '#f9a8d4' : '#ec4899',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: loading ? 'none' : '0 2px 4px rgba(236,72,153,0.2)',
                                    minWidth: '200px'
                                }}
                            >
                                {loading ? (
                                    <span style={{ display: 'flex', alignItems: 'center' }}>
                                        <svg
                                            style={{ animation: 'spin 1s linear infinite', marginLeft: '-4px', marginRight: '8px', height: '16px', width: '16px', color: '#ffffff' }}
                                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                        >
                                            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {mensaje === 'Subiendo foto... ⏳' ? 'Procesando...' : 'Guardando...'}
                                    </span>
                                ) : (
                                    'Guardar Producto'
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Pequeño hack para la animación de rotación del loader de carga en estilos inline */}
                    <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
                </form>
            </main>
        </div>
    );
}
