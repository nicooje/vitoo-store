'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

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
    price3?: number;
    price6?: number;
    price9?: number;
    price12?: number;
};

export type Order = {
    id: string;
    date: string;
    clientName: string;
    whatsapp: string;
    deliveryMethod: string;
    paymentMethod: string;
    total: number;
    items: string;
    status?: string;
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
    const [price3, setPrice3] = useState('');
    const [price6, setPrice6] = useState('');
    const [price9, setPrice9] = useState('');
    const [price12, setPrice12] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [existingImageUrl, setExistingImageUrl] = useState('');
    const [hasStock, setHasStock] = useState(true);
    
    // Variantes y Control de Stock
    const [talle, setTalle] = useState('');
    const [colorItem, setColorItem] = useState('');
    const [cantidad, setCantidad] = useState<number | string>(1);

    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        if (mensaje) {
            if (mensaje.includes('error') || mensaje.includes('❌')) {
                toast.error(mensaje, { id: 'admin-toast' });
            } else if (mensaje.includes('⏳')) {
                toast.loading(mensaje, { id: 'admin-toast' });
            } else {
                toast.success(mensaje, { id: 'admin-toast' });
            }
        }
    }, [mensaje]);

    // Estados de las Pestañas y Pedidos
    const [activeTab, setActiveTab] = useState<'dashboard' | 'catalogo' | 'ventas'>('dashboard');
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

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

    const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
            const res = await fetch('/api/admin/orders');
            const data = await res.json();
            if (Array.isArray(data)) {
                setOrders(data);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoadingOrders(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchOrders();
    }, []);

    const handleEditProduct = (p: Product) => {
        setEditingProductId(p.id);
        setNombre(p.name);
        setCategoria(p.category);
        setPrecio(p.price.toString());
        setPrice3(p.price3 ? p.price3.toString() : '');
        setPrice6(p.price6 ? p.price6.toString() : '');
        setPrice9(p.price9 ? p.price9.toString() : '');
        setPrice12(p.price12 ? p.price12.toString() : '');
        setExistingImageUrl(p.image_url);
        setHasStock(p.stock);
        setTalle(p.size || '');
        setColorItem(p.color || '');
        setCantidad(p.quantity ?? 1);
        setFiles([]); // Resetear archivo nuevo
        setMensaje(`Editando producto: ${p.name}`);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Subir al formulario
    };

    const handleCancelEdit = () => {
        setEditingProductId(null);
        setNombre('');
        setCategoria('Conjuntos');
        setPrecio('');
        setPrice3('');
        setPrice6('');
        setPrice9('');
        setPrice12('');
        setExistingImageUrl('');
        setHasStock(true);
        setTalle('');
        setColorItem('');
        setCantidad(1);
        setFiles([]);
        setMensaje('');
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMensaje('Subiendo foto... ⏳');

        try {
            let finalImageUrls = existingImageUrl ? existingImageUrl.split(',').filter(Boolean) : [];

            // 1. Subir foto a Cloudinary si se seleccionaron nuevas
            if (files.length > 0) {
                finalImageUrls = []; // Si sube nuevas, pisamos las viejas por simplicidad
                setMensaje(`Subiendo ${files.length} foto/s a Cloudinary... ⏳`);

                for (const currentFile of files) {
                    const formData = new FormData();
                    formData.append('file', currentFile);
                    formData.append('upload_preset', UPLOAD_PRESET);

                    const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                        method: 'POST',
                        body: formData,
                    });

                    const cloudinaryData = await cloudinaryRes.json();
                    if (cloudinaryData.secure_url) {
                        finalImageUrls.push(cloudinaryData.secure_url);
                    } else {
                        throw new Error('No se pudo subir la foto a Cloudinary');
                    }
                }
            }

            // Si es producto nuevo y no hay foto
            if (finalImageUrls.length === 0) {
                throw new Error("Agrega una foto obligatoriamente");
            }

            setMensaje('Guardando en Excel... ⏳');

            // 2. Armar paquete de datos para la API
            const productData = {
                name: nombre,
                category: categoria,
                price: parseFloat(precio),
                image_url: finalImageUrls.join(','),
                stock: hasStock,
                size: talle,
                color: colorItem,
                quantity: parseInt(cantidad.toString()) || 0,
                price3: price3 ? parseFloat(price3) : undefined,
                price6: price6 ? parseFloat(price6) : undefined,
                price9: price9 ? parseFloat(price9) : undefined,
                price12: price12 ? parseFloat(price12) : undefined
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

            const data = await finalRes.json();
            if (!finalRes.ok) throw new Error(data.error || "Error al comunicarse con la hoja de Google Sheets");

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

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Error al eliminar desde Google Sheets");

            setMensaje('¡Producto eliminado con éxito! 🗑️');
            await fetchProducts();
        } catch (error: any) {
            console.error(error);
            setMensaje(`❌ Hubo un error al eliminar. ${error.message || ''}`);
        } finally {
            setLoading(false);
        }
    };

    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    const toggleSelection = (id: number) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const toggleAllSelection = () => {
        if (selectedIds.size === paginatedProducts.length && paginatedProducts.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(paginatedProducts.map(p => p.id)));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!window.confirm(`¿Seguro que querés eliminar ${selectedIds.size} productos seleccionados? Esta acción no se puede deshacer.`)) {
            return;
        }

        setLoading(true);
        setMensaje(`Eliminando ${selectedIds.size} productos... ⏳`);

        try {
            const itemsToDelete = Array.from(selectedIds).map(id => {
                const product = products.find(p => p.id === id);
                return { id, name: product?.name };
            });

            const res = await fetch('/api/admin/products', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: itemsToDelete })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Error al eliminar masivamente desde Google Sheets");

            setMensaje(`¡${data.count || selectedIds.size} productos eliminados con éxito! 🗑️`);
            setSelectedIds(new Set());
            await fetchProducts();
        } catch (error: any) {
            console.error(error);
            setMensaje(`❌ Hubo un error al eliminar. ${error.message || ''}`);
        } finally {
            setLoading(false);
        }
    };

    const handleChangeOrderStatus = async (orderId: string, newStatus: string) => {
        setLoading(true);
        setMensaje(`Actualizando estado a ${newStatus}... ⏳`);
        try {
            const res = await fetch('/api/admin/orders', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: orderId, status: newStatus })
            });

            if (!res.ok) throw new Error("No se pudo actualizar");

            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            setMensaje('¡Estado del pedido actualizado! ✅');
        } catch (error: any) {
            console.error(error);
            setMensaje(`❌ Error al actualizar estado. ${error.message}`);
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

    // KPIs Dashboard
    const totalRevenue = orders.reduce((acc, order) => acc + (Number(order.total) || 0), 0);
    const avgTicket = orders.length > 0 ? (totalRevenue / orders.length) : 0;
    
    // Gráfico de ventas
    const salesByDate = orders.reduce((acc: any, order) => {
        const dateString = order.date ? order.date.split(',')[0] : 'Desconocida';
        if (!acc[dateString]) acc[dateString] = { date: dateString, amount: 0, orders: 0 };
        acc[dateString].amount += Number(order.total);
        acc[dateString].orders += 1;
        return acc;
    }, {});
    const chartData = Object.values(salesByDate).slice(-7); // ultimos 7 turnos/días de venta

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

            <div className="bg-gray-50/50 min-h-screen pb-32">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
                    
                    {/* Botones de Pestañas */}
                    <div className="mb-8 flex gap-6 border-b border-gray-200 overflow-x-auto no-scrollbar">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`pb-4 px-2 text-[15px] font-bold transition-all whitespace-nowrap relative ${activeTab === 'dashboard' ? 'text-pink-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            📊 Dashboard
                            {activeTab === 'dashboard' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-pink-600 rounded-t-full" />}
                        </button>
                        <button
                            onClick={() => setActiveTab('catalogo')}
                            className={`pb-4 px-2 text-[15px] font-bold transition-all whitespace-nowrap relative ${activeTab === 'catalogo' ? 'text-pink-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            📦 Catálogo
                            {activeTab === 'catalogo' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-pink-600 rounded-t-full" />}
                        </button>
                        <button
                            onClick={() => setActiveTab('ventas')}
                            className={`pb-4 px-2 text-[15px] font-bold transition-all relative ${activeTab === 'ventas' ? 'text-pink-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            🧾 Registro de Ventas
                            {activeTab === 'ventas' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-pink-600 rounded-t-full" />}
                        </button>
                    </div>

                    {activeTab === 'dashboard' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight mb-8">Dashboard</h1>
                            
                            {/* KPI Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                                    <span className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Pedidos Totales</span>
                                    <span className="text-4xl font-black text-gray-900">{orders.length}</span>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                                    <span className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Ingresos (Histórico)</span>
                                    <span className="text-4xl font-black text-emerald-600">${totalRevenue.toLocaleString('es-AR')}</span>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                                    <span className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Ticket Promedio</span>
                                    <span className="text-4xl font-black text-pink-600">${Math.round(avgTicket).toLocaleString('es-AR')}</span>
                                </div>
                            </div>

                            {/* Chart */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-8 h-[400px]">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Evolución de Ventas (Últimos 7 días)</h3>
                                {chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#db2777" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#db2777" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `$${value/1000}k`} dx={-10} />
                                            <Tooltip 
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                formatter={(value: any) => [`$${Number(value).toLocaleString('es-AR')}`, 'Ingresos']}
                                            />
                                            <Area type="monotone" dataKey="amount" stroke="#db2777" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" activeDot={{ r: 6, strokeWidth: 0, fill: '#db2777' }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-400">Aún no hay suficientes datos para el gráfico.</div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'ventas' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Historial de Ventas</h1>
                                    <p className="text-gray-500 mt-1">Supervisá los ingresos y detalles de clientes.</p>
                                </div>
                                <button 
                                    onClick={fetchOrders}
                                    className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 shadow-sm flex items-center gap-2"
                                >
                                    <svg className={`w-4 h-4 ${loadingOrders ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                    Refrescar
                                </button>
                            </div>

                            {loadingOrders ? (
                                <div className="text-center py-20"><svg className="animate-spin h-8 w-8 mx-auto text-pink-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>
                            ) : orders.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                    <p className="text-gray-500 text-lg">Aún no hay ventas registradas.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map((order) => {
                                        let parsedItems = [];
                                        try {
                                            parsedItems = JSON.parse(order.items || '[]');
                                        } catch (e) { }

                                        return (
                                            <div key={order.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:border-gray-300 transition-all">
                                                <div 
                                                    className="p-5 flex flex-col md:flex-row md:items-center justify-between cursor-pointer group"
                                                    onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                                                >
                                                        <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1">
                                                            <div className="flex flex-col shrink-0 min-w-[70px]">
                                                                <span className="text-sm text-gray-500 font-medium">{order.date.split(',')[0]}</span>
                                                                <span className="text-xs text-gray-400">{order.date.split(',')[1]}</span>
                                                            </div>
                                                            <div className="hidden md:block w-px h-10 bg-gray-200 mx-2" />
                                                            <div className="flex flex-col min-w-[150px]">
                                                                <span className="text-gray-900 font-bold">{order.clientName}</span>
                                                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                                                    <svg className="w-4 h-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                                                                    {order.whatsapp}
                                                                </span>
                                                            </div>
                                                            <div className="hidden lg:block w-px h-10 bg-gray-200 mx-2" />
                                                            <div className="flex flex-col shrink-0 min-w-[130px] z-10" onClick={(e) => e.stopPropagation()}>
                                                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Estado</span>
                                                                <select 
                                                                    value={order.status || 'Pendiente'} 
                                                                    onChange={(e) => {
                                                                        handleChangeOrderStatus(order.id, e.target.value);
                                                                    }}
                                                                    className={`text-xs font-bold rounded px-2 py-1 outline-none border cursor-pointer ${
                                                                        order.status === 'Enviado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                                                                        order.status === 'Pagado' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                                                        'bg-amber-50 text-amber-700 border-amber-200'
                                                                    }`}
                                                                >
                                                                    <option value="Pendiente">PENDIENTE</option>
                                                                    <option value="Pagado">PAGADO</option>
                                                                    <option value="Enviado">ENVIADO / ENTREGADO</option>
                                                                </select>
                                                            </div>
                                                        <div className="hidden lg:block w-px h-10 bg-gray-200 mx-2" />
                                                        <div className="flex flex-col lg:flex-row flex-1 justify-between items-start lg:items-center gap-2 lg:gap-4 md:ml-4 mt-2 md:mt-0">
                                                            <div className="flex flex-col">
                                                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Entrega y Pago</span>
                                                                <div className="flex gap-2 items-center mt-0.5">
                                                                    <span className={`px-2 py-0.5 text-[10px] md:text-xs font-bold rounded ${order.deliveryMethod === 'retiro' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{order.deliveryMethod.toUpperCase()}</span>
                                                                    <span className={`px-2 py-0.5 text-[10px] md:text-xs font-bold rounded ${order.paymentMethod === 'transferencia' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{order.paymentMethod.toUpperCase()}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col items-end min-w-[120px]">
                                                                <span className="text-xl font-black text-gray-900">${order.total.toLocaleString('es-AR')}</span>
                                                                <span className="text-xs font-medium text-pink-600 bg-pink-50 px-2 rounded-full py-0.5">{parsedItems.length} ítems</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4 pl-4 border-l border-gray-100 justify-center items-center hidden md:flex shrink-0">
                                                        <button className={`w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 group-hover:bg-pink-50 group-hover:text-pink-600 transition-all ${expandedOrderId === order.id ? 'rotate-180 bg-pink-100 text-pink-700' : ''}`}>
                                                            <svg fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                                                        </button>
                                                    </div>
                                                </div>

                                                {expandedOrderId === order.id && (
                                                    <div className="border-t border-gray-100 bg-gray-50/50 p-5 p-r-8">
                                                        <h3 className="text-sm font-bold text-gray-900 mb-3">Detalle de Productos</h3>
                                                        <div className="space-y-3">
                                                            {parsedItems.map((item: any, idx: number) => (
                                                                <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-200">
                                                                    <div className="w-12 h-16 rounded-md overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                                                                        <img src={item.imagenUrl.split(',')[0]} alt={item.nombre} className="w-full h-full object-cover" />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <h4 className="font-bold text-sm text-gray-900">{item.nombre}</h4>
                                                                        <div className="text-xs text-gray-500 font-medium">Categoría: {item.categoria}</div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <div className="text-sm font-bold text-gray-900">${item.precio.toLocaleString('es-AR')}</div>
                                                                        <div className="text-xs font-bold bg-gray-100 text-gray-600 inline-block px-2 py-0.5 rounded-full mt-1">x{item.cantidad}</div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                                                            <a href={`https://wa.me/${order.whatsapp}?text=Hola+${order.clientName}%2C+te+escribo+de+Vito+Store+haciendo+seguimiento+a+tu+pedido+`} target="_blank" rel="noreferrer" className="text-sm font-medium text-white bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                                                                Escribir al cliente
                                                            </a>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'catalogo' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Cabecera / Título */}
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
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
                                                    <input
                                                        type="text"
                                                        list="categories-list"
                                                        required
                                                        value={categoria}
                                                        onChange={(e) => setCategoria(e.target.value)}
                                                        placeholder="Ej: Conjuntos"
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all placeholder-gray-400"
                                                    />
                                                    <datalist id="categories-list">
                                                        {uniqueCategories.filter(c => c !== 'Todas').map(cat => (
                                                            <option key={cat} value={cat} />
                                                        ))}
                                                    </datalist>
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
                                        
                                        {/* Tarjeta: Precios */}
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="font-black text-gray-900 border-b-2 border-pink-500 pb-1 inline-block">Precios</h3>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Precio normal</label>
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
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Combo 3 Prendas c/u</label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                            <span className="text-gray-400 font-medium">$</span>
                                                        </div>
                                                        <input
                                                            type="number"
                                                            value={price3}
                                                            onChange={(e) => setPrice3(e.target.value)}
                                                            placeholder="Opcional"
                                                            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all placeholder-gray-400"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Combo 6 Prendas c/u</label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                            <span className="text-gray-400 font-medium">$</span>
                                                        </div>
                                                        <input
                                                            type="number"
                                                            value={price6}
                                                            onChange={(e) => setPrice6(e.target.value)}
                                                            placeholder="Opcional"
                                                            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all placeholder-gray-400"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Combo 9 Prendas c/u</label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                            <span className="text-gray-400 font-medium">$</span>
                                                        </div>
                                                        <input
                                                            type="number"
                                                            value={price9}
                                                            onChange={(e) => setPrice9(e.target.value)}
                                                            placeholder="Opcional"
                                                            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all placeholder-gray-400"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Combo 12 Prendas c/u</label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                            <span className="text-gray-400 font-medium">$</span>
                                                        </div>
                                                        <input
                                                            type="number"
                                                            value={price12}
                                                            onChange={(e) => setPrice12(e.target.value)}
                                                            placeholder="Opcional"
                                                            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all placeholder-gray-400"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tarjeta: Multimedia */}
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                                            <label className="block text-sm font-medium text-gray-700 mb-3">Foto/s del producto</label>
                                            <div className="flex flex-col gap-3">
                                                {existingImageUrl && (
                                                    <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
                                                        {existingImageUrl.split(',').filter(Boolean).map((url, idx) => (
                                                            <div key={idx} className="relative rounded-lg overflow-hidden border border-gray-200 aspect-[3/4] w-24 shrink-0">
                                                                <img src={url} alt={`Preview ${idx+1}`} className="w-full h-full object-cover" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                <input
                                                    id="fileInput"
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    required={!existingImageUrl}
                                                    onChange={(e) => setFiles(e.target.files ? Array.from(e.target.files) : [])}
                                                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-600 hover:file:bg-pink-100 file:transition-colors file:cursor-pointer cursor-pointer border border-gray-200 rounded-full py-1.5 focus:outline-none"
                                                />
                                                <p className="text-xs text-gray-500 ml-2">PNG, JPG. Puedes seleccionar múltiples fotos. {existingImageUrl && "Si subes nuevas, reemplazarán a las anteriores."}</p>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                {/* Barra Fija Inferior */}
                                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                                    <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                                        
                                        <div className="text-sm flex-1">
                                            <span className="text-gray-500 font-medium">✨ Modificá y guardá tus productos desde aquí.</span>
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

                            <hr className="border-gray-200 my-12" />

                            {/* ZONA 2: LISTADO DE PRODUCTOS */}
                            <section>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                                    <div className="flex gap-4 items-center flex-wrap">
                                        <h2 className="text-2xl font-black text-gray-900">Tus Productos Publicados</h2>
                                        {selectedIds.size > 0 && (
                                            <button
                                                onClick={handleBulkDelete}
                                                className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 px-4 py-2 rounded-lg font-bold text-sm transition-colors border border-red-200 shadow-sm"
                                            >
                                                🗑️ Eliminar seleccionados ({selectedIds.size})
                                            </button>
                                        )}
                                    </div>
                                    
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
                                                            <th className="p-4 w-12 text-center">
                                                                <input 
                                                                    type="checkbox" 
                                                                    className="w-4 h-4 text-pink-600 rounded border-gray-300 focus:ring-pink-500 cursor-pointer"
                                                                    checked={paginatedProducts.length > 0 && selectedIds.size === paginatedProducts.length}
                                                                    onChange={toggleAllSelection}
                                                                />
                                                            </th>
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
                                                                    <input 
                                                                        type="checkbox" 
                                                                        className="w-4 h-4 text-pink-600 rounded border-gray-300 focus:ring-pink-500 cursor-pointer"
                                                                        checked={selectedIds.has(p.id)}
                                                                        onChange={() => toggleSelection(p.id)}
                                                                    />
                                                                </td>
                                                                <td className="p-4 text-center">
                                                                    <img src={p.image_url.split(',')[0]} alt={p.name} className="w-12 h-16 object-cover rounded-md mx-auto shadow-sm" />
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
                                            <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-100 rounded-xl shadow-sm mt-4">
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
                                                            Mostrando <span className="font-medium">{startIndex + 1}</span> a <span className="font-medium">{Math.min(startIndex + ITEMS_PER_PAGE, filteredProducts.length)}</span> de <span className="font-medium">{filteredProducts.length}</span> resultados
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                                            <button
                                                                onClick={() => setCurrentPage(1)}
                                                                disabled={safeCurrentPage === 1}
                                                                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                <span className="sr-only">Primera</span>
                                                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                                    <path fillRule="evenodd" d="M15.79 14.77a.75.75 0 01-1.06.02l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 111.04 1.08L11.832 10l3.938 3.71a.75.75 0 01.02 1.06zm-6 0a.75.75 0 01-1.06.02l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 111.04 1.08L5.832 10l3.938 3.71a.75.75 0 01.02 1.06z" clipRule="evenodd" />
                                                                </svg>
                                                            </button>
                                                            
                                                            <button
                                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                                disabled={safeCurrentPage === 1}
                                                                className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                <span className="sr-only">Anterior</span>
                                                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                                                </svg>
                                                            </button>

                                                            {Array.from({ length: totalPages }).map((_, i) => {
                                                                if (
                                                                    i + 1 === 1 || 
                                                                    i + 1 === totalPages || 
                                                                    (i + 1 >= safeCurrentPage - 1 && i + 1 <= safeCurrentPage + 1)
                                                                ) {
                                                                    return (
                                                                        <button
                                                                            key={i + 1}
                                                                            onClick={() => setCurrentPage(i + 1)}
                                                                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600 ${
                                                                                safeCurrentPage === i + 1 
                                                                                ? 'z-10 bg-pink-600 text-white focus-visible:outline-pink-600' 
                                                                                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                                                                            }`}
                                                                        >
                                                                            {i + 1}
                                                                        </button>
                                                                    );
                                                                } else if (
                                                                    i + 1 === safeCurrentPage - 2 || 
                                                                    i + 1 === safeCurrentPage + 2
                                                                ) {
                                                                    return <span key={i + 1} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">...</span>;
                                                                }
                                                                return null;
                                                            })}

                                                            <button
                                                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                                disabled={safeCurrentPage === totalPages}
                                                                className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                <span className="sr-only">Siguiente</span>
                                                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                                                </svg>
                                                            </button>

                                                            <button
                                                                onClick={() => setCurrentPage(totalPages)}
                                                                disabled={safeCurrentPage === totalPages}
                                                                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                <span className="sr-only">Última</span>
                                                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                                    <path fillRule="evenodd" d="M10.21 14.77a.75.75 0 01.02-1.06L14.168 10 10.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02zM4.21 14.77a.75.75 0 01.02-1.06L8.168 10 4.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
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
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
