"use client"
import React, { useState, useEffect } from 'react';
import styles from '@/styles/index.module.css';
import { carouselSlides, programs, icons } from '../constants';
import Link from 'next/link';
import Image from "next/image";
import { useUser } from "@clerk/nextjs"

const HomePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginModalActive, setIsLoginModalActive] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { user } = useUser();
  console.log("user",user);


  // const isAdminrole = user?.publicMetadata?.role === "admin"


  // Loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Carousel auto-play effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Escape key handler for modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLoginModalActive) {
        setIsLoginModalActive(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isLoginModalActive]);



  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingOverlay}>
        <div className={styles.loadingSpinner}></div>
      </div>
    );
  }

  return (
    <>
            <div className={styles.header}>
              <h1>Campus Universitario</h1>
              <p>Descubre nuestras modernas instalaciones y ambiente académico de excelencia</p>
            </div>

            {/* Campus Section */}
            <div className={styles.campusSection}>
              <h2 className={styles.sectionTitle}>Nuestro Campus</h2>
              <div className={styles.campusCarousel}>
                <div className={styles.campusCarousel}>
                  {carouselSlides.map((slide, index) => (
                    <div 
                      key={slide.id}
                      className={`${styles.carouselSlide} ${index === currentSlide ? styles.active : ''}`}
                    >
                      <Image
                        src={slide.image}
                        alt={slide.title}
                        width={800}
                        height={400}
                        className={styles.carouselImage}
                        style={{ objectFit: "cover", width: "100%", height: "auto" }}
                        priority={index === currentSlide}
                      />
                      <div className={styles.slideOverlay}>
                        <h3>{slide.title}</h3>
                        <p>{slide.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className={`${styles.carouselControl} ${styles.prev}`} onClick={prevSlide}>
                  <icons.chevronLeft />
                </button>
                <button className={`${styles.carouselControl} ${styles.next}`} onClick={nextSlide}>
                  <icons.chevronRight />
                </button>
                <div className={styles.carouselIndicators}>
                  {carouselSlides.map((_, index) => (
                    <div 
                      key={index}
                      className={`${styles.carouselIndicator} ${index === currentSlide ? styles.active : ''}`}
                      onClick={() => goToSlide(index)}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Programs Section */}
            <div className={styles.programsSection}>
              <h2 className={styles.sectionTitle}>Carreras Académicas</h2>
              <div className={styles.programsGrid}>
                {programs.map((program) => {
                  const IconComponent = program.icon;
                  return (
                    <div key={program.id} className={styles.programCard}>
                      <div className={styles.programIcon}>
                        <IconComponent />
                      </div>
                      <h3>{program.title}</h3>
                      <p>{program.description}</p>
                      <Link href="#" className={styles.programBtn}>
                        Más información <icons.arrowRight />
                      </Link>
                    </div>
                  );
                })}
              </div>
       </div>
    </>
  );
};

export default HomePage;