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
        <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '2rem' }}>
            <div style={{
                display: 'flex',
                gap: '12px',
                padding: '0 1rem',
                justifyContent: 'center',
                minWidth: 'max-content',
                margin: '0 auto'
            }}>
                {categories.map((cat) => {
                    const isActive = activeCategory === cat;
                    return (
                        <button
                            key={cat}
                            onClick={() => handleFilter(cat)}
                            style={{
                                padding: '10px 24px',
                                borderRadius: '50px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                border: isActive ? '2px solid #e11d48' : '1px solid #d1d5db',
                                backgroundColor: isActive ? '#e11d48' : '#ffffff',
                                color: isActive ? '#ffffff' : '#4b5563',
                                transition: 'all 0.3s ease',
                                boxShadow: isActive ? '0 4px 10px rgba(225, 29, 72, 0.3)' : '0 1px 2px rgba(0,0,0,0.05)',
                                transform: isActive ? 'scale(1.05)' : 'scale(1)'
                            }}
                            onMouseOver={(e) => {
                                if (!isActive) e.currentTarget.style.borderColor = '#fda4af';
                            }}
                            onMouseOut={(e) => {
                                if (!isActive) e.currentTarget.style.borderColor = '#d1d5db';
                            }}
                        >
                            {cat}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}