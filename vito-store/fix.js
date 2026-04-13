const fs = require('fs');
let content = fs.readFileSync('src/lib/googleSheets.ts', 'utf8');

const parseFunction = `
        const parsePrice = (value) => {
            if (!value) return 0;
            if (typeof value === 'number') return value;
            const str = value.toString().replace(/\\./g, '').replace(/,/g, '.').replace(/[^0-9.-]/g, '');
            return parseFloat(str) || 0;
        };

        const products: Product[] = [];
`;

content = content.replace('const products: Product[] = [];', parseFunction);
content = content.replace('price: parseFloat(row[3]) || 0,', 'price: parsePrice(row[3]),');
content = content.replace('parseFloat(row[9])', 'parsePrice(row[9])');
content = content.replace('parseFloat(row[10])', 'parsePrice(row[10])');
content = content.replace('parseFloat(row[11])', 'parsePrice(row[11])');
content = content.replace('parseFloat(row[12])', 'parsePrice(row[12])');

fs.writeFileSync('src/lib/googleSheets.ts', content);
