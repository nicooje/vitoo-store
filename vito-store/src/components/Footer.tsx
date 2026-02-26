

export default function Footer() {
    return (
        <footer style={{
            padding: '3rem 5%',
            backgroundColor: 'var(--foreground)',
            color: 'var(--background)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            textAlign: 'center',
            borderTop: '1px solid #333'
        }}>
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
                <a href="https://instagram.com/vitoo.store" target="_blank" rel="noopener noreferrer" style={{ transition: 'opacity 0.3s' }}>
                    Instagram
                </a>
                <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" style={{ transition: 'opacity 0.3s' }}>
                    WhatsApp
                </a>
            </div>
            <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>
                © 2024 Vitoo Store - Diseñado en Corrientes
            </p>
        </footer>
    );
}
