const fs = require('fs');

const sheetsPath = 'src/lib/googleSheets.ts';
let content = fs.readFileSync(sheetsPath, 'utf8');

// Buscamos dónde se procesa cada producto:
//    let p3 = parsePrice(row[9]);
//    let p6 = parsePrice(row[10]); ...

const oldProductMapping = `            let p3 = parsePrice(row[9]);
            let p6 = parsePrice(row[10]);
            let p9 = parsePrice(row[11]);
            let p12 = parsePrice(row[12]);`;

const newProductMapping = `            const basePrice = parsePrice(row[3]);
            let p3 = parsePrice(row[9]);
            let p6 = parsePrice(row[10]);
            let p9 = parsePrice(row[11]);
            let p12 = parsePrice(row[12]);
            
            // AUTO-DETECCIÓN DE PRECIO TOTAL VS PRECIO UNITARIO
            // Si el precio del combo es mayor al precio base de 1 prenda,
            // significa que el usuario ingresó el TOTAL del combo y no el unitario.
            // Entonces lo dividimos por la cantidad de prendas del combo para obtener el unitario real.
            if (p3 > basePrice) p3 = p3 / 3;
            if (p6 > basePrice) p6 = p6 / 6;
            if (p9 > basePrice) p9 = p9 / 9;
            if (p12 > basePrice) p12 = p12 / 12;`;

content = content.replace(oldProductMapping, newProductMapping);

fs.writeFileSync(sheetsPath, content);

// Bump cart version again
const cartPath = 'src/store/cartStore.ts';
let cartContent = fs.readFileSync(cartPath, 'utf8');
cartContent = cartContent.replace(/name: 'vito-cart-storage-v5'/g, "name: 'vito-cart-storage-v6'");
fs.writeFileSync(cartPath, cartContent);
