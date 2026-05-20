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
        <div className="w-full flex flex-col gap-6 pb-8 mb-8 px-4 max-w-[1400px] mx-auto border-b border-slate-100">
            {/* Buscador Superior */}
            <div className="w-full max-w-xl mx-auto relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400 group-focus-within:text-accent premium-transition" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input 
                    type="text" 
                    placeholder="Buscá conjuntos, bodies, babydolls..." 
                    value={searchTerm}
                    onChange={onSearchChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 text-slate-900 rounded-2xl outline-none shadow-sm transition-all focus:ring-2 focus:ring-accent/20 focus:border-accent block hover:border-slate-300 min-h-[48px] premium-transition"
                />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex flex-wrap gap-3 justify-center sm:justify-start w-full sm:w-auto">
                    {categories.map((cat) => {
                        const isActive = activeCategory === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => handleFilter(cat)}
                                className={`px-6 py-3 rounded-full text-xs md:text-sm font-semibold transition-all duration-300 min-h-[48px] flex items-center justify-center premium-transition ${
                                    isActive 
                                    ? 'bg-accent text-white shadow-md shadow-accent/20 border-2 border-transparent' 
                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900 shadow-sm active:scale-95'
                                }`}
                            >
                                {cat}
                            </button>
                        );
                    })}
                </div>
                
                <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end">
                    <span className="text-sm font-medium text-slate-500">Ordenar por:</span>
                    <select 
                        value={activeSort}
                        onChange={(e) => handleSort(e.target.value)}
                        className="bg-white border border-slate-200 text-slate-700 text-xs md:text-sm font-semibold rounded-2xl focus:ring-2 focus:ring-accent/20 focus:border-accent block px-5 py-3 min-h-[48px] cursor-pointer outline-none shadow-sm transition-all hover:border-slate-300 premium-transition"
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