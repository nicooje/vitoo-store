import { google } from 'googleapis';
import localProducts from '@/data/products.json';

export type Product = {
    id: number;
    name: string;
    category: string;
    price: number;
    image_url: string;
    stock: boolean;
};

// Configuración de credenciales esperada desde variables de entorno
// Google Sheets configurado por el usuario (o simulado)
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

export async function getProductsFromSheet(): Promise<Product[]> {
    try {
        const sheetId = process.env.SHEET_ID;
        const clientEmail = process.env.CLIENT_EMAIL;
        // Replace literal '\n' with actual newlines in case it's escaped in the env
        const privateKey = process.env.PRIVATE_KEY?.replace(/\\n/g, '\n');

        // Si faltan variables clave, caemos al JSON local como fallback seguro
        if (!sheetId || !clientEmail || !privateKey) {
            console.warn('⚠️ Credenciales de Google Sheets no encontradas o incompletas. Usando mock JSON local.');
            return localProducts;
        }

        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: clientEmail,
                private_key: privateKey,
            },
            scopes: SCOPES,
        });

        const sheets = google.sheets({ version: 'v4', auth });

        // Se asume que los datos están en la primera pestaña ('Hoja 1' u 'Sheet1')
        // y en el rango A2:F (dejando la fila 1 para los encabezados)
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'A2:F',
        });

        const rows = response.data.values;

        if (!rows || rows.length === 0) {
            console.warn('⚠️ La hoja de cálculo está vacía o no tiene datos válidos. Usando mock JSON local.');
            return localProducts;
        }

        type StringRow = string[];

        // Mapeamos las filas del Excel al formato Product JSON
        const products: Product[] = rows.map((row: StringRow, index: number) => {
            // row[0]: ID
            // row[1]: Nombre
            // row[2]: Categoría (Lencería, Trajes de Baño, Pijamas)
            // row[3]: Precio
            // row[4]: URL de Imagen
            // row[5]: Stock (V/F o TRUE/FALSE o SI/NO)

            const stockValue = row[5]?.toString().toLowerCase().trim();
            const hasStock = stockValue === 'true' || stockValue === 'v' || stockValue === 'si' || stockValue === '1';

            return {
                id: parseInt(row[0]) || index + 1,
                name: row[1] || 'Producto sin nombre',
                category: row[2] || 'General',
                price: parseFloat(row[3]) || 0,
                image_url: row[4] || '',
                stock: hasStock,
            };
        });

        return products;
    } catch (error) {
        console.error('❌ Error al obtener datos de Google Sheets. Usando json fallback:', error);
        return localProducts;
    }
}
