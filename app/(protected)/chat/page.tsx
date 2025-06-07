"use client";
import { useRef, useEffect, KeyboardEvent, useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import styles from "@/styles/chat.module.css";
import Image from "next/image";

import {
  FaRobot,
  FaUser,
  FaBrain,
  FaPlus,
  FaMicrophone,
  FaPaperPlane,
} from "react-icons/fa";
import { useChat } from "ai/react";
import { suggestionQuestions } from "@/constants";
import { createNewChat, registerChatEntrance, saveUserMessage } from "@/actions/chat-actions";


export default function ChatPage() {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

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
    onFinish: async (message) => {
      // Guardar mensaje del usuario cuando el AI responde
      if (currentChatId && messages.length > 0) {
        const lastUserMessage = messages[messages.length - 1];
        if (lastUserMessage.role === 'user') {
          try {
            await saveUserMessage(lastUserMessage.content, currentChatId);
          } catch (error) {
            console.error('Error guardando mensaje:', error);
          }
        }
      }
    }
  });
  
  const { user, isLoaded } = useUser();
  
  // Inicializar chat y registrar entrada
  useEffect(() => {
    const initializeChat = async () => {
      if (isLoaded && user && !isInitialized) {
        try {
          const { chat } = await registerChatEntrance();
          setCurrentChatId(chat.id);
          setIsInitialized(true);
        } catch (error) {
          console.error('Error inicializando chat:', error);
        }
      }
    };

    initializeChat();
  }, [isLoaded, user, isInitialized]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSuggestionClick = async (suggestionText: string) => {
    if (!currentChatId) return;
    
    try {
      // Agregar mensaje al chat UI
      await append({
        role: 'user',
        content: suggestionText,
      });
      
      // Guardar en la base de datos
      await saveUserMessage(suggestionText, currentChatId);
    } catch (error) {
      console.error('Error enviando sugerencia:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !currentChatId) return;
    
    try {
      // Guardar mensaje antes de enviarlo
      await saveUserMessage(input, currentChatId);
      
      // Enviar al chat
      const form = textareaRef.current?.closest('form');
      if (form) {
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = async () => {
    try {
      const newChat = await createNewChat();
      setCurrentChatId(newChat.id);
      // Opcional: limpiar mensajes actuales
      window.location.reload(); // O usar una función para limpiar el estado del chat
    } catch (error) {
      console.error('Error creando nuevo chat:', error);
    }
  };

  if (!isLoaded || !isInitialized) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>Cargando...</div>
      </div>
    );
  }

  return (
    <section className={styles.chatContainer}>
      <div className={styles.header}>
        <div className={styles.chatTitle}>
          <div className={styles.botIcon}>
            <FaBrain style={{color:"#091a44"}}/>
          </div>
          <div>
            <h1 style={{color:"#091a44"}}>Asistente Psicológico</h1>
            <p className={styles.subtitle}>Aquí para escucharte y apoyarte</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button 
            onClick={handleNewChat}
            className={styles.newChatBtn}
            title="Nuevo Chat"
          >
            <FaPlus />
          </button>
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

            <div className={styles.suggestionsGrid}>
              {suggestionQuestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={styles.suggestionCard}
                  onClick={() => handleSuggestionClick(suggestion.text)}
                >
                  <div className={styles.suggestionIcon}>{suggestion.icon}</div>
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
                      src={user.imageUrl}
                      alt="Usuario"
                      className={styles.userAvatar}
                      width={40}
                      height={40}
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <FaUser />
                  )}
                </div>
                <div className={styles.messageContent}>
                  <div className={styles.messageText}>{message.content}</div>
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

      <div className={styles.inputContainer}>
        <form onSubmit={handleSubmit} className={styles.inputWrapper}>
          <button type="button" className={styles.attachBtn}>
            <FaPlus />
          </button>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Comparte lo que sientes..."
            className={styles.messageInput}
            rows={1}
            disabled={isLoading || !currentChatId}
          />

          <button type="button" className={styles.voiceBtn}>
            <FaMicrophone />
          </button>

          <button
            type="submit"
            className={styles.sendBtn}
            disabled={!input.trim() || isLoading || !currentChatId}
          >
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </section>
  );
}