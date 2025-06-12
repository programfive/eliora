'use server'

import { db } from '@/lib/db'
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from 'next/cache'
import { MessageRole } from '@prisma/client'

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
        userId: user.id
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

    return { session, chat, user }
  } catch (error) {
    console.error('Error registrando entrada al chat:', error)
    throw new Error('Error al registrar entrada')
  }
}

export async function saveUserMessage(message: string, chatId: string) {
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
        role: MessageRole.USER,
        wordCount: message.split(' ').filter(word => word.length > 0).length
      }
    })

    // Actualizar estadísticas del chat
    await db.chat.update({
      where: { id: chatId },
      data: {
        messageCount: { increment: 1 },
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

export async function saveAssistantMessage(message: string, chatId: string) {
  try {
    const assistantMessage = await db.message.create({
      data: {
        chatId,
        content: message,
        role: MessageRole.ASSISTANT,
        wordCount: message.split(' ').filter(word => word.length > 0).length
      }
    })

    // Actualizar contador de mensajes del chat
    await db.chat.update({
      where: { id: chatId },
      data: {
        messageCount: { increment: 1 }
      }
    })

    return assistantMessage
  } catch (error) {
    console.error('Error guardando respuesta del asistente:', error)
    throw new Error('Error al guardar respuesta')
  }
}

export async function getChatStats() {
  try {
    const totalUsers = await db.user.count()
    const totalSessions = await db.userSession.count()
    const totalMessages = await db.message.count({
      where: { role: MessageRole.USER }
    })
    const totalChats = await db.chat.count()
    
    // Usuarios activos hoy
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const activeUsersToday = await db.user.count({
      where: {
        updatedAt: {
          gte: today
        }
      }
    })

    // Usuarios activos este mes
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfYear = new Date(now.getFullYear(), 0, 1)

    const activeUsersThisMonth = await db.user.count({
      where: {
        updatedAt: {
          gte: startOfMonth,
        },
      },
    })

    const activeUsersThisYear = await db.user.count({
      where: {
        updatedAt: {
          gte: startOfYear,
        },
      },
    })

    // Satisfacción promedio
    const satisfactionStats = await db.satisfactionRating.aggregate({
      _avg: {
        overallRating: true,
        helpfulnessRating: true,
        empathyRating: true,
        clarityRating: true
      }
    })

    return {
      totalUsers,
      totalSessions,
      totalMessages,
      totalChats,
      activeUsersToday,
      activeUsersThisMonth,
      activeUsersThisYear,
      satisfactionStats: {
        overall: satisfactionStats._avg.overallRating || 0,
        helpfulness: satisfactionStats._avg.helpfulnessRating || 0,
        empathy: satisfactionStats._avg.empathyRating || 0,
        clarity: satisfactionStats._avg.clarityRating || 0
      }
    }
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error)
    throw new Error('Error al obtener estadísticas')
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

export async function hasSatisfactionRating(chatId: string) {
  const user = await ensureUser()
  const satisfactionRating = await db.satisfactionRating.findFirst({
    where: { userId: user.id, chatId }
  })
  return satisfactionRating !== null
}
export async function getCurrentChatId() {
  const user = await ensureUser()
  const chat = await db.chat.findFirst({
    where: { userId: user.id, isActive: true }
  })
  return chat?.id
}

export async function getChartData(days: number = 7) {
  try {
    const chartData = []
    const today = new Date()
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      // Establecer el inicio y fin del día
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      
      // Contar usuarios activos en ese día específico
      const activeUsers = await db.user.count({
        where: {
          updatedAt: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      })
      
      // Alternativamente, puedes contar sesiones creadas ese día
      const sessions = await db.userSession.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      })
      
      // Contar mensajes enviados ese día
      const messages = await db.message.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay
          },
          role: MessageRole.USER // Solo mensajes de usuarios
        }
      })
      
      // Contar chats creados ese día
      const chats = await db.chat.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      })
      
      chartData.push({
        time: date.toISOString().split('T')[0], // Formato YYYY-MM-DD
        activeUsers,
        sessions,
        messages,
        chats
      })
    }
    
    return chartData
  } catch (error) {
    console.error('Error obteniendo datos del gráfico:', error)
    throw new Error('Error al obtener datos del gráfico')
  }
}


export async function getActiveUsersChartData(days: number = 7) {
  try {
    const chartData = []
    const today = new Date()
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      

      const activeUsers = await db.user.count({
        where: {
          OR: [
            {
              updatedAt: {
                gte: startOfDay,
                lte: endOfDay
              }
            },
            {
              sessions: {
                some: {
                  createdAt: {
                    gte: startOfDay,
                    lte: endOfDay
                  }
                }
              }
            },
            {
              chats: {
                some: {
                  messages: {
                    some: {
                      createdAt: {
                        gte: startOfDay,
                        lte: endOfDay
                      },
                      role: MessageRole.USER
                    }
                  }
                }
              }
            }
          ]
        }
      })
      
      chartData.push({
        time: date.toISOString().split('T')[0],
        value: activeUsers
      })
    }
    
    return chartData
  } catch (error) {
    console.error('Error obteniendo datos de usuarios activos:', error)
    throw new Error('Error al obtener datos de usuarios activos')
  }
}