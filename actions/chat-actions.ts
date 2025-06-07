'use server'

import { db } from '@/lib/db'
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from 'next/cache'
import { EmotionType } from '@prisma/client'

export async function ensureUser() {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error('Usuario no autenticado')
  }

  let user = await db.user.findUnique({
    where: { clerkId: userId }
  })

  if (!user) {
    user = await db.user.create({
      data: {
        clerkId: userId,
        name: null
      }
    })
  }

  return user
}

export async function registerChatEntrance() {
  try {
    const user = await ensureUser()
    
    // Crear nueva sesión de usuario
    const session = await db.userSession.create({
      data: {
        userId: user.id,
        startTime: new Date(),
        messagesCount: 0
      }
    })

    // Buscar chat activo o crear uno nuevo
    let chat = await db.chat.findFirst({
      where: { 
        userId: user.id,
        isActive: true 
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!chat) {
      chat = await db.chat.create({
        data: {
          userId: user.id,
          title: 'Nueva conversación',
          isActive: true
        }
      })
    }

    // Actualizar estadísticas del usuario
    await db.user.update({
      where: { id: user.id },
      data: {
        totalSessions: { increment: 1 },
        lastActiveAt: new Date()
      }
    })

    return { session, chat, user }
  } catch (error) {
    console.error('Error registrando entrada al chat:', error)
    throw new Error('Error al registrar entrada')
  }
}

export async function saveEmotionalState(emotion: EmotionType, intensity: number, description?: string) {
  try {
    const user = await ensureUser()
    
    const emotionalState = await db.emotionalState.create({
      data: {
        userId: user.id,
        emotion,
        intensity,
        description
      }
    })

    return emotionalState
  } catch (error) {
    console.error('Error guardando estado emocional:', error)
    throw new Error('Error al guardar estado emocional')
  }
}

export async function saveUserMessage(message: string, chatId: string, emotionalStateId?: string) {
  try {
    const user = await ensureUser()
    
    const chat = await db.chat.findFirst({
      where: {
        id: chatId,
        userId: user.id
      }
    })

    if (!chat) {
      throw new Error('Chat no encontrado o no autorizado')
    }

    // Guardar mensaje del usuario
    const userMessage = await db.message.create({
      data: {
        chatId: chat.id,
        content: message,
        role: 'USER',
        characterCount: message.length,
        wordCount: message.split(' ').length
      }
    })

    // Actualizar estadísticas del chat
    await db.chat.update({
      where: { id: chatId },
      data: {
        messageCount: { increment: 1 },
        emotionalStateId: emotionalStateId || undefined,
        updatedAt: new Date()
      }
    })

    revalidatePath('/chat')
    return userMessage
  } catch (error) {
    console.error('Error guardando mensaje:', error)
    throw new Error('Error al guardar mensaje')
  }
}

export async function saveAssistantMessage(message: string, chatId: string, responseTime?: number) {
  try {
    const assistantMessage = await db.message.create({
      data: {
        chatId,
        content: message,
        role: 'ASSISTANT',
        characterCount: message.length,
        wordCount: message.split(' ').length,
        responseTime
      }
    })

    return assistantMessage
  } catch (error) {
    console.error('Error guardando respuesta del asistente:', error)
    throw new Error('Error al guardar respuesta')
  }
}

export async function createNewChat(emotionalStateId?: string) {
  try {
    const user = await ensureUser()
    
    // Marcar chat anterior como inactivo
    await db.chat.updateMany({
      where: { userId: user.id, isActive: true },
      data: { isActive: false }
    })
    
    const chat = await db.chat.create({
      data: {
        userId: user.id,
        title: 'Nueva conversación',
        emotionalStateId,
        isActive: true
      }
    })

    revalidatePath('/chat')
    return chat
  } catch (error) {
    console.error('Error creando nuevo chat:', error)
    throw new Error('Error al crear chat')
  }
}

export async function endUserSession(sessionId: string) {
  try {
    const endTime = new Date()
    const session = await db.userSession.findUnique({
      where: { id: sessionId }
    })

    if (session) {
      const duration = Math.floor((endTime.getTime() - session.startTime.getTime()) / 60000) // minutos
      
      await db.userSession.update({
        where: { id: sessionId },
        data: {
          endTime,
          duration
        }
      })

      // Actualizar tiempo total del usuario
      await db.user.update({
        where: { id: session.userId },
        data: {
          totalChatTime: { increment: duration }
        }
      })
    }
  } catch (error) {
    console.error('Error finalizando sesión:', error)
  }
}

export async function getChatStats() {
  try {
    const totalUsers = await db.user.count()
    const totalSessions = await db.userSession.count()
    const totalMessages = await db.message.count({
      where: { role: 'USER' }
    })
    const totalChats = await db.chat.count()
    
    // Estadísticas emocionales
    const emotionalStats = await db.emotionalState.groupBy({
      by: ['emotion'],
      _count: {
        emotion: true
      }
    })

    // Tiempo promedio de sesión
    const avgSessionTime = await db.userSession.aggregate({
      _avg: {
        duration: true
      },
      where: {
        duration: {
          not: null
        }
      }
    })

    // Usuarios activos hoy
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const activeUsersToday = await db.user.count({
      where: {
        lastActiveAt: {
          gte: today
        }
      }
    })

    return {
      totalUsers,
      totalSessions,
      totalMessages,
      totalChats,
      emotionalStats,
      avgSessionTime: Math.round(avgSessionTime._avg.duration || 0),
      activeUsersToday
    }
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error)
    throw new Error('Error al obtener estadísticas')
  }
}

export async function getEmotionalTrends() {
  try {
    const lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)

    const trends = await db.emotionalState.groupBy({
      by: ['emotion'],
      _count: {
        emotion: true
      },
      where: {
        createdAt: {
          gte: lastWeek
        }
      }
    })

    const total = trends.reduce((sum, trend) => sum + trend._count.emotion, 0)
    
    return trends.map(trend => ({
      emotion: trend.emotion,
      count: trend._count.emotion,
      percentage: total > 0 ? (trend._count.emotion / total) * 100 : 0
    }))
  } catch (error) {
    console.error('Error obteniendo tendencias emocionales:', error)
    throw new Error('Error al obtener tendencias')
  }
}

export async function getUserProfile() {
  try {
    const user = await ensureUser()
    
    const profile = await db.user.findUnique({
      where: { id: user.id },
      include: {
        emotionalStates: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        chats: {
          where: { isActive: true },
          take: 1
        }
      }
    })

    return profile
  } catch (error) {
    console.error('Error obteniendo perfil:', error)
    throw new Error('Error al obtener perfil')
  }
}

export async function saveSatisfactionRating(chatId: string, ratings: {
  overallRating: number
  helpfulnessRating: number
  empathyRating: number
  clarityRating: number
  feedback?: string
  wouldRecommend?: boolean
}) {
  try {
    const user = await ensureUser()
    
    const rating = await db.satisfactionRating.create({
      data: {
        userId: user.id,
        chatId,
        ...ratings
      }
    })

    return rating
  } catch (error) {
    console.error('Error guardando calificación:', error)
    throw new Error('Error al guardar calificación')
  }
}