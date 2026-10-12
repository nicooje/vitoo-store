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

    const labelOf = (cat: string) => cat === 'Todos' ? 'Todo' : cat.replace('-', ' y ');

    return (
        <div className="sticky top-[64px] md:top-[113px] z-30 bg-bg-light/95 backdrop-blur-md -mx-4 md:-mx-8 px-4 md:px-8 mb-8 md:mb-10 border-y border-line">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-8 py-3">
                {/* Categorías como pestañas */}
                <div className="flex gap-6 md:gap-8 overflow-x-auto no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0 lg:flex-1" role="tablist" aria-label="Filtrar por categoría">
                    {categories.map((cat) => {
                        const isActive = activeCategory === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => handleFilter(cat)}
                                role="tab"
                                aria-selected={isActive}
                                className={`relative shrink-0 eyebrow text-[11px] min-h-[44px] transition-colors ${isActive ? 'text-primary-dark' : 'text-muted hover:text-primary-dark'}`}
                            >
                                {labelOf(cat)}
                                <span className={`absolute left-0 right-0 bottom-1.5 h-[1.5px] bg-primary-dark transition-transform duration-200 origin-left ${isActive ? 'scale-x-100' : 'scale-x-0'}`} />
                            </button>
                        );
                    })}
                </div>

                <div className="flex items-center gap-4 lg:w-auto">
                    <label className="flex flex-1 lg:w-60 items-center gap-2 border-b border-ink/25 focus-within:border-primary transition-colors">
                        <svg className="w-4 h-4 text-muted shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" strokeLinecap="round" /></svg>
                        <input
                            type="search"
                            placeholder="Buscar en el catálogo"
                            value={searchTerm}
                            onChange={onSearchChange}
                            className="w-full bg-transparent py-2.5 text-sm text-ink placeholder:text-muted outline-none min-h-[44px]"
                            aria-label="Buscar en el catálogo"
                        />
                    </label>
                    <select
                        value={activeSort}
                        onChange={(e) => handleSort(e.target.value)}
                        className="bg-transparent text-[13px] text-ink border-b border-ink/25 py-2.5 pr-1 min-h-[44px] cursor-pointer outline-none focus:border-primary"
                        aria-label="Ordenar"
                    >
                        <option value="">Ordenar: destacados</option>
                        <option value="asc">Precio: menor a mayor</option>
                        <option value="desc">Precio: mayor a menor</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
