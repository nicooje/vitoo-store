const fs = require('fs');

// 1. Rollback UNFORMATTED_VALUE
const sheetsPath = 'src/lib/googleSheets.ts';
let sheetsHtml = fs.readFileSync(sheetsPath, 'utf8');

sheetsHtml = sheetsHtml.replace(
    /range:\s*'A2:N',\s*valueRenderOption:\s*'UNFORMATTED_VALUE',/g,
    "range: 'A2:N',"
);

// Mantiene nuestro parsePrice super robusto!
fs.writeFileSync(sheetsPath, sheetsHtml);

// 2. Bump cart version to clear localStorage cache
const cartPath = 'src/store/cartStore.ts';
let cartContent = fs.readFileSync(cartPath, 'utf8');

cartContent = cartContent.replace(
    /name: 'vito-cart-storage-v2'/g,
    "name: 'vito-cart-storage-v3'"
);
// In case v3 is there, bump to v4
cartContent = cartContent.replace(
    /name: 'vito-cart-storage-v3'/g,
    "name: 'vito-cart-storage-v4'"
);

fs.writeFileSync(cartPath, cartContent);
