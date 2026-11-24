"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type SlideCta = {
    label: string;
    href: string;
};

type HomeSlide = {
    id: string;
    image: string;
    alt: string;
    eyebrow: string;
    title: string;
    description: string;
    primaryCta: SlideCta;
    secondaryCta?: SlideCta;
};

const AUTOPLAY_INTERVAL_MS = 6500;

const slides: HomeSlide[] = [
    {
        id: "adopciones",
        image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1600&h=900&q=80",
        alt: "Perros al aire libre",
        eyebrow: "Plataforma para refugios y adoptantes",
        title: "Conecta animales con familias, con claridad y confianza",
        description:
            "Pixkki ayuda a refugios a gestionar adopciones de forma transparente y a adoptantes a encontrar perfiles confiables, con información clara y seguimiento.",
        primaryCta: { label: "Ver animales en adopción", href: "/adopciones" },
    },
    {
        id: "historias",
        image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1600&h=900&q=80",
        alt: "Gato mirando a la cámara",
        eyebrow: "Plataforma para refugios y adoptantes",
        title: "Cada historia merece una familia",
        description:
            "Explora perfiles publicados por refugios, con información segura, búsqueda sencilla y un formulario claro para postularte sin crear cuenta.",
        primaryCta: { label: "Explorar catálogo", href: "/adopciones" },
    },
    {
        id: "refugios",
        image: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1600&h=900&q=80",
        alt: "Animales de compañía juntos",
        eyebrow: "Plataforma para refugios y adoptantes",
        title: "Soy refugio: gestiona con claridad",
        description:
            "Publica animales, recibe solicitudes y acompaña cada adopción con información clara y datos protegidos.",
        primaryCta: { label: "Soy refugio / Iniciar sesión", href: "/login" },
        secondaryCta: { label: "Cómo funciona", href: "#como-funciona" },
    },
];

export function HomeHeroSlider() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [manuallyPaused, setManuallyPaused] = useState(false);
    const [interactionPaused, setInteractionPaused] = useState(false);
    const [reduceMotion, setReduceMotion] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        const syncPreference = () => setReduceMotion(mediaQuery.matches);

        syncPreference();
        mediaQuery.addEventListener("change", syncPreference);
        return () => mediaQuery.removeEventListener("change", syncPreference);
    }, []);

    useEffect(() => {
        if (manuallyPaused || interactionPaused || reduceMotion) {
            return;
        }

        const timer = window.setInterval(() => {
            setActiveIndex((current) => (current + 1) % slides.length);
        }, AUTOPLAY_INTERVAL_MS);

        return () => window.clearInterval(timer);
    }, [manuallyPaused, interactionPaused, reduceMotion]);

    const goTo = (index: number) => {
        setActiveIndex(((index % slides.length) + slides.length) % slides.length);
    };

    const activeSlide = slides[activeIndex];

    return (
        <section
            ref={sectionRef}
            aria-roledescription="carrusel"
            aria-label="Portada de Pixkki"
            className="relative h-[460px] w-full overflow-hidden bg-foreground sm:h-[520px] lg:h-[600px]"
            onMouseEnter={() => setInteractionPaused(true)}
            onMouseLeave={() => setInteractionPaused(false)}
            onFocusCapture={() => setInteractionPaused(true)}
            onBlurCapture={(event) => {
                if (!sectionRef.current?.contains(event.relatedTarget)) {
                    setInteractionPaused(false);
                }
            }}
        >
            <div className="absolute inset-0">
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        aria-hidden={index !== activeIndex}
                        className={`absolute inset-0 transition-opacity duration-700 ${index === activeIndex ? "opacity-100" : "opacity-0"}`}
                    >
                        <Image
                            src={slide.image}
                            alt={slide.alt}
                            fill
                            priority={index === 0}
                            sizes="100vw"
                            className="object-cover"
                        />
                    </div>
                ))}
            </div>

            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/15" aria-hidden="true" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" aria-hidden="true" />

            <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
                <div key={activeSlide.id} className="max-w-2xl space-y-5">
                    <p className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/25">
                        {activeSlide.eyebrow}
                    </p>
                    <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                        {activeSlide.title}
                    </h1>
                    <p className="max-w-xl text-base text-white/80 sm:text-lg">
                        {activeSlide.description}
                    </p>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Link
                            href={activeSlide.primaryCta.href}
                            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground hover:opacity-90"
                        >
                            {activeSlide.primaryCta.label}
                        </Link>
                        {activeSlide.secondaryCta ? (
                            <Link
                                href={activeSlide.secondaryCta.href}
                                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/60 bg-black/20 px-6 text-sm font-medium text-white hover:bg-white/10"
                            >
                                {activeSlide.secondaryCta.label}
                            </Link>
                        ) : null}
                    </div>
                </div>

                <div className="mt-10 flex items-center gap-3 sm:mt-12 sm:gap-4">
                    <button
                        type="button"
                        aria-label="Diapositiva anterior"
                        onClick={() => goTo(activeIndex - 1)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/50 text-white transition-colors hover:bg-white/15"
                    >
                        <ArrowLeft size={18} aria-hidden="true" />
                    </button>

                    <div className="flex items-center gap-2" role="group" aria-label="Seleccionar diapositiva">
                        {slides.map((slide, index) => (
                            <button
                                key={slide.id}
                                type="button"
                                aria-label={`Mostrar diapositiva ${index + 1}: ${slide.title}`}
                                aria-current={index === activeIndex ? "true" : undefined}
                                onClick={() => goTo(index)}
                                className={`h-2.5 rounded-full transition-all ${index === activeIndex ? "w-8 bg-white" : "w-2.5 bg-white/50 hover:bg-white/80"}`}
                            />
                        ))}
                    </div>

                    <button
                        type="button"
                        aria-label="Diapositiva siguiente"
                        onClick={() => goTo(activeIndex + 1)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/50 text-white transition-colors hover:bg-white/15"
                    >
                        <ArrowRight size={18} aria-hidden="true" />
                    </button>

                    <button
                        type="button"
                        aria-label={manuallyPaused ? "Reanudar carrusel" : "Pausar carrusel"}
                        onClick={() => setManuallyPaused((paused) => !paused)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/50 text-white transition-colors hover:bg-white/15 motion-reduce:hidden"
                    >
                        {manuallyPaused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
                    </button>

                    <span className="ml-auto text-xs font-medium tabular-nums text-white/80" aria-hidden="true">
                        {String(activeIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
                    </span>
                </div>
            </div>
        </section>
    );
}
