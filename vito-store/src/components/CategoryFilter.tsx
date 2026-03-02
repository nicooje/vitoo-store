"use client";

import { useRouter, useSearchParams } from 'next/navigation';

interface CategoryFilterProps {
    categories: string[];
}

export default function CategoryFilter({ categories }: CategoryFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeCategory = searchParams.get('category') || 'Todos';

    const handleCategoryClick = (category: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (category === 'Todos') {
            params.delete('category');
        } else {
            params.set('category', category);
        }

        // Actualizamos URL sin recargar la página e impidiendo saltos bruscos
        router.replace(`/?${params.toString()}#catalogo`, { scroll: false });
    };

    return (
        <div className="flex justify-center gap-4 pb-4 px-4 overflow-x-auto whitespace-nowrap scroll-smooth">
            {categories.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                    <button
                        key={cat}
                        onClick={() => handleCategoryClick(cat)}
                        className={`px-6 py-2 rounded-full font-bold transition-all duration-300 border-2 ${isActive
                                ? 'bg-pink-600 border-pink-600 text-white shadow-md'
                                : 'bg-transparent border-pink-600 text-pink-600 hover:bg-pink-50'
                            }`}
                    >
                        {cat}
                    </button>
                );
            })}
        </div>
    );
}
