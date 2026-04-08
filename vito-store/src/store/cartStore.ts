import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 1. Definimos cómo es un Producto
export interface Product {
    id: string;
    nombre: string;
    precio: number;
    price3?: number;
    price6?: number;
    price9?: number;
    price12?: number;
    imagenUrl: string;
    categoria: string;
}

// 2. Definimos cómo es un Producto adentro del carrito (tiene cantidad)
export interface CartItem extends Product {
    cantidad: number;
    selectedSize?: string;
    selectedColor?: string;
}

// 3. Definimos todo lo que puede hacer nuestro carrito
interface CartState {
    cart: CartItem[];
    addToCart: (product: Product, selectedSize?: string, selectedColor?: string) => void;
    removeFromCart: (productId: string) => void;
    clearCart: () => void;
    getTotal: () => number;
    getTotalItems: () => number;
}

// 4. Creamos el Cerebro mágico con Zustand usando Persist para Guardar Sesión
export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            cart: [], // El carrito arranca vacío

            // Función para agregar productos
            addToCart: (product, selectedSize, selectedColor) => {
                const currentCart = get().cart;
                
                // Generamos un ID único compuesto para separar variaciones de M y L
                let uniqueCartId = product.id;
                if (selectedSize) uniqueCartId += `-${selectedSize}`;
                if (selectedColor) uniqueCartId += `-${selectedColor}`;

                const existingItem = currentCart.find((item) => item.id === uniqueCartId);

                if (existingItem) {
                    // Si ya estaba en el carrito ESA VARIANTE, le sumamos 1 a la cantidad
                    set({
                        cart: currentCart.map((item) =>
                            item.id === uniqueCartId ? { ...item, cantidad: item.cantidad + 1 } : item
                        ),
                    });
                } else {
                    // Si es nuevo, lo agregamos con el nuevo ID compuesto
                    set({ 
                        cart: [...currentCart, { 
                            ...product, 
                            id: uniqueCartId, // Piso el ID para tener un ID único para la variante
                            cantidad: 1,
                            selectedSize,
                            selectedColor
                        }] 
                    });
                }
            },

            // Función para borrar un producto del carrito
            removeFromCart: (productId) => {
                set({ cart: get().cart.filter((item) => item.id !== productId) });
            },

            // Función para vaciar todo el carrito (cuando ya pagaron)
            clearCart: () => set({ cart: [] }),

            // Función que calcula la plata total con regla mayorista por combos
            getTotal: () => {
                const cart = get().cart;
                const totalItems = get().getTotalItems();

                return cart.reduce((total, item) => {
                    let activePrice = item.precio;
                    
                    if (totalItems >= 12 && item.price12 && item.price12 > 0) activePrice = item.price12;
                    else if (totalItems >= 9 && item.price9 && item.price9 > 0) activePrice = item.price9;
                    else if (totalItems >= 6 && item.price6 && item.price6 > 0) activePrice = item.price6;
                    else if (totalItems >= 3 && item.price3 && item.price3 > 0) activePrice = item.price3;

                    return total + (activePrice * item.cantidad);
                }, 0);
            },

            // Nueva función para saber el total de prendas llevadas
            getTotalItems: () => {
                return get().cart.reduce((total, item) => total + item.cantidad, 0);
            }
        }),
        {
            name: 'vito-cart-storage', // Nombre de clave en el LocalStorage
        }
    )
);