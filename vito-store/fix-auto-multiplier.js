const fs = require('fs');

const sheetsPath = 'src/lib/googleSheets.ts';
let sheetsHtml = fs.readFileSync(sheetsPath, 'utf8');

const parseFunction = `        const parsePrice = (value: any) => {
            if (value === null || value === undefined || value === '') return 0;
            
            let val = 0;
            if (typeof value === 'number') {
                val = value;
            } else {
                // Convert to string and clean spaces/currency
                let str = String(value).trim().replace(/[^0-9.,-]/g, '');
                
                const hasComma = str.includes(',');
                const hasDot = str.includes('.');
                
                if (hasComma && !hasDot) {
                    const parts = str.split(',');
                    if (parts.length === 2 && parts[1].length <= 2) {
                        str = str.replace(',', '.'); 
                    } else {
                        str = str.replace(/,/g, ''); 
                    }
                } else if (hasComma && hasDot) {
                    if (str.lastIndexOf(',') > str.lastIndexOf('.')) {
                        str = str.replace(/\\./g, '').replace(',', '.');
                    } else {
                        str = str.replace(/,/g, '');
                    }
                } else if (hasDot && !hasComma) {
                    const parts = str.split('.');
                    if (parts.length === 2 && parts[1].length !== 2 && parts[1].length === 3) {
                        str = str.replace(/\\./g, '');
                    }
                }
                
                val = Number(str) || 0;
            }

            // AUTO-CORRECCIÓN PARA ARGENTINA:
            // Si el valor numérico extraído es menor a 500, asumimos que se abreviaron los miles (ej: 25,5 = 25500)
            // o que Google Sheets convirtió 25.500 a 25.5 por locale.
            if (val > 0 && val <= 500) {
                val = val * 1000;
            }
            
            return val;
        };`;

sheetsHtml = sheetsHtml.replace(/const parsePrice = [\s\S]*?(?=\n\s*const products)/m, parseFunction + '\n\n');

fs.writeFileSync(sheetsPath, sheetsHtml);

// También hay que borrar la caché del cart de nuevo porque el usuario debe tener el 25.5 clavado ahí tmb.
const cartPath = 'src/store/cartStore.ts';
let cartContent = fs.readFileSync(cartPath, 'utf8');
cartContent = cartContent.replace(/name: 'vito-cart-storage-v4'/g, "name: 'vito-cart-storage-v5'");
fs.writeFileSync(cartPath, cartContent);
