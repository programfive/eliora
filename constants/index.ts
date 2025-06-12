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
      image: "/images/5.jpg",
      title: "Biblioteca Central",
      description: "Recursos académicos de vanguardia"
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
      
      title: "🗨️ Gestión de Ansiedad",
      subtitle: "Técnicas para manejar momentos de estrés",
      text: "Hola, me siento muy ansioso últimamente y no sé cómo manejarlo. ¿Podrías ayudarme con algunas técnicas para controlar mi ansiedad?",
    },
    {
 
      title: "😢 Apoyo Emocional",
      subtitle: "Hablar sobre sentimientos difíciles",
      text: "Estoy pasando por un momento muy difícil emocionalmente. Necesito hablar con alguien sobre lo que estoy sintiendo.",
    },
    {

      title: "🧠 Autoconocimiento",
      subtitle: "Explorar pensamientos y emociones",
      text: "Quiero entender mejor mis emociones y patrones de pensamiento. ¿Podrías guiarme en un proceso de autoexploración?",
    },
    {
      title: "💪 Desarrollo Personal",
      subtitle: "Estrategias para crecer y mejorar",
      text: "Me gustaría trabajar en mi crecimiento personal y desarrollar mejores hábitos. ¿Qué estrategias me recomiendas?",
    },
  ];
