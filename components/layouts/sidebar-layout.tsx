"use client"
import React, { useState, useEffect } from 'react';
import styles from '@/styles/index.module.css';
import { useUser } from '@clerk/nextjs';
import {  icons } from '@/constants/index';

import { SignInButton, SignOutButton } from "@clerk/nextjs";
import { FaHome, FaGraduationCap, FaHandHoldingUsd, FaUserGraduate, FaUniversity, FaUserPlus, FaQuestionCircle, FaBars, FaTimes, FaRobot } from 'react-icons/fa';
import Link from 'next/link';


interface SidebarLayoutProps {
  children: React.ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarActive, setIsSidebarActive] = useState(false);
  const [isLoginModalActive, setIsLoginModalActive] = useState(false);


  const {isSignedIn} = useUser();

  // Loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);



  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (window.innerWidth <= 768) {
        const sidebar = document.getElementById('sidebar');
        const mobileToggle = document.getElementById('mobileToggle');
        
        if (sidebar && mobileToggle && 
            !sidebar.contains(target) && 
            !mobileToggle.contains(target)) {
          setIsSidebarActive(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsSidebarActive(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  const toggleSidebar = () => {
    setIsSidebarActive(!isSidebarActive);
  };

  const openLoginModal = () => {
    setIsLoginModalActive(true);
    setIsSidebarActive(false);
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
      <main className={styles.body}>
        <button 
          className={styles.mobileToggle} 
          id="mobileToggle"
          onClick={toggleSidebar}
        >
          {isSidebarActive ? <FaTimes /> : <FaBars />}
        </button>

        <div className={styles.container}>
          {/* Sidebar */}
          <div 
            className={`${styles.sidebar} ${isSidebarActive ? styles.active : ''}`}
            id="sidebar"
          >
            <div className={styles.logo}>
              <img 
                src="http://unibeth.edu.bo/documentos/20200714173736.png" 
                alt="Logo UNIBETH" 
                className={styles.logoImg}
              />
              <h2>UNIBETH</h2>
              <p>Universidad Bethesda</p>
            </div>
            
            <ul className={styles.navMenu}>
              <li><Link href="/"><FaHome style={{marginRight:"5px"}}/> Inicio</Link></li>
              <li><Link href="#"><FaGraduationCap style={{marginRight:"5px"}}/> Carreras</Link></li>
              <li><Link href="#"><FaHandHoldingUsd style={{marginRight:"5px"}}/> Becas</Link></li>
              <li><Link href="#"><FaUserGraduate style={{marginRight:"5px"}}/> Postgrado</Link></li>
              <li><Link href="#"><FaUniversity style={{marginRight:"5px"}}/> Portal Unibeth</Link></li>
              <li><Link href="#"><FaUserPlus style={{marginRight:"5px"}}/> Inscripciones</Link></li>
              <li><Link href="/chat"><FaRobot style={{marginRight:"5px"}}/> Chat Psicologico</Link></li>
              
              <li>
                <Link href="#" onClick={(e) => { e.preventDefault(); openLoginModal(); }}>
                  <FaQuestionCircle style={{marginRight:"5px"}}/> Consultas
                </Link>
              </li>
            </ul>

            <div className={`${styles.studentPortal} ${isSignedIn ? styles.studentPortalAuth : styles.studentPortalUnauth}`}>
            <p >{isSignedIn ? 'Bienvenido a tu espacio académico' : '¿Ya eres estudiante? Inicia sesión'}</p>

              {isSignedIn ? (
                <SignOutButton>
                  <button className={`${styles.loginBtn} ${styles.logoutBtn}`}>
                    Cerrar sesión
                  </button>
                </SignOutButton>
              ) : (
                <SignInButton>
                  <button className={`${styles.loginBtnUnauth} ${styles.loginBtnUnauth}`}>
                    Iniciar sesión
                  </button>
                </SignInButton>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className={styles.main}>

            {children}

            {/* Footer */}
            <div className={styles.footer}>
              <div className={styles.footerContent}>
                <div className={styles.footerSection}>
                  <h4><icons.shareAlt /> Síguenos</h4>
                  <div className={styles.socialLinks}>
                    <Link href="#"><icons.facebook /></Link>
                    <Link href="#"><icons.twitter /></Link>
                    <Link href="#"><icons.instagram /></Link>
                    <Link href="#"><icons.linkedin /></Link>
                  </div>
                </div>
              </div>
              <div className={`${styles.copyright} ${isSignedIn ? styles.copyrightAuth : styles.copyrightUnauth}`}>
                <p>© 2024 Universidad Bethesda. Todos los derechos reservados. | 
                  <Link href="#" className={isSignedIn ? styles.linkAuth : styles.linkUnauth}>Política de Privacidad</Link> | 
                  <Link href="#" className={isSignedIn ? styles.linkAuth : styles.linkUnauth}>Términos de Uso</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};
export default SidebarLayout;