const fs = require('fs');
let content = fs.readFileSync('src/components/CatalogoSection.tsx', 'utf8');

const oldOpenOptions = `    const openOptionsModal = (product: Product) => {
        const requiresSize = Boolean(product.size && product.size.trim() !== '');
        const parseVariants = (str?: string) => str ? str.split(/[,/|-]+/).map(s => s.trim()).filter(Boolean) : [];
        const sheetColors = parseVariants(product.color);
        const colorsList = sheetColors.length > 0 ? sheetColors : ['Blanco', 'Negro', 'Gris', 'Rosa', 'Fucsia', 'Rojo', 'Bordó', 'Azul', 'Celeste', 'Verde', 'Amarillo', 'Beige', 'Marrón', 'Lila', 'Surtido', 'Único'];
        const hasColors = true;

        if (requiresSize || hasColors) {
            setActiveProduct(product);
            setSelectedSize('');
            setSelectedColor(hasColors ? '' : (product.color || ''));
        } else {
            handleAddToCart(product, product.size, product.color);
        }
    };`;

const newOpenOptions = `    const openOptionsModal = (product: Product) => {
        const requiresSize = Boolean(product.size && product.size.trim() !== '');
        const parseVariants = (str?: string) => str ? str.split(/[,/|-]+/).map(s => s.trim()).filter(Boolean) : [];
        const isBombacha = product.name.toLowerCase().includes('bombi') || product.category.toLowerCase().includes('bombi');
        const hasColors = !isBombacha;

        if (requiresSize || hasColors) {
            setActiveProduct(product);
            setSelectedSize('');
            setSelectedColor(hasColors ? '' : 'Surtido');
        } else {
            handleAddToCart(product, product.size, 'Surtido');
        }
    };`;

content = content.replace(oldOpenOptions, newOpenOptions);

const oldModalRenderer = `                    {(() => {
                        const requiresSize = Boolean(activeProduct.size && activeProduct.size.trim() !== '');
                        const parseVariants = (str?: string) => str ? str.split(/[,/|-]+/).map(s => s.trim()).filter(Boolean) : [];
                        const sheetColors = parseVariants(activeProduct.color);
                        const activeColorsList = sheetColors.length > 0 ? sheetColors : ['Blanco', 'Negro', 'Gris', 'Rosa', 'Fucsia', 'Rojo', 'Bordó', 'Azul', 'Celeste', 'Verde', 'Amarillo', 'Beige', 'Marrón', 'Lila', 'Surtido', 'Único'];
                        
                        return (
                            <div className="flex flex-col gap-5">`;

const newModalRenderer = `                    {(() => {
                        const requiresSize = Boolean(activeProduct.size && activeProduct.size.trim() !== '');
                        const parseVariants = (str?: string) => str ? str.split(/[,/|-]+/).map(s => s.trim()).filter(Boolean) : [];
                        const isBombacha = activeProduct.name.toLowerCase().includes('bombi') || activeProduct.category.toLowerCase().includes('bombi');
                        const sheetColors = parseVariants(activeProduct.color);
                        const activeColorsList = isBombacha ? [] : (sheetColors.length > 0 ? sheetColors : ['Blanco', 'Negro', 'Gris', 'Rosa', 'Fucsia', 'Rojo', 'Bordó', 'Azul', 'Celeste', 'Verde', 'Amarillo', 'Beige', 'Marrón', 'Lila', 'Surtido', 'Único']);
                        
                        return (
                            <div className="flex flex-col gap-5">
                                {isBombacha && (
                                    <div className="bg-pink-50 p-3 rounded-xl text-sm text-pink-700 font-medium border border-pink-100">
                                        ✨ Los colores son surtidos según stock disponible.
                                    </div>
                                )}`;

content = content.replace(oldModalRenderer, newModalRenderer);

fs.writeFileSync('src/components/CatalogoSection.tsx', content);
