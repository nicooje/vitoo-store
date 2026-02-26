import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
    return (
        <header style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 5%',
            backgroundColor: 'var(--background)',
            borderBottom: '1px solid #eaeaea',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Image src="/vito-logo.png" alt="Vito Store Logo" width={50} height={50} style={{ borderRadius: '50%' }} />
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>Vitö Store</span>
            </div>
            <nav style={{ display: 'flex', gap: '2rem', fontWeight: 500 }}>
                <Link href="#catalogo" style={{ transition: 'color 0.3s' }}>Catálogo</Link>
                <Link href="#mayorista" style={{ transition: 'color 0.3s' }}>Mayorista</Link>
                <Link href="#team" style={{ transition: 'color 0.3s' }}>Team Vitö</Link>
            </nav>
        </header>
    );
}
