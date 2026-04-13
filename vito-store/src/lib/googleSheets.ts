import { google } from 'googleapis';
import localProducts from '@/data/products.json';

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
    items: string; // JSON guardado en string
    status?: string; // Pendiente, Pagado, Enviado
};

// Configuración de credenciales esperada desde variables de entorno
// Google Sheets configurado por el usuario (o simulado)
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Helper internally to auth
async function getGoogleSheetsClient() {
    const sheetId = process.env.SHEET_ID;
    const clientEmail = process.env.CLIENT_EMAIL;
    const privateKey = process.env.PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!sheetId || !clientEmail || !privateKey) {
        throw new Error('Credenciales incompletas');
    }

    const auth = new google.auth.GoogleAuth({
        credentials: { client_email: clientEmail, private_key: privateKey },
        scopes: SCOPES,
    });

    const sheets = google.sheets({ version: 'v4', auth });
    return { sheets, sheetId };
}

export async function getProductsFromSheet(): Promise<Product[]> {
    try {
        const { sheets, sheetId } = await getGoogleSheetsClient();
        // Se asume que los datos están en la primera pestaña y en el rango A2:N
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'A2:N',
        });

        const rows = response.data.values;

        if (!rows || rows.length === 0) {
            console.warn('⚠️ La hoja de cálculo está vacía o no tiene datos válidos. Usando mock JSON local.');
            return localProducts;
        }

        type StringRow = string[];
        
        
        const parsePrice = (value: any) => {
            if (!value) return 0;
            if (typeof value === 'number') return value;
            const str = value.toString().replace(/\./g, '').replace(/,/g, '.').replace(/[^0-9.-]/g, '');
            return parseFloat(str) || 0;
        };

        const products: Product[] = [];

        
        rows.forEach((row: string[], index: number) => {
            // Filtramos internamente las filas vacías pero mantenemos el índice real
            if (!row || row.length === 0 || !row.some(cell => cell.trim() !== '')) {
                return;
            }

            const physicalRowNumber = index + 2;
            const stockValue = row[5]?.toString().toLowerCase().trim();
            const hasStock = stockValue === 'true' || stockValue === 'v' || stockValue === 'si' || stockValue === '1';

            products.push({
                id: parseInt(row[0]) || physicalRowNumber, // El ID fallback es igual al nro de fila exacto
                name: row[1] || 'Producto sin nombre',
                category: row[2] || 'General',
                price: parsePrice(row[3]),
                image_url: row[4] || '',
                stock: hasStock,
                size: row[6] || '',
                color: row[7] || '',
                quantity: row[8] ? parseInt(row[8]) : (hasStock ? 1 : 0),
                price3: row[9] ? parsePrice(row[9]) : undefined,
                price6: row[10] ? parsePrice(row[10]) : undefined,
                price9: row[11] ? parsePrice(row[11]) : undefined,
                price12: row[12] ? parsePrice(row[12]) : undefined,
            });
        });

        return products;
    } catch (error) {
        console.error('❌ Error al obtener datos de Google Sheets. Usando json fallback:', error);
        return localProducts;
    }
}

export async function appendProductToSheet(product: Omit<Product, 'id'>) {
    const { sheets, sheetId } = await getGoogleSheetsClient();
    
    // Generar un ID simple basado en timestamp si la hoja no lo auto-genera
    const newId = Date.now();
    // Para evitar bugs de columnas desconfiguradas, buscamos el fondo de la tabla en lugar de usar append()
    const fullRes = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: 'A:N' });
    const rows = fullRes.data.values || [];
    const maxRow = Math.max(rows.length + 1, 2); // Empezar siempre a partir de la fila 2 mínimo
    
    await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `A${maxRow}:N${maxRow}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [
                [
                    newId, 
                    product.name, 
                    product.category, 
                    product.price, 
                    product.image_url, 
                    product.stock ? 'SI' : 'NO',
                    product.size || '',
                    product.color || '',
                    product.quantity || 0,
                    product.price3 || '',
                    product.price6 || '',
                    product.price9 || '',
                    product.price12 || ''
                ]
            ],
        },
    });

    return { success: true, id: newId };
}

export async function updateProductInSheet(id: number, product: Omit<Product, 'id'>) {
    const { sheets, sheetId } = await getGoogleSheetsClient();
    
    // Usamos el mismo rango completo A2:N para que no dé error si las primeras columnas están vacías
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'A2:N',
    });

    const rows = response.data.values;
    if (!rows) throw new Error("La hoja está vacía.");

    // 1. Buscar coincidencia exacta por ID impreso
    let rowIndex = rows.findIndex(row => parseInt(row[0]) === id);
    
    // 2. Fallback: búsqueda por nombre (si no se editó el nombre)
    if (rowIndex === -1 && product.name) {
        rowIndex = rows.findIndex(row => row[1]?.toString().trim() === product.name.trim());
    }

    // 3. Fallback Infalible: si el id fue autogenerado como physicalRowNumber
    if (rowIndex === -1) {
        const potentialIndex = id - 2;
        if (potentialIndex >= 0 && potentialIndex < rows.length) {
            rowIndex = potentialIndex;
        }
    }
    
    if (rowIndex === -1) throw new Error(`Producto no encontrado en el Excel (ID: ${id})`);

    const rowNumber = rowIndex + 2; // +2 porque el rango empieza en A2 (índice 0 es fila 2)
    
    await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `A${rowNumber}:N${rowNumber}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [
                [
                    id, // Mantiene el mismo ID
                    product.name, 
                    product.category, 
                    product.price, 
                    product.image_url, 
                    product.stock ? 'SI' : 'NO',
                    product.size || '',
                    product.color || '',
                    product.quantity || 0,
                    product.price3 || '',
                    product.price6 || '',
                    product.price9 || '',
                    product.price12 || ''
                ]
            ],
        },
    });

    return { success: true };
}

export async function deleteProductFromSheet(id: number, name?: string) {
    const { sheets, sheetId } = await getGoogleSheetsClient();
    
    // Usamos el mismo rango completo A2:N para que no dé error si las primeras columnas están vacías
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'A2:N',
    });

    const rows = response.data.values;
    if (!rows) throw new Error("La hoja está vacía.");

    // 1. Coincidencia por ID literal
    let rowIndex = rows.findIndex(row => parseInt(row[0]) === id);
    
    // 2. Coincidencia por nombre (si es que vino desde el frontend)
    if (rowIndex === -1 && name) {
        rowIndex = rows.findIndex(row => row[1]?.toString().trim() === name.trim());
    }

    // 3. Fallback Infalible: usar el ID como physicalRowNumber si fue autogenerado
    if (rowIndex === -1) {
        const potentialIndex = id - 2;
        if (potentialIndex >= 0 && potentialIndex < rows.length) {
            rowIndex = potentialIndex;
        }
    }
    
    if (rowIndex === -1) throw new Error(`Producto no encontrado en el Excel para eliminar (ID: ${id})`);

    const rowNumber = rowIndex + 2; 
    
    // Usar 'update' con strings en blanco funciona de manera mucho más confiable que 'clear' en algunas versiones de googleapis
    await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `A${rowNumber}:N${rowNumber}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [
                ['', '', '', '', '', '', '', '', '', '', '', '', '', '']
            ]
        }
    });

    return { success: true };
}

// --- LOGICA DE PEDIDOS (PESTAÑA 'Pedidos') ---

export async function getOrdersFromSheet(): Promise<Order[]> {
    try {
        const { sheets, sheetId } = await getGoogleSheetsClient();
        
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'Pedidos!A2:I',
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) return [];

        return rows.map((row) => ({
            id: row[0] || '',
            date: row[1] || '',
            clientName: row[2] || '',
            whatsapp: row[3] || '',
            deliveryMethod: row[4] || '',
            paymentMethod: row[5] || '',
            total: parseFloat(row[6]) || 0,
            items: row[7] || '[]',
            status: row[8] || 'Pendiente'
        })).filter(o => o.id); // filtar vacías
    } catch (error) {
        console.error('Error al obtener ventas de Google Sheets:', error);
        return [];
    }
}

export async function appendOrderToSheet(order: Order) {
    try {
        const { sheets, sheetId } = await getGoogleSheetsClient();

        // Calcular fila usando append (está bien para Pedidos porque es histórica y solo crece)
        await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: 'Pedidos!A:I',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [
                    [
                        order.id,
                        order.date,
                        order.clientName,
                        order.whatsapp,
                        order.deliveryMethod,
                        order.paymentMethod,
                        order.total.toString(),
                        order.items,
                        order.status || 'Pendiente'
                    ]
                ]
            }
        });

        return true;
    } catch (error) {
        console.error('Error guardando la venta en Google Sheets:', error);
        throw error;
    }
}

export async function updateOrderStatusInSheet(orderId: string, newStatus: string) {
    try {
        const { sheets, sheetId } = await getGoogleSheetsClient();
        
        // Buscamos la fila del pedido
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'Pedidos!A2:A',
        });

        const rows = response.data.values;
        if (!rows) throw new Error('No hay pedidos');

        const rowIndex = rows.findIndex(row => row[0] === orderId);
        if (rowIndex === -1) throw new Error('Pedido no encontrado');

        const actualRowNumber = rowIndex + 2;

        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: `Pedidos!I${actualRowNumber}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[newStatus]]
            }
        });

        return true;
    } catch (error) {
        console.error('Error actualizando estado del pedido:', error);
        throw error;
    }
}
