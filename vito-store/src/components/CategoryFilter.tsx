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
        router.replace(`/?${params.toString()}#catalogo`, { scroll: false });
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            paddingBottom: '1rem',
            flexWrap: 'wrap'
        }}>
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    style={{
                        padding: '0.6rem 1.5rem',
                        borderRadius: '25px',
                        border: '2px solid var(--primary)',
                        backgroundColor: activeCategory === cat ? 'var(--primary)' : 'transparent',
                        color: activeCategory === cat ? 'white' : 'var(--primary)',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        transition: 'all 0.3s ease',
                        boxShadow: activeCategory === cat ? '0 4px 10px rgba(0,0,0,0.1)' : 'none'
                    }}
                    onMouseOver={e => {
                        if (activeCategory !== cat) {
                            e.currentTarget.style.backgroundColor = 'var(--primary-light)';
                            e.currentTarget.style.color = 'var(--foreground)';
                        }
                    }}
                    onMouseOut={e => {
                        if (activeCategory !== cat) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--primary)';
                        }
                    }}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
}
