import { create } from 'zustand';

// 1. Definimos cómo es un Producto
export interface Product {
    id: string;
    nombre: string;
    precio: number;
    precioMayorista?: number;
    imagenUrl: string;
    categoria: string;
}

// 2. Definimos cómo es un Producto adentro del carrito (tiene cantidad)
export interface CartItem extends Product {
    cantidad: number;
}

// 3. Definimos todo lo que puede hacer nuestro carrito
interface CartState {
    cart: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    clearCart: () => void;
    getTotal: () => number;
    getTotalItems: () => number;
}

// 4. Creamos el Cerebro mágico con Zustand
export const useCartStore = create<CartState>((set, get) => ({
    cart: [], // El carrito arranca vacío

    // Función para agregar productos
    addToCart: (product) => {
        const currentCart = get().cart;
        const existingItem = currentCart.find((item) => item.id === product.id);

        if (existingItem) {
            // Si ya estaba en el carrito, le sumamos 1 a la cantidad
            set({
                cart: currentCart.map((item) =>
                    item.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item
                ),
            });
        } else {
            // Si es nuevo, lo agregamos con cantidad 1
            set({ cart: [...currentCart, { ...product, cantidad: 1 }] });
        }
    },

    // Función para borrar un producto del carrito
    removeFromCart: (productId) => {
        set({ cart: get().cart.filter((item) => item.id !== productId) });
    },

    // Función para vaciar todo el carrito (cuando ya pagaron)
    clearCart: () => set({ cart: [] }),

    // Función que calcula la plata total con regla mayorista
    getTotal: () => {
        const cart = get().cart;
        const totalItems = get().getTotalItems();

        return cart.reduce((total, item) => {
            const activePrice = (totalItems >= 3 && item.precioMayorista) ? item.precioMayorista : item.precio;
            return total + (activePrice * item.cantidad);
        }, 0);
    },

    // Nueva función para saber el total de prendas llevadas
    getTotalItems: () => {
        return get().cart.reduce((total, item) => total + item.cantidad, 0);
    }
}));