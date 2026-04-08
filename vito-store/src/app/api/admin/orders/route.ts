import { NextResponse } from 'next/server';
import { getOrdersFromSheet, updateOrderStatusInSheet } from '@/lib/googleSheets';

export async function GET() {
    try {
        const orders = await getOrdersFromSheet();
        
        return NextResponse.json(orders.reverse());
    } catch (error) {
        console.error("Error al obtener pedidos:", error);
        return NextResponse.json(
            { error: 'No se pudo obtener el historial de pedidos' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json({ error: 'Faltan campos id y status' }, { status: 400 });
        }

        await updateOrderStatusInSheet(id, status);
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error al actualizar estado del pedido:", error);
        return NextResponse.json(
            { error: 'No se pudo actualizar el estado del pedido' },
            { status: 500 }
        );
    }
}
