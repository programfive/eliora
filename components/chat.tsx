"use client";
import { useRef, useEffect, KeyboardEvent, useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import styles from "@/styles/chat.module.css";
import SatisfactionForm from "@/components/satisfaction-form";
import Modal from "@/components/modal";
import UserDataModal from "@/components/user-data-modal";
import { FaStar } from "react-icons/fa";
import {
  saveUserMessage,
  saveAssistantMessage,
  registerChatEntrance,
  checkUserDataComplete,
  updateChatEmotion
} from "@/actions/chat-actions";

import {
  FaRobot,
  FaUser,
  FaBrain,
  FaPaperPlane,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVolumeUp,
  FaVolumeMute,
  FaStop
} from "react-icons/fa";
import { useChat } from "ai/react";
import { suggestionQuestions } from "@/constants";
import Image from "next/image";
import { formatMessage } from "@/lib/format-actions";

interface chatIdProps {
    chatId: string;     
    isSatisfactionRating: boolean;
}

export default function Chat({chatId: initialChatId, isSatisfactionRating}: chatIdProps) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { user } = useUser();
  const [showSatisfactionModal, setShowSatisfactionModal] = useState(false);
  const [isSatisfactionRatingState, setIsSatisfactionRatingState] = useState(isSatisfactionRating);
  const [currentChatId, setCurrentChatId] = useState(initialChatId);
  
  // Estados para verificación de datos del usuario
  const [showUserDataModal, setShowUserDataModal] = useState(false);
  const [userDataComplete, setUserDataComplete] = useState(true); // Iniciar como true para evitar flash
  const [isCheckingUserData, setIsCheckingUserData] = useState(true);
  
  // Estados para audio
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null);

  const { 
    messages, 
    input, 
    handleInputChange, 
    handleSubmit, 
    isLoading,
    append
  } = useChat({
    api: '/api/chat',
    initialMessages: [],
    body: {
      userId: user?.id,
      userName: user?.firstName || user?.fullName || 'Usuario',
      userImage: user?.imageUrl,
    },
    onFinish: async (message) => {
      if (currentChatId && message.role === 'assistant') {
        try {
          await saveAssistantMessage(message.content, currentChatId);
        } catch (error) {
          console.error('Error guardando respuesta del asistente:', error);
        }
      }

      if (autoPlayAudio && message.role === 'assistant') {
        handleTextToSpeech(message.content);
      }
    }
  });

  useEffect(() => {
    const initializeChat = async () => {
      if (!currentChatId && user?.id) {
        try {
          const { chat } = await registerChatEntrance();
          setCurrentChatId(chat.id);
        } catch (error) {
          console.error('Error inicializando chat:', error);
        }
      }
    };

    initializeChat();
  }, [user?.id, currentChatId]);

  // Verificar datos del usuario
  useEffect(() => {
    const checkUserDataStatus = async () => {
      if (!user?.id) return;
      
      try {
        setIsCheckingUserData(true);
        const { isComplete } = await checkUserDataComplete();
        setUserDataComplete(isComplete);
        
        if (!isComplete) {
          setShowUserDataModal(true);
        }
      } catch (error) {
        console.error('Error verificando datos del usuario:', error);
        // En caso de error, asumir que los datos están completos para no bloquear
        setUserDataComplete(true);
      } finally {
        setIsCheckingUserData(false);
      }
    };

    checkUserDataStatus();
  }, [user?.id]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleUserDataComplete = () => {
    setUserDataComplete(true);
    setShowUserDataModal(false);
  };

  const startRecording = async () => {
    if (!userDataComplete) {
      setShowUserDataModal(true);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await transcribeAudio(audioBlob);
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setRecordingInterval(interval);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Error al acceder al micrófono. Verifica los permisos.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);
      if (recordingInterval) {
        clearInterval(recordingInterval);
        setRecordingInterval(null);
      }
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      
      const response = await fetch('/api/speech-to-text', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Error en la transcripción');
      }
      
      const { text } = await response.json();
      
      if (text.trim()) {
        if (!userDataComplete) {
          setShowUserDataModal(true);
          return;
        }

        // Guardar mensaje del usuario antes de enviarlo
        await handleUserMessage(text);
        
        append({
          role: 'user',
          content: text,
        });
      }
      
    } catch (error) {
      console.error('Error transcribing audio:', error);
      alert('Error al transcribir el audio. Inténtalo de nuevo.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleTextToSpeech = async (text: string) => {
    if (isSpeaking) return;
    
    setIsSpeaking(true);
    
    try {
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        throw new Error('Error en la síntesis de voz');
      }
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        await audioRef.current.play();
      }
      
    } catch (error) {
      console.error('Error with text-to-speech:', error);
      setIsSpeaking(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSpeaking(false);
    }
  };

  const handleUserMessage = async (content: string) => {
    if (!userDataComplete) {
      setShowUserDataModal(true);
      return;
    }

    if (!currentChatId) {
      console.error('No hay chat ID disponible');
      return;
    }

    try {
      await saveUserMessage(content, currentChatId);
    } catch (error) {
      console.error('Error guardando mensaje del usuario:', error);
    }
  };

  const handleSuggestionClick = async (suggestionText: string, suggestionTitle: string) => {
    if (!userDataComplete) {
      setShowUserDataModal(true);
      return;
    }

    // Extraer la emoción del título (eliminar el emoji y espacios)
    const emotion = suggestionTitle.replace(/^[^\s]+\s+/, '').trim();

    if (!currentChatId) {
      try {
        const { chat } = await registerChatEntrance(emotion);
        setCurrentChatId(chat.id);
      } catch (error) {
        console.error('Error inicializando chat:', error);
      }
    } else {
      try {
        await updateChatEmotion(currentChatId, emotion);
      } catch (error) {
        console.error('Error actualizando emoción:', error);
      }
    }

    await handleUserMessage(suggestionText);
    
    append({
      role: 'user',
      content: suggestionText,
    });
  };

  const handleCustomSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;

    if (!userDataComplete) {
      setShowUserDataModal(true);
      return;
    }

    const messageContent = input.trim();
    
    await handleUserMessage(messageContent);
    
    handleSubmit(e);
  };

  const handleSendMessage = () => {
    if (!input.trim() || isLoading) return;
    
    if (!userDataComplete) {
      setShowUserDataModal(true);
      return;
    }
    
    const form = textareaRef.current?.closest('form');
    if (form) {
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(submitEvent);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSatisfactionSubmitted = () => {
    setShowSatisfactionModal(false);
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Mostrar loading mientras verifica datos del usuario
  if (isCheckingUserData) {
    return (
      <section className={styles.chatContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Cargando...</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.chatContainer}>
      <audio ref={audioRef} style={{ display: 'none' }} />
      
      <div className={styles.header}>
        <div className={styles.chatTitle}>
          <div className={styles.botIcon}>
            <FaBrain style={{color:"#091a44"}}/>
          </div>
          <div>
            <h1 style={{color:"#091a44"}}>ELIORA</h1>
            <p className={styles.subtitle}>Aquí para escucharte y apoyarte</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.audioToggle}
            onClick={() => setAutoPlayAudio(!autoPlayAudio)}
            title={autoPlayAudio ? "Desactivar audio automático" : "Activar audio automático"}
          >
            {autoPlayAudio ? <FaVolumeUp /> : <FaVolumeMute />}
          </button>
          
          { messages.length > 0 && !isSatisfactionRatingState && (
            <button 
              className={styles.satisfactionButton}
              onClick={() => setShowSatisfactionModal(true)}
              title="Calificar la conversación"
            >
              <FaStar />
            </button>
          )}
          <UserButton />
        </div>
      </div>

      <div className={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div className={styles.welcomeScreen}>
            <h2 className={styles.welcomeTitle}>
              {user?.firstName ? `¡Hola ${user.firstName}! ¿En qué puedo ayudarte hoy?` : '¿En qué puedo ayudarte hoy?'}
            </h2>
            <p className={styles.welcomeMessage}>
              Estoy aquí para escucharte y brindarte apoyo. Puedes hablarme sobre cualquier cosa que te preocupe.
            </p>
            <p className={styles.audioHint}>
              💡 Puedes escribir o usar el micrófono para hablar conmigo
            </p>

            <div className={styles.suggestionsGrid}>
              {suggestionQuestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={styles.suggestionCard}
                  onClick={() => handleSuggestionClick(suggestion.text, suggestion.title)}
                >
                  <h4>{suggestion.title}</h4>
                  <p>{suggestion.subtitle}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.messagesList}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`${styles.message} ${message.role === 'user' ? styles.user : styles.bot}`}
              >
                <div className={styles.messageAvatar}>
                  {message.role === 'assistant' ? (
                    <FaRobot />
                  ) : user?.imageUrl ? (
                    <Image
                      priority 
                      src={user.imageUrl} 
                      alt="Usuario" 
                      className={styles.userAvatar}
                      width={32}
                      height={32}
                    />
                  ) : (
                    <FaUser />
                  )}
                </div>
                <div className={styles.messageContent}>
                  <div 
                    className={styles.messageText}
                    dangerouslySetInnerHTML={{ 
                      __html: formatMessage(message.content) 
                    }}
                  />
                  {message.role === 'assistant' && (
                    <button
                      className={styles.playAudioBtn}
                      onClick={() => handleTextToSpeech(message.content)}
                      disabled={isSpeaking}
                      title="Reproducir audio"
                    >
                      <FaVolumeUp />
                    </button>
                  )}
                  <div className={styles.messageTime}>
                    {new Date(message.createdAt || Date.now()).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className={`${styles.message} ${styles.bot}`}>
                <div className={styles.messageAvatar}>
                  <FaRobot />
                </div>
                <div className={styles.typingIndicator}>
                  <div className={styles.typingDot}></div>
                  <div className={styles.typingDot}></div>
                  <div className={styles.typingDot}></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <Modal 
        isOpen={showSatisfactionModal} 
        onClose={() => setShowSatisfactionModal(false)}
        title="Califica tu experiencia"
      >
        {currentChatId ? (
          <SatisfactionForm 
            chatId={currentChatId}
            onSubmitted={handleSatisfactionSubmitted}
            setShowSatisfactionModal={setShowSatisfactionModal}
            setIsSatisfactionRatingState={setIsSatisfactionRatingState}
          />
        ) : (
          <div style={{ textAlign: 'center', color: 'red' }}>
            No se encontró un chat activo para calificar.
          </div>
        )}
      </Modal>

      <UserDataModal
        isOpen={showUserDataModal}
        onClose={() => setShowUserDataModal(false)}
        onComplete={handleUserDataComplete}
      />

      {(isRecording || isTranscribing || isSpeaking) && (
        <div className={styles.audioStatus}>
          {isRecording && (
            <div className={styles.recordingStatus}>
              <FaMicrophone className={styles.pulsingIcon} />
              <span>Grabando... {formatRecordingTime(recordingTime)}</span>
            </div>
          )}
          {isTranscribing && (
            <div className={styles.transcribingStatus}>
              <span>Transcribiendo audio...</span>
            </div>
          )}
          {isSpeaking && (
            <div className={styles.speakingStatus}>
              <FaVolumeUp className={styles.pulsingIcon} />
              <span>Reproduciendo respuesta...</span>
              <button onClick={stopAudio} className={styles.stopAudioBtn}>
                <FaStop />
              </button>
            </div>
          )}
        </div>
      )}

      <div className={styles.inputContainer}>
        <form onSubmit={handleCustomSubmit} className={styles.inputWrapper}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Comparte lo que sientes... o usa el micrófono"
            className={styles.messageInput}
            rows={1}
            disabled={isLoading || isRecording}
          />

          <button
            type="button"
            className={`${styles.micBtn} ${isRecording ? styles.recording : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading || isTranscribing}
            title={isRecording ? "Detener grabación" : "Grabar mensaje de voz"}
          >
            {isRecording ? <FaMicrophoneSlash /> : <FaMicrophone />}
          </button>

          <button
            type="submit"
            className={styles.sendBtn}
            disabled={!input.trim() || isLoading || isRecording}
          >
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </section>
  );
}