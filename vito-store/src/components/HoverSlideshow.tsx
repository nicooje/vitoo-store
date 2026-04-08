'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Props {
    imageUrls: string;
    productName: string;
}

export default function HoverSlideshow({ imageUrls, productName }: Props) {
    const [images, setImages] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (imageUrls) {
            setImages(imageUrls.split(',').filter(Boolean).map(url => url.trim()));
        }
    }, [imageUrls]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isHovered && images.length > 1) {
            // Empezar visualizando la segunda imagen inmediatamente al pasar el mouse por primera vez
            if (currentIndex === 0) setCurrentIndex(1);
            
            interval = setInterval(() => {
                setCurrentIndex(prev => (prev + 1) % images.length);
            }, 1500);
        } else {
            setCurrentIndex(0);
        }
        return () => clearInterval(interval);
    }, [isHovered, images.length]);

    if (images.length === 0) return <div className="w-full h-full bg-slate-100" />;

    return (
        <div 
            className="w-full h-full relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Image 
                src={images[currentIndex]} 
                alt={productName} 
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105" 
            />
            {images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                    {images.map((_, idx) => (
                        <div 
                            key={idx} 
                            className={`h-1 rounded-full transition-all duration-300 shadow-sm ${idx === currentIndex ? 'w-3 bg-white' : 'w-1.5 bg-white/60'}`} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
