'use client';

import { useState, useEffect } from 'react';

// Tipado del producto que vendrá de la API
export type Product = {
    id: number;
    name: string;
    category: string;
    price: number;
    image_url: string;
    stock: boolean;
    size?: string;
    color?: string;
    quantity?: number;
};

export default function AdminPage() {
    const [products, setProducts] = useState<Product[]>([]);
    
    // Paginación y Filtro
    const [filterCategory, setFilterCategory] = useState('Todas');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;
    
    // Estados del Formulario
    const [editingProductId, setEditingProductId] = useState<number | null>(null);
    const [nombre, setNombre] = useState('');
    const [categoria, setCategoria] = useState('Conjuntos');
    const [precio, setPrecio] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [existingImageUrl, setExistingImageUrl] = useState('');
    const [hasStock, setHasStock] = useState(true);
    
    // Variantes y Control de Stock
    const [talle, setTalle] = useState('');
    const [colorItem, setColorItem] = useState('');
    const [cantidad, setCantidad] = useState<number | string>(1);

    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState('');

    // Tus credenciales maestras Cloudinary
    const CLOUD_NAME = "dzhz0gz5i";
    const UPLOAD_PRESET = "vitoo_store";

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/admin/products');
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleEditProduct = (p: Product) => {
        setEditingProductId(p.id);
        setNombre(p.name);
        setCategoria(p.category);
        setPrecio(p.price.toString());
        setExistingImageUrl(p.image_url);
        setHasStock(p.stock);
        setTalle(p.size || '');
        setColorItem(p.color || '');
        setCantidad(p.quantity ?? 1);
        setFile(null); // Resetear archivo nuevo
        setMensaje(`Editando producto: ${p.name}`);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Subir al formulario
    };

    const handleCancelEdit = () => {
        setEditingProductId(null);
        setNombre('');
        setCategoria('Conjuntos');
        setPrecio('');
        setExistingImageUrl('');
        setHasStock(true);
        setTalle('');
        setColorItem('');
        setCantidad(1);
        setFile(null);
        setMensaje('');
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMensaje('Subiendo foto... ⏳');

        try {
            let imageUrl = existingImageUrl;

            // 1. Subir foto a Cloudinary si se seleccionó una nueva
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

            // Si es producto nuevo y no hay foto
            if (!imageUrl && !file) {
                throw new Error("Agrega una foto obligatoriamente");
            }

            setMensaje('Guardando en Excel... ⏳');

            // 2. Armar paquete de datos para la API
            const productData = {
                name: nombre,
                category: categoria,
                price: parseFloat(precio),
                image_url: imageUrl,
                stock: hasStock,
                size: talle,
                color: colorItem,
                quantity: parseInt(cantidad.toString()) || 0
            };

            // 3. Mandar a la API según si es Edición o Creación
            const apiUrl = '/api/admin/products';
            const method = editingProductId ? 'PUT' : 'POST';
            
            const payload = editingProductId 
                ? { id: editingProductId, ...productData } 
                : productData;

            const finalRes = await fetch(apiUrl, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!finalRes.ok) throw new Error("Error respondiendo desde API Sheet");

            // 4. ¡Éxito!
            setMensaje(editingProductId ? '¡Producto actualizado con éxito! 🎉' : '¡Producto subido con éxito! 🎉');
            
            // Refrescar listado
            await fetchProducts();

            // Limpiar formulario dejando el mensaje de exito
            const msjExito = editingProductId ? '¡Producto actualizado! 🎉' : '¡Producto creado! 🎉';
            handleCancelEdit();
            setMensaje(msjExito);

        } catch (error: any) {
            console.error(error);
            setMensaje(`❌ Hubo un error. ${error.message || ''}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (id: number, name: string) => {
        if (!window.confirm(`¿Seguro que querés eliminar el producto "${name}"? Esta acción no se puede deshacer.`)) {
            return;
        }

        setLoading(true);
        setMensaje(`Eliminando ${name}... ⏳`);

        try {
            const res = await fetch('/api/admin/products', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, name })
            });

            if (!res.ok) throw new Error("Error respondiendo desde API Sheet");

            setMensaje('¡Producto eliminado con éxito! 🗑️');
            await fetchProducts();
        } catch (error: any) {
            console.error(error);
            setMensaje(`❌ Hubo un error al eliminar. ${error.message || ''}`);
        } finally {
            setLoading(false);
        }
    };

    // Lógica Derivada para Paginación y Filtros
    const uniqueCategories = ['Todas', ...Array.from(new Set(products.map(p => p.category)))];
    const filteredProducts = products.filter(p => filterCategory === 'Todas' || p.category === filterCategory);
    
    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    
    const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 pb-32 font-sans">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-5 shadow-sm">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Gestor de Catálogo</h1>
                        <p className="text-sm text-gray-600 mt-1">Panel de Control General - Vitoo Store 🎀</p>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto p-6 md:p-8 flex flex-col gap-12">
                
                {/* ZONA 1: FORMULARIO */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black text-gray-900">
                            {editingProductId ? '✏️ Editando Producto' : '✨ Agregar Nuevo Producto'}
                        </h2>
                        {editingProductId && (
                            <button 
                                onClick={handleCancelEdit} 
                                className="text-sm text-pink-600 font-bold bg-pink-50 px-3 py-1.5 rounded-full hover:bg-pink-100 transition-colors"
                            >
                                Cancelar Edición
                            </button>
                        )}
                    </div>
                    
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                            
                            {/* COLUMNA IZQUIERDA: Detalles */}
                            <div className="md:col-span-7 flex flex-col gap-6">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
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

                                        {/* Variantes y Stock Exacto */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {/* Talle */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Talle</label>
                                                <input
                                                    type="text"
                                                    value={talle}
                                                    onChange={(e) => setTalle(e.target.value)}
                                                    placeholder="Ej: M / 90"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all placeholder-gray-400"
                                                />
                                            </div>

                                            {/* Color */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                                                <input
                                                    type="text"
                                                    value={colorItem}
                                                    onChange={(e) => setColorItem(e.target.value)}
                                                    placeholder="Ej: Rojo"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all placeholder-gray-400"
                                                />
                                            </div>

                                            {/* Cantidad */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Stock (Cant.)</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={cantidad}
                                                    onChange={(e) => setCantidad(e.target.value)}
                                                    placeholder="Ej: 5"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all placeholder-gray-400"
                                                />
                                            </div>
                                        </div>

                                        {/* Interruptor de Stock */}
                                        <div className="pt-2 flex flex-col gap-2">
                                            <span className="text-sm font-medium text-gray-700">Disponibilidad de Stock</span>
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className="relative">
                                                    <input 
                                                        type="checkbox" 
                                                        className="sr-only" 
                                                        checked={hasStock} 
                                                        onChange={(e) => setHasStock(e.target.checked)} 
                                                    />
                                                    <div className={`block w-14 h-8 rounded-full transition-colors ${hasStock ? 'bg-pink-500' : 'bg-gray-300'}`}></div>
                                                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${hasStock ? 'transform translate-x-6' : ''}`}></div>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-900 leading-tight">Estado público</span>
                                                    <span className="text-xs text-gray-500">{hasStock ? '✅ Disponible en tienda' : '🚫 Agotado (Etiqueta rojiza)'}</span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* COLUMNA DERECHA: Precio y Fotos */}
                            <div className="md:col-span-5 flex flex-col gap-6">
                                
                                {/* Tarjeta: Precio */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
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

                                {/* Tarjeta: Multimedia */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Foto del producto</label>
                                    <div className="flex flex-col gap-3">
                                        {existingImageUrl && (
                                            <div className="mb-2 relative rounded-lg overflow-hidden border border-gray-200 aspect-[3/4] w-24">
                                                <img src={existingImageUrl} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <input
                                            id="fileInput"
                                            type="file"
                                            accept="image/*"
                                            required={!existingImageUrl}
                                            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                                            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-600 hover:file:bg-pink-100 file:transition-colors file:cursor-pointer cursor-pointer border border-gray-200 rounded-full py-1.5 focus:outline-none"
                                        />
                                        <p className="text-xs text-gray-500 ml-2">PNG, JPG. {existingImageUrl && "Sube otra para cambiar."}</p>
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
                                            mensaje.includes('error') || mensaje.includes('❌') ? 'bg-red-50 text-red-700 border-red-200' :
                                            mensaje.includes('éxito') || mensaje.includes('🎉') ? 'bg-green-50 text-green-700 border-green-200' :
                                            'bg-blue-50 text-blue-700 border-blue-200'
                                        }`}>
                                            {mensaje}
                                        </span>
                                    ) : (
                                        <span className="text-gray-500">Completa los datos para subir o editar.</span>
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
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Procesando...
                                        </span>
                                    ) : (
                                        editingProductId ? 'Actualizar Producto' : 'Guardar Nuevo Producto'
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </section>

                <hr className="border-gray-200 my-4" />

                {/* ZONA 2: LISTADO DE PRODUCTOS */}
                <section>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                        <h2 className="text-2xl font-black text-gray-900">Tus Productos Publicados</h2>
                        
                        {/* Filtro por Categoría */}
                        <div className="w-full sm:w-auto">
                            <select
                                value={filterCategory}
                                onChange={(e) => {
                                    setFilterCategory(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 appearance-none cursor-pointer"
                                style={{
                                    backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 12px top 50%',
                                    backgroundSize: '10px auto',
                                }}
                            >
                                {uniqueCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    {products.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
                            Cargando productos de Google Sheets... ⏳
                        </div>
                    ) : paginatedProducts.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
                            No hay productos en esta categoría.
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left font-sm">
                                        <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase tracking-wider">
                                            <tr>
                                                <th className="p-4 w-16 text-center">Foto</th>
                                                <th className="p-4">Info</th>
                                                <th className="p-4 hidden sm:table-cell">Precio</th>
                                                <th className="p-4 text-center">Stock</th>
                                                <th className="p-4 text-right">Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {paginatedProducts.map((p) => (
                                                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="p-4 text-center">
                                                        <img src={p.image_url} alt={p.name} className="w-12 h-16 object-cover rounded-md mx-auto shadow-sm" />
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="font-bold text-gray-900 block leading-tight">{p.name}</span>
                                                        <span className="text-xs text-gray-500">{p.category}</span>
                                                        {(p.size || p.color) && (
                                                            <div className="mt-1 flex items-center gap-2 text-xs">
                                                                {p.size && <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Talle: {p.size}</span>}
                                                                {p.color && <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Color: {p.color}</span>}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-4 font-bold text-gray-900 hidden sm:table-cell">
                                                        ${p.price.toLocaleString('es-AR')}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <div className="flex flex-col justify-center items-center gap-1">
                                                            {p.stock ? (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">OK</span>
                                                            ) : (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">AGOTADO</span>
                                                            )}
                                                            <span className="text-[11px] font-medium text-gray-500">{p.quantity ?? 0} unid.</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button 
                                                                onClick={() => handleEditProduct(p)}
                                                                className="text-pink-600 font-bold text-sm bg-pink-50 hover:bg-pink-100 px-3 py-1.5 rounded-lg transition-colors border border-pink-100"
                                                            >
                                                                Editar
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteProduct(p.id, p.name)}
                                                                className="text-red-600 font-bold text-sm bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors border border-red-100"
                                                            >
                                                                Eliminar
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Paginación */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-100 rounded-xl shadow-sm">
                                    <div className="flex flex-1 justify-between sm:hidden">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={safeCurrentPage === 1}
                                            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Anterior
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={safeCurrentPage === totalPages}
                                            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Siguiente
                                        </button>
                                    </div>
                                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm text-gray-700">
                                                Mostrando <span className="font-bold">{startIndex + 1}</span> a <span className="font-bold">{Math.min(startIndex + ITEMS_PER_PAGE, filteredProducts.length)}</span> de <span className="font-bold">{filteredProducts.length}</span> resultados
                                            </p>
                                        </div>
                                        <div>
                                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                                <button
                                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                    disabled={safeCurrentPage === 1}
                                                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
                                                >
                                                    <span className="sr-only">Anterior</span>
                                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                                
                                                <div className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:outline-none">
                                                    Página {safeCurrentPage} de {totalPages}
                                                </div>

                                                <button
                                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                    disabled={safeCurrentPage === totalPages}
                                                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
                                                >
                                                    <span className="sr-only">Siguiente</span>
                                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </section>

            </main>
        </div>
    );
}
