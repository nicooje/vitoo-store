export default function SocialProofSection() {
    const reviews = [
        { text: "¡Me encantó la calidad de los conjuntos! Súper cómodos.", img: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200&h=200&fit=crop" },
        { text: "La malla enteriza me quedó pintada, mil gracias chicas.", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop" },
        { text: "Llegó rapidísimo a Buenos Aires, excelente atención.", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop" },
    ];

    return (
        <section id="team" style={{ padding: '4rem 5%', backgroundColor: 'var(--primary-light)' }}>
            <h2 style={{ textAlign: 'center', fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '3rem' }}>
                Team Vitö
            </h2>
            <div style={{
                display: 'flex',
                gap: '2rem',
                overflowX: 'auto',
                paddingBottom: '2rem',
                scrollSnapType: 'x mandatory'
            }}>
                {reviews.map((rev, idx) => (
                    <div key={idx} style={{
                        minWidth: '300px',
                        backgroundColor: 'var(--background)',
                        padding: '2rem',
                        borderRadius: '15px',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                        scrollSnapAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        gap: '1rem'
                    }}>
                        <img src={rev.img} alt="Clienta" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
                        <p style={{ fontStyle: 'italic', color: 'var(--foreground)' }}>&quot;{rev.text}&quot;</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
