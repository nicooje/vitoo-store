'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';

interface Props {
    categories: string[];
}

export default function CategoryFilter({ categories }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const activeCategory = searchParams.get('category') || 'Todos';
    const activeSort = searchParams.get('sort') || '';
    const activeSearch = searchParams.get('search') || '';
    
    const [searchTerm, setSearchTerm] = useState(activeSearch);

    useEffect(() => {
        setSearchTerm(activeSearch);
    }, [activeSearch]);

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (!term) {
            params.delete('search');
        } else {
            params.set('search', term);
        }
        router.replace(`/?${params.toString()}`, { scroll: false });
    }, 400);

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        handleSearch(e.target.value);
    };

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
        <div className="w-full flex flex-col gap-6 pb-8 mb-8 px-4 max-w-[1400px] mx-auto border-b border-gray-100">
            {/* Buscador Superior */}
            <div className="w-full max-w-xl mx-auto relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400 group-focus-within:text-pink-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input 
                    type="text" 
                    placeholder="Buscá conjuntos, bodies, babydolls..." 
                    value={searchTerm}
                    onChange={onSearchChange}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 text-gray-900 rounded-2xl outline-none shadow-sm transition-all focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 block hover:border-gray-300"
                />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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
        </div>
    );
}