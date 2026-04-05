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
        // Se asume que los datos están en la primera pestaña y en el rango A2:F
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'A2:I',
        });

        const rows = response.data.values;

        if (!rows || rows.length === 0) {
            console.warn('⚠️ La hoja de cálculo está vacía o no tiene datos válidos. Usando mock JSON local.');
            return localProducts;
        }

        type StringRow = string[];
        
        // Filtramos las filas que están completamente vacías (pueden quedar al borrar)
        const validRows = rows.filter((row: StringRow) => row.length > 0 && row.some(cell => cell.trim() !== ''));

        const products: Product[] = validRows.map((row: StringRow, index: number) => {
            const stockValue = row[5]?.toString().toLowerCase().trim();
            const hasStock = stockValue === 'true' || stockValue === 'v' || stockValue === 'si' || stockValue === '1';

            return {
                id: parseInt(row[0]) || index + 1, // Si no hay ID, asigna index + 1
                name: row[1] || 'Producto sin nombre',
                category: row[2] || 'General',
                price: parseFloat(row[3]) || 0,
                image_url: row[4] || '',
                stock: hasStock,
                size: row[6] || '',
                color: row[7] || '',
                quantity: row[8] ? parseInt(row[8]) : (hasStock ? 1 : 0),
            };
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
    
    await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: 'A2:I',
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
                    product.quantity || 0
                ]
            ],
        },
    });

    return { success: true, id: newId };
}

export async function updateProductInSheet(id: number, product: Omit<Product, 'id'>) {
    const { sheets, sheetId } = await getGoogleSheetsClient();
    
    // Primero, traemos los datos actuales para ubicar la fila del ID buscado
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'A2:A', // Solo traemos la columna de IDs para buscar rápido
    });

    const rows = response.data.values;
    if (!rows) throw new Error("La hoja está vacía.");

    // Encontrar el índice (sumar 2 porque arranca en A2)
    const rowIndex = rows.findIndex(row => parseInt(row[0]) === id);
    if (rowIndex === -1) throw new Error("Producto no encontrado en el Excel");

    const rowNumber = rowIndex + 2; // +2 porque el rango empieza en A2 (índice 0 es fila 2)
    
    await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `A${rowNumber}:I${rowNumber}`,
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
                    product.quantity || 0
                ]
            ],
        },
    });

    return { success: true };
}

export async function deleteProductFromSheet(id: number) {
    const { sheets, sheetId } = await getGoogleSheetsClient();
    
    // Primero, traemos los datos actuales para ubicar la fila del ID buscado
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'A2:A', // Solo traemos la columna de IDs para buscar rápido
    });

    const rows = response.data.values;
    if (!rows) throw new Error("La hoja está vacía.");

    // Encontrar el índice (sumar 2 porque arranca en A2)
    const rowIndex = rows.findIndex(row => parseInt(row[0]) === id);
    if (rowIndex === -1) throw new Error("Producto no encontrado en el Excel para eliminar");

    const rowNumber = rowIndex + 2; 
    
    await sheets.spreadsheets.values.clear({
        spreadsheetId: sheetId,
        range: `A${rowNumber}:I${rowNumber}`,
    });

    return { success: true };
}
