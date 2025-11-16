import React, { useState, useEffect } from 'react';

const heroImages = [
    'https://picsum.photos/seed/hero1/1920/1080',
    'https://picsum.photos/seed/hero2/1920/1080',
    'https://picsum.photos/seed/hero3/1920/1080',
];

const HeroSection: React.FC = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
        }, 5000); // Change image every 5 seconds

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full h-[60vh] lg:h-[70vh] rounded-xl overflow-hidden shadow-2xl shadow-brand-primary/20">
            {heroImages.map((src, index) => (
                <div
                    key={src}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                >
                    <img
                        src={src}
                        alt={`Pear Phone Showcase ${index + 1}`}
                        className={`w-full h-full object-cover transition-transform duration-1000 ease-in-out ${index === currentImageIndex ? 'scale-105' : 'scale-100'}`}
                    />
                </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
            <div className="relative h-full flex flex-col justify-end items-center text-center p-8 lg:p-16 text-white">
                <div className="max-w-3xl animate-slide-in-up">
                    <h1 className="text-5xl lg:text-7xl font-extrabold mb-4 tracking-tighter text-shadow">
                        Elegance. Power. <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">Pear.</span>
                    </h1>
                    <p className="text-lg lg:text-xl text-slate-200 mb-8 text-shadow-md">
                        Experience the perfect blend of minimalist design and cutting-edge technology. Discover the device that’s crafted for you.
                    </p>
                    <a
                        href="#products"
                        className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold py-3 px-8 rounded-lg hover:bg-white/20 transition-all duration-300"
                    >
                        Explore Models
                    </a>
                </div>
            </div>
        </div>
    );
};

export { HeroSection };
