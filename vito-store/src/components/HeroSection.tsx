export default function HeroSection() {
    return (
        <section style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '6rem 2rem',
            backgroundColor: 'var(--primary-light)',
            minHeight: '60vh'
        }}>
            <h1 style={{
                fontSize: '3.5rem',
                color: 'var(--primary)',
                marginBottom: '1rem',
                lineHeight: 1.2
            }}>
                Resaltá tu esencia <br />
                <span style={{ color: 'var(--accent)' }}>en Corrientes</span>
            </h1>
            <p style={{
                fontSize: '1.2rem',
                color: 'var(--foreground)',
                maxWidth: '600px',
                marginBottom: '2rem',
                opacity: 0.8
            }}>
                Descubrí nuestros conjuntos, trajes de baño y pijamas diseñados para tu comodidad y estilo.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <a href="#catalogo" style={{
                    padding: '1rem 2rem',
                    backgroundColor: 'var(--accent)',
                    color: 'white',
                    borderRadius: '30px',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    boxShadow: '0 4px 14px rgba(229, 9, 20, 0.4)'
                }}>
                    Ver Colección
                </a>
            </div>
        </section>
    );
}
