"use client";
import { useRef, useEffect, KeyboardEvent } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import styles from "@/styles/chat.module.css";

import {
  FaRobot,
  FaUser,
  FaBrain,
  FaPlus,
  FaPaperPlane,
} from "react-icons/fa";
import { useChat } from "ai/react";
import { suggestionQuestions } from "@/constants";


export default function ChatPage() {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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
  });
  
  const { user } = useUser();
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);


  const handleSuggestionClick = (suggestionText: string) => {
    append({
      role: 'user',
      content: suggestionText,
    });
  };

  const handleSendMessage = () => {
    if (!input.trim() || isLoading) return;
    
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


  return (
    <section className={styles.chatContainer}>
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
        <UserButton />
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
                    <img 
                      src={user.imageUrl} 
                      alt="Usuario" 
                      className={styles.userAvatar}
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
            disabled={isLoading}
          />

          <button
            type="submit"
            className={styles.sendBtn}
            disabled={!input.trim() || isLoading}
          >
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </section>
  );
}