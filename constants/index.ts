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
    icon: string;
    title: string;
    subtitle: string;
    text: string;
  }
  
  export const carouselSlides: CarouselSlide[] = [
    {
      id: 1,
      image: "https://scontent.fsrz2-1.fna.fbcdn.net/v/t39.30808-6/481280218_1076097767881393_7575307007204462051_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=f727a1&_nc_ohc=v2k52Zt37nYQ7kNvwEJ4a7L&_nc_oc=Adm77brHMw8iqFMfZrmOnBB6Qcvy59xabZZ2z-yNyrycYEDVN291IM889fRjgXihu8E&_nc_zt=23&_nc_ht=scontent.fsrz2-1.fna&_nc_gid=KbOoYTqhwwamyjhdq-Ct2g&oh=00_AfKi_U_RzHL_nkVZAXGTv9JGlj1zOIAkMfCT3DR2XkOE1g&oe=683E2E6E",
      title: "Vida Estudiantil",
      description: "Ambiente dinámico y colaborativo"
    },
    {
      id: 2,
      image: "https://www.baratz.es/wp-content/uploads/2022/05/La-biblioteca-de-la-Universidad-Central-de-Ecuador-se-pasa-a-AbsysNet.jpg",
      title: "Biblioteca Central",
      description: "Recursos académicos de vanguardia"
    },
    {
      id: 3,
      image: "http://unibeth.edu.bo/documentos/20200722153756.jpg",
      title: "Instalaciones",
      description: "Espacios modernos para el aprendizaje"
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
      description: "Formación integral para liderar organizaciones públicas y privadas, con enfoque estratégico e innovador."
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
      icon: "🗨️",
      title: "Gestión de Ansiedad",
      subtitle: "Técnicas para manejar momentos de estrés",
      text: "Hola, me siento muy ansioso últimamente y no sé cómo manejarlo. ¿Podrías ayudarme con algunas técnicas para controlar mi ansiedad?",
    },
    {
      icon: "😢",
      title: "Apoyo Emocional",
      subtitle: "Hablar sobre sentimientos difíciles",
      text: "Estoy pasando por un momento muy difícil emocionalmente. Necesito hablar con alguien sobre lo que estoy sintiendo.",
    },
    {
      icon: "🧠",
      title: "Autoconocimiento",
      subtitle: "Explorar pensamientos y emociones",
      text: "Quiero entender mejor mis emociones y patrones de pensamiento. ¿Podrías guiarme en un proceso de autoexploración?",
    },
    {
      icon: "💪",
      title: "Desarrollo Personal",
      subtitle: "Estrategias para crecer y mejorar",
      text: "Me gustaría trabajar en mi crecimiento personal y desarrollar mejores hábitos. ¿Qué estrategias me recomiendas?",
    },
  ];
