import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || ''
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { cart, cliente } = body;

        const items = cart.map((producto: any) => ({
            id: String(producto.id),
            title: producto.nombre,
            quantity: Number(producto.cantidad),
            unit_price: Number(producto.precio),
            currency_id: 'ARS',
            picture_url: producto.imagenUrl,
        }));

        const preference = new Preference(client);
        const response = await preference.create({
            body: {
                items: items,
                payer: {
                    name: cliente.nombre,
                    phone: { number: cliente.whatsapp }
                },
                back_urls: {
                    success: "https://vitoo-store.vercel.app/",
                    failure: "https://vitoo-store.vercel.app/checkout",
                    pending: "https://vitoo-store.vercel.app/"
                },
                auto_return: "approved",
            }
        });

        return NextResponse.json({ init_point: response.init_point });

    } catch (error) {
        console.error("Error al crear la preferencia:", error);
        return NextResponse.json(
            { error: 'No se pudo crear el pago' },
            { status: 500 }
        );
    }
}