export default function MayoristaSection() {
    return (
        <section id="mayorista" style={{
            padding: '5rem 5%',
            backgroundColor: 'var(--foreground)',
            color: 'var(--background)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
        }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--primary-light)' }}>
                Revendedoras
            </h2>
            <p style={{ fontSize: '1.2rem', maxWidth: '600px', marginBottom: '2.5rem', opacity: 0.9 }}>
                ¿Querés emprender? Sumate a nuestro equipo. Tenemos precios exclusivos por mayor con atención personalizada.
            </p>
            <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" style={{
                padding: '1rem 2rem',
                backgroundColor: '#25D366',
                color: 'white',
                borderRadius: '30px',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(37, 211, 102, 0.4)'
            }}>
                Unite al Grupo de WhatsApp
            </a>
        </section>
    );
}
