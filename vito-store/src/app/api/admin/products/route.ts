import { NextResponse } from 'next/server';
import { getProductsFromSheet, appendProductToSheet, updateProductInSheet, deleteProductFromSheet } from '@/lib/googleSheets';

export async function GET() {
    try {
        const products = await getProductsFromSheet();
        return NextResponse.json(products);
    } catch (error) {
        console.error("Error GET /api/admin/products:", error);
        return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // body should be Omit<Product, 'id'>
        const result = await appendProductToSheet(body);
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error POST /api/admin/products:", error);
        return NextResponse.json({ error: 'Error agregando el producto' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, ...productData } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID es requerido para actualizar' }, { status: 400 });
        }

        const result = await updateProductInSheet(Number(id), productData);
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error PUT /api/admin/products:", error);
        return NextResponse.json({ error: 'Error actualizando el producto' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        const { id, name } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID es requerido para eliminar' }, { status: 400 });
        }

        const result = await deleteProductFromSheet(Number(id), name);
        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Error DELETE /api/admin/products:", error);
        return NextResponse.json({ error: error.message || 'Error eliminando el producto' }, { status: 500 });
    }
}
