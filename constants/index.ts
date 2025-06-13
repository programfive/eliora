import { 
    FaBrain, 
    FaChurch, 
    FaHandsHelping, 
    FaChartLine, 
    FaLaptopCode, 
    FaBriefcase,
    FaChevronLeft,
    FaChevronRight,
    FaArrowRight,
    FaShareAlt,
    FaFacebookF,
    FaTwitter,
    FaInstagram,
    FaLinkedinIn
  } from 'react-icons/fa';
  
  interface CarouselSlide {
    id: number;
    image: string;
    title: string;
    description: string;
  }
  
  interface Program {
    id: number;
    icon: React.ComponentType; 
    title: string;
    description: string;
  }
  interface Suggestion {
    
    title: string;
    subtitle: string;
    text: string;
  }
  
  export const carouselSlides: CarouselSlide[] = [
    {
      id: 1,
      image: "/images/1.jpg",
      title: "Vida Estudiantil",
      description: "Ambiente dinámico y colaborativo"
    },
    {
      id: 2,
      image: "/images/4.gif",
      title: "Únete a UNIBETH",
      description: "Se parte de la Universidad"
    },
    {
      id: 3,
      image: "/images/2.jpg",
      title: "Instalaciones",
      description: "Espacios modernos para el aprendizaje"
    },
    {
      id: 4,
      image: "/images/3.jpg",
      title: "Hansei University",
      description: "Alianza académica con Corea del Sur"
    }
  ];
  
  export const programs: Program[] = [
    {
      id: 1,
      icon: FaBrain,
      title: "Psicología",
      description: "Formación integral en ciencias del comportamiento humano, terapia clínica y psicología aplicada."
    },
    {
      id: 2,
      icon: FaChurch,
      title: "Teología",
      description: "Estudios profundos en doctrina cristiana, historia eclesiástica y ministerio pastoral."
    },
    {
      id: 3,
      icon: FaHandsHelping,
      title: "Trabajo Social",
      description: "Formación en intervención social, desarrollo comunitario y políticas públicas."
    },
    {
      id: 4,
      icon: FaChartLine,
      title: "Ingeniería Comercial",
      description: "Gestión empresarial, análisis financiero y estrategias de negocio innovadoras."
    },
    {
      id: 5,
      icon: FaLaptopCode,
      title: "Ingeniería Informática",
      description: "Desarrollo de software, sistemas de información y tecnologías emergentes."
    },
    {
      id: 6,
      icon: FaBriefcase,
      title: "Administración de Empresas",
      description: "Formación integral para liderar organizaciones públicas y privadas."
    }
  ];
  
  export const icons = {
    chevronLeft: FaChevronLeft,
    chevronRight: FaChevronRight,
    arrowRight: FaArrowRight,
    shareAlt: FaShareAlt,
    facebook: FaFacebookF,
    twitter: FaTwitter,
    instagram: FaInstagram,
    linkedin: FaLinkedinIn
  };

 export  const suggestionQuestions: Suggestion[] = [
    {
      title: "😊 Muy bien / Excelente",
      subtitle: "Compartir momentos positivos",
      text: "Me siento muy bien hoy y quiero compartir mis logros y momentos positivos.",
    },
    {
      title: "😐 Normal / Regular",
      subtitle: "Reflexionar sobre el día a día",
      text: "Estoy teniendo un día normal, ¿cómo puedo aprovecharlo mejor?",
    },
    {
      title: "😔 Triste / Decaído",
      subtitle: "Buscar apoyo emocional",
      text: "Me siento triste y decaído últimamente, necesito hablar sobre lo que me está afectando.",
    },
    {
      title: "😰 Ansioso / Preocupado",
      subtitle: "Manejar la ansiedad",
      text: "Me siento ansioso y preocupado, ¿podrías ayudarme a manejar estas emociones?",
    },
    {
      title: "😡 Enojado / Frustrado",
      subtitle: "Gestionar la frustración",
      text: "Estoy enojado y frustrado, necesito ayuda para manejar estas emociones intensas.",
    },
    {
      title: "😴 Cansado / Agotado",
      subtitle: "Recuperar energía",
      text: "Me siento muy cansado y agotado, ¿qué puedo hacer para recuperar mi energía?",
    },
    {
      title: "😕 Confundido / Perdido",
      subtitle: "Encontrar claridad",
      text: "Me siento confundido y perdido, necesito ayuda para encontrar dirección.",
    },
    {
      title: "😌 Relajado / Tranquilo",
      subtitle: "Mantener la calma",
      text: "Me siento relajado y tranquilo, ¿cómo puedo mantener este estado de paz?",
    },
  ];

export const emotionsDescription = `La escala de puntuación del 1 al 5 te permite expresar tu nivel de satisfacción o estado actual:

1. Muy Insatisfecho / Mal: Representa un estado de gran insatisfacción o malestar. Es importante identificar las causas y buscar ayuda para mejorar la situación.

2. Insatisfecho / Regular: Indica que hay aspectos que necesitan mejorar. Es un momento para reflexionar sobre qué cambios podrían hacer que te sientas mejor.

3. Neutral / Aceptable: Muestra un estado de equilibrio, ni muy positivo ni muy negativo. Es un buen punto de partida para trabajar en mejoras graduales.

4. Satisfecho / Bien: Demuestra un buen nivel de satisfacción. Es un momento para reconocer los aspectos positivos y mantener las buenas prácticas.

5. Muy Satisfecho / Excelente: Representa el nivel más alto de satisfacción. Es importante identificar qué factores contribuyen a este estado para poder mantenerlos.`;
