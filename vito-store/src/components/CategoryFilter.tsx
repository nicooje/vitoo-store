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
        <div className="w-full overflow-x-auto pb-4 mb-10 no-scrollbar">
            <div className="flex gap-8 px-4 justify-center min-w-max mx-auto">
                {categories.map((cat) => {
                    const isActive = activeCategory === cat;
                    return (
                        <button
                            key={cat}
                            onClick={() => handleFilter(cat)}
                            className={`group relative pb-2 text-sm md:text-base transition-colors ${
                                isActive ? 'text-pink-600 font-extrabold' : 'text-slate-500 font-semibold hover:text-slate-900'
                            }`}
                        >
                            {cat}
                            <span 
                                className={`absolute left-0 bottom-0 w-full h-[2.5px] bg-pink-600 rounded-full transition-transform origin-left ${
                                    isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                                }`} 
                            />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}