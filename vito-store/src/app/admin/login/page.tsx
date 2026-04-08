'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export default function AdminLogin() {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!password) {
            toast.error('Por favor ingresá la contraseña');
            return;
        }

        setLoading(true);
        const logPromise = fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });

        toast.promise(logPromise, {
            loading: 'Verificando credenciales...',
            success: '¡Acceso concedido! Entrando...',
            error: 'Contraseña incorrecta',
        });

        const res = await logPromise;

        if (res.ok) {
            setTimeout(() => {
                window.location.href = '/admin';
            }, 1000);
        } else {
            setLoading(false);
            setPassword('');
        }
    };

    return (
        <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-pink-100 p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Vito Store</h1>
                        <p className="text-sm text-pink-600 mt-2 font-medium">Panel de Administración</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contraseña Maestra
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all placeholder:text-gray-400 font-medium"
                                placeholder={"••••••••"}
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-pink-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-pink-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 shadow-md shadow-pink-200"
                        >
                            Ingresar al Panel
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
