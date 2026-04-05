'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface Props {
    categories: string[];
}

export default function CategoryFilter({ categories }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeCategory = searchParams.get('category') || 'Todos';

    const handleFilter = (cat: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (cat === 'Todos') {
            params.delete('category');
        } else {
            params.set('category', cat);
        }
        router.replace(`/?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="w-full flex justify-center pb-8 mb-8">
            <div className="flex flex-wrap gap-3 px-4 justify-center max-w-2xl mx-auto">
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
        </div>
    );
}