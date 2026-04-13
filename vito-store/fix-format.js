const fs = require('fs');
const filePath = 'src/lib/googleSheets.ts';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Añadir UNFORMATTED_VALUE a las peticiones GET
// Primero la función principal getProductsFromSheet
content = content.replace(
    /range:\s*'A2:N',/g,
    "range: 'A2:N',\n            valueRenderOption: 'UNFORMATTED_VALUE',"
);

// 2. Simplificar parsePrice para ser robusto con cualquier formato y no romper enteros
const parseFunction = `        const parsePrice = (value: any) => {
            if (value === null || value === undefined || value === '') return 0;
            if (typeof value === 'number') return value;
            
            // Convert to string and clean spaces/currency
            let str = String(value).trim().replace(/[^0-9.,-]/g, '');
            
            // Let's count commas and dots
            const hasComma = str.includes(',');
            const hasDot = str.includes('.');
            
            // If it has ONLY ONE comma and TWO digits after it, assume it is decimal (ES-AR)
            if (hasComma && !hasDot) {
                const parts = str.split(',');
                if (parts.length === 2 && parts[1].length <= 2) {
                    str = str.replace(',', '.'); // replace decimal comma to dot
                } else {
                     str = str.replace(/,/g, ''); // must be thousands
                }
            } else if (hasComma && hasDot) {
                // Determine which is decimal
                if (str.lastIndexOf(',') > str.lastIndexOf('.')) {
                    // comma is decimal
                    str = str.replace(/\\./g, '').replace(',', '.');
                } else {
                    // dot is decimal
                    str = str.replace(/,/g, '');
                }
            } else if (hasDot && !hasComma) {
                 // ONLY ONE dot
                 const parts = str.split('.');
                 if (parts.length === 2 && parts[1].length !== 2 && parts[1].length === 3) {
                     // likely thousand
                     str = str.replace(/\\./g, '');
                 }
                 // if 2 digits, keep the dot (decimal)
            }
            
            return Number(str) || 0;
        };`;

content = content.replace(/const parsePrice = [\s\S]*?(?=\n\s*const products)/m, parseFunction + '\n\n');

fs.writeFileSync(filePath, content);
