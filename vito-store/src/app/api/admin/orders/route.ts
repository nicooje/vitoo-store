import { NextResponse } from 'next/server';
import { getOrdersFromSheet } from '@/lib/googleSheets';

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
