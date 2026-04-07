'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface Props {
    categories: string[];
}

export default function CategoryFilter({ categories }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeCategory = searchParams.get('category') || 'Todos';
    const activeSort = searchParams.get('sort') || '';

    const handleFilter = (cat: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (cat === 'Todos') {
            params.delete('category');
        } else {
            params.set('category', cat);
        }
        router.replace(`/?${params.toString()}`, { scroll: false });
    };

    const handleSort = (sortVal: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (!sortVal) {
            params.delete('sort');
        } else {
            params.set('sort', sortVal);
        }
        router.replace(`/?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="w-full flex flex-col sm:flex-row items-center justify-between pb-8 mb-8 gap-4 px-4 max-w-[1400px] mx-auto border-b border-gray-100">
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                {categories.map((cat) => {
                    const isActive = activeCategory === cat;
                    return (
                        <button
                            key={cat}
                            onClick={() => handleFilter(cat)}
                            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                                isActive 
                                ? 'bg-pink-50 border-2 border-pink-500 text-pink-700' 
                                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900 shadow-sm'
                            }`}
                        >
                            {cat}
                        </button>
                    );
                })}
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm font-medium text-gray-500">Ordenar por:</span>
                <select 
                    value={activeSort}
                    onChange={(e) => handleSort(e.target.value)}
                    className="bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl focus:ring-pink-500 focus:border-pink-500 block px-4 py-2 cursor-pointer outline-none shadow-sm transition-all hover:border-gray-300"
                >
                    <option value="">Relevancia</option>
                    <option value="asc">Menor a mayor precio</option>
                    <option value="desc">Mayor a menor precio</option>
                </select>
            </div>
        </div>
    );
}