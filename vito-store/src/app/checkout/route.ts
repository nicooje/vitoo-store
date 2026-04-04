import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// 1. Despertamos a Mercado Pago usando tu llave secreta
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || ''
});

export async function POST(request: Request) {
    try {
        // 2. Recibimos los datos del carrito desde tu página web
        const body = await request.json();
        const { cart, cliente } = body;

        // 3. Traducimos tu carrito al idioma que entiende Mercado Pago
        const items = cart.map((producto: any) => ({
            id: String(producto.id),
            title: producto.nombre,
            quantity: Number(producto.cantidad),
            unit_price: Number(producto.precio),
            currency_id: 'ARS',
            picture_url: producto.imagenUrl,
        }));

        // 4. Creamos la "Preferencia de Pago"
        const preference = new Preference(client);
        const response = await preference.create({
            body: {
                items: items,
                payer: {
                    name: cliente.nombre,
                    phone: { number: cliente.whatsapp }
                },
                back_urls: {
                    success: "https://vitoo-store.vercel.app/", // A donde vuelve si el pago sale bien
                    failure: "https://vitoo-store.vercel.app/checkout", // Si falla, vuelve al carrito
                    pending: "https://vitoo-store.vercel.app/"
                },
                auto_return: "approved",
            }
        });

        // 5. Le devolvemos a tu página el Link de Pago seguro (init_point)
        return NextResponse.json({ init_point: response.init_point });

    } catch (error) {
        console.error("Error al crear la preferencia:", error);
        return NextResponse.json(
            { error: 'No se pudo crear el pago' },
            { status: 500 }
        );
    }
}