import { NextResponse } from 'next/server';
import { appendOrderToSheet, Order } from '@/lib/googleSheets';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { cart, cliente, paymentMethod, total } = body;

        const newOrder: Order = {
            id: Date.now().toString(),
            date: new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }),
            clientName: cliente.nombre,
            whatsapp: cliente.whatsapp,
            deliveryMethod: cliente.metodoEntrega,
            paymentMethod: paymentMethod,
            total: total,
            items: JSON.stringify(cart)
        };

        await appendOrderToSheet(newOrder);

        return NextResponse.json({ success: true, orderId: newOrder.id });

    } catch (error) {
        console.error("Error al registrar el pedido:", error);
        return NextResponse.json(
            { error: 'No se pudo guardar el pedido' },
            { status: 500 }
        );
    }
}
