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
    // Si no se proporciona responseTime, calcularlo basado en el último mensaje del usuario
    if (!responseTime) {
      const lastUserMessage = await db.message.findFirst({
        where: {
          chatId,
          role: 'USER'
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      if (lastUserMessage) {
        const now = new Date()
        responseTime = Math.floor((now.getTime() - lastUserMessage.createdAt.getTime()) / 1000) // en segundos
      }
    }

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
      // Calcular duración en minutos
      const duration = Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000 / 60)
      
      await db.userSession.update({
        where: { id: sessionId },
        data: {
          endTime,
          duration,
          messagesCount: session.messagesCount || 0
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

    // Tiempo promedio de sesión (en minutos)
    const sessionStats = await db.userSession.aggregate({
      _avg: {
        duration: true
      },
      _count: {
        duration: true
      },
      where: {
        duration: {
          not: null,
          gt: 0 // Solo sesiones con duración válida
        }
      }
    })

    // Tiempo promedio de respuesta (en segundos)
    const responseTimeStats = await db.message.aggregate({
      _avg: {
        responseTime: true
      },
      _count: {
        responseTime: true
      },
      where: {
        role: 'ASSISTANT',
        responseTime: {
          not: null,
          gt: 0 // Solo respuestas con tiempo válido
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

    // Usuarios activos este mes
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const activeUsersThisMonth = await db.user.count({
      where: {
        lastActiveAt: {
          gte: startOfMonth,
        },
      },
    });

    const activeUsersThisYear = await db.user.count({
      where: {
        lastActiveAt: {
          gte: startOfYear,
        },
      },
    });

    // Mensajes por hora del día
    const messagesByHour = await db.message.groupBy({
      by: ['createdAt'],
      _count: {
        createdAt: true
      },
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
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
      emotionalStats,
      avgSessionTime: Math.round(sessionStats._avg.duration || 0),
      avgResponseTime: Math.round(responseTimeStats._avg.responseTime || 0),
      activeUsersToday,
      activeUsersThisMonth,
      activeUsersThisYear,
      messagesByHour,
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
export async function getAdvancedChatStats() {
    try {
      // Estadísticas básicas existentes
      const totalUsers = await db.user.count()
      const totalSessions = await db.userSession.count()
      const totalMessages = await db.message.count({
        where: { role: 'USER' }
      })
      const totalChats = await db.chat.count()
      
      // 1. ESTADÍSTICAS DE TIEMPO Y SESIONES
      const avgSessionTime = await db.userSession.aggregate({
        _avg: { duration: true },
        _max: { duration: true },
        _min: { duration: true },
        where: { duration: { not: null } }
      })
  
      // Distribución de duración de sesiones
      const sessionDurationDistribution = await db.userSession.groupBy({
        by: ['duration'],
        _count: { duration: true },
        where: { duration: { not: null } },
        orderBy: { duration: 'asc' }
      })
  
      // Estadísticas por hora del día
      const hourlyActivity = await db.$queryRaw`
        SELECT 
          EXTRACT(HOUR FROM "createdAt") as hour,
          COUNT(*) as sessions
        FROM "user_sessions"
        WHERE "createdAt" >= NOW() - INTERVAL '30 days'
        GROUP BY EXTRACT(HOUR FROM "createdAt")
        ORDER BY hour
      `
  
      // 2. ESTADÍSTICAS EMOCIONALES AVANZADAS
      const emotionalStats = await db.emotionalState.groupBy({
        by: ['emotion'],
        _count: { emotion: true },
        _avg: { intensity: true }
      })
  
      // Evolución emocional por usuario
      const emotionalEvolution = await db.$queryRaw`
        SELECT 
          DATE_TRUNC('day', "createdAt") as date,
          emotion,
          COUNT(*) as count,
          AVG(intensity) as avg_intensity
        FROM "emotional_states"
        WHERE "createdAt" >= NOW() - INTERVAL '30 days'
        GROUP BY DATE_TRUNC('day', "createdAt"), emotion
        ORDER BY date DESC
      `
  
      // Estados emocionales por intensidad
      const intensityDistribution = await db.emotionalState.groupBy({
        by: ['intensity'],
        _count: { intensity: true },
        orderBy: { intensity: 'asc' }
      })
  
      // 3. ESTADÍSTICAS DE USUARIOS
      const userEngagement = await db.user.aggregate({
        _avg: { totalSessions: true, totalChatTime: true },
        _max: { totalSessions: true, totalChatTime: true },
        _min: { totalSessions: true, totalChatTime: true }
      })
  
      // Usuarios por carrera
      const usersByCareer = await db.user.groupBy({
        by: ['career'],
        _count: { career: true },
        where: { career: { not: null } }
      })
  
      // Usuarios por semestre
      const usersBySemester = await db.user.groupBy({
        by: ['semester'],
        _count: { semester: true },
        where: { semester: { not: null } }
      })
  
      // Usuarios por edad (calculada desde birthdate)
      const ageDistribution = await db.$queryRaw`
        SELECT 
          CASE 
            WHEN EXTRACT(YEAR FROM AGE(birthdate)) < 18 THEN 'Menor de 18'
            WHEN EXTRACT(YEAR FROM AGE(birthdate)) BETWEEN 18 AND 22 THEN '18-22'
            WHEN EXTRACT(YEAR FROM AGE(birthdate)) BETWEEN 23 AND 27 THEN '23-27'
            WHEN EXTRACT(YEAR FROM AGE(birthdate)) > 27 THEN 'Más de 27'
            ELSE 'Sin especificar'
          END as age_range,
          COUNT(*) as count
        FROM users
        WHERE birthdate IS NOT NULL
        GROUP BY age_range
      `
  
      // 4. ESTADÍSTICAS DE ACTIVIDAD
      // Usuarios activos por período
      const now = new Date()
      const activeUsers = {
        today: await db.user.count({
          where: {
            lastActiveAt: {
              gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
            }
          }
        }),
        thisWeek: await db.user.count({
          where: {
            lastActiveAt: {
              gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        }),
        thisMonth: await db.user.count({
          where: {
            lastActiveAt: {
              gte: new Date(now.getFullYear(), now.getMonth(), 1)
            }
          }
        })
      }
  
      // Retención de usuarios
      const userRetention = await db.$queryRaw`
        SELECT 
          DATE_TRUNC('week', u."registrationDate") as registration_week,
          COUNT(u.id) as registered_users,
          COUNT(CASE WHEN u."lastActiveAt" >= u."registrationDate" + INTERVAL '7 days' THEN 1 END) as retained_week1,
          COUNT(CASE WHEN u."lastActiveAt" >= u."registrationDate" + INTERVAL '30 days' THEN 1 END) as retained_month1
        FROM users u
        WHERE u."registrationDate" >= NOW() - INTERVAL '3 months'
        GROUP BY DATE_TRUNC('week', u."registrationDate")
        ORDER BY registration_week DESC
      `
  
      // 5. ESTADÍSTICAS DE MENSAJES
      const messageStats = await db.message.aggregate({
        _avg: { characterCount: true, wordCount: true },
        _max: { characterCount: true, wordCount: true },
        _min: { characterCount: true, wordCount: true },
        where: { role: 'USER' }
      })
  
      // Mensajes por día de la semana
      const messagesByDayOfWeek = await db.$queryRaw`
        SELECT 
          EXTRACT(DOW FROM "createdAt") as day_of_week,
          COUNT(*) as count
        FROM messages
        WHERE role = 'USER' AND "createdAt" >= NOW() - INTERVAL '30 days'
        GROUP BY EXTRACT(DOW FROM "createdAt")
        ORDER BY day_of_week
      `
  
      // Tiempo de respuesta del asistente
      const responseTimeStats = await db.message.aggregate({
        _avg: { responseTime: true },
        _max: { responseTime: true },
        _min: { responseTime: true },
        where: { 
          role: 'ASSISTANT',
          responseTime: { not: null }
        }
      })
  
      // 6. ESTADÍSTICAS DE SATISFACCIÓN
      const satisfactionStats = await db.satisfactionRating.aggregate({
        _avg: {
          overallRating: true,
          helpfulnessRating: true,
          empathyRating: true,
          clarityRating: true
        },
        _count: { id: true }
      })
  
      // Distribución de calificaciones
      const ratingDistribution = await db.satisfactionRating.groupBy({
        by: ['overallRating'],
        _count: { overallRating: true },
        orderBy: { overallRating: 'asc' }
      })
  
      // 7. ESTADÍSTICAS DE CRISIS/ALERTAS
      const alertStats = await db.alert.groupBy({
        by: ['type', 'severity'],
        _count: { type: true }
      })
  
      // 8. CRECIMIENTO Y TENDENCIAS
      const growthStats = await db.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "registrationDate") as month,
          COUNT(*) as new_users
        FROM users
        WHERE "registrationDate" >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', "registrationDate")
        ORDER BY month
      `
  
      // 9. PATRONES DE USO
      // Chats más largos (por número de mensajes)
      const chatLengthStats = await db.chat.aggregate({
        _avg: { messageCount: true },
        _max: { messageCount: true },
        _min: { messageCount: true }
      })
  
      // Frecuencia de uso por usuario
      const usageFrequency = await db.$queryRaw`
        SELECT 
          CASE 
            WHEN total_sessions = 1 THEN 'Una vez'
            WHEN total_sessions BETWEEN 2 AND 5 THEN '2-5 veces'
            WHEN total_sessions BETWEEN 6 AND 15 THEN '6-15 veces'
            WHEN total_sessions > 15 THEN 'Más de 15 veces'
          END as frequency_range,
          COUNT(*) as user_count
        FROM users
        WHERE total_sessions > 0
        GROUP BY frequency_range
      `
  
      return {
        // Básicas
        totalUsers,
        totalSessions,
        totalMessages,
        totalChats,
        
        // Tiempo y sesiones
        avgSessionTime: Math.round(avgSessionTime._avg.duration || 0),
        maxSessionTime: avgSessionTime._max.duration || 0,
        minSessionTime: avgSessionTime._min.duration || 0,
        sessionDurationDistribution,
        hourlyActivity,
        
        // Emocionales
        emotionalStats,
        emotionalEvolution,
        intensityDistribution,
        
        // Usuarios
        userEngagement,
        usersByCareer,
        usersBySemester,
        ageDistribution,
        activeUsers,
        userRetention,
        
        // Mensajes
        messageStats,
        messagesByDayOfWeek,
        responseTimeStats,
        
        // Satisfacción
        satisfactionStats,
        ratingDistribution,
        
        // Crisis/Alertas
        alertStats,
        
        // Crecimiento
        growthStats,
        
        // Patrones de uso
        chatLengthStats,
        usageFrequency
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas avanzadas:', error)
      throw new Error('Error al obtener estadísticas avanzadas')
    }
  }
  
  export async function getCrisisDetectionStats() {
    try {
      // Usuarios en riesgo basado en patrones emocionales
      const usersAtRisk = await db.user.findMany({
        where: {
          emotionalStates: {
            some: {
              AND: [
                { emotion: { in: ['SAD', 'ANXIOUS'] } },
                { intensity: { gte: 8 } },
                { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
              ]
            }
          }
        },
        include: {
          emotionalStates: {
            where: {
              createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      })
  
      // Patrones de deterioro emocional
      const emotionalDeterioration = await db.$queryRaw`
        WITH user_emotion_trends AS (
          SELECT 
            "userId",
            emotion,
            AVG(intensity) as avg_intensity,
            COUNT(*) as frequency,
            MAX("createdAt") as last_occurrence
          FROM "emotional_states"
          WHERE "createdAt" >= NOW() - INTERVAL '14 days'
          GROUP BY "userId", emotion
        )
        SELECT 
          u.id as user_id,
          u.name,
          u.email,
          COUNT(CASE WHEN t.emotion IN ('SAD', 'ANXIOUS', 'ANGRY') AND t.avg_intensity >= 7 THEN 1 END) as negative_emotions_count,
          AVG(CASE WHEN t.emotion IN ('SAD', 'ANXIOUS', 'ANGRY') THEN t.avg_intensity END) as avg_negative_intensity
        FROM users u
        JOIN user_emotion_trends t ON u.id = t."userId"
        GROUP BY u.id, u.name, u.email
        HAVING COUNT(CASE WHEN t.emotion IN ('SAD', 'ANXIOUS', 'ANGRY') AND t.avg_intensity >= 7 THEN 1 END) >= 2
        ORDER BY avg_negative_intensity DESC NULLS LAST
      `
  
      return {
        usersAtRisk: usersAtRisk.length,
        riskUsers: usersAtRisk.slice(0, 5), // Top 5 para el dashboard
        emotionalDeterioration
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas de crisis:', error)
      throw new Error('Error al obtener estadísticas de crisis')
    }
  }
  
  export async function getPersonalizedUserStats(userId?: string) {
    try {
      const user = userId ? await db.user.findUnique({ where: { id: userId } }) : await ensureUser()
      
      if (!user) throw new Error('Usuario no encontrado')
  
      // Estadísticas personales del usuario
      const personalStats = await db.user.findUnique({
        where: { id: user.id },
        include: {
          emotionalStates: {
            orderBy: { createdAt: 'desc' },
            take: 30
          },
          chats: {
            include: {
              messages: {
                where: { role: 'USER' },
                select: { characterCount: true, wordCount: true, createdAt: true }
              },
              satisfactionRating: true
            },
            orderBy: { createdAt: 'desc' }
          },
          sessions: {
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      })
  
      // Progreso emocional del usuario
      const emotionalProgress = await db.$queryRaw`
        SELECT 
          DATE_TRUNC('day', "createdAt") as date,
          emotion,
          AVG(intensity) as avg_intensity,
          COUNT(*) as count
        FROM "emotional_states"
        WHERE "userId" = ${user.id} AND "createdAt" >= NOW() - INTERVAL '30 days'
        GROUP BY DATE_TRUNC('day', "createdAt"), emotion
        ORDER BY date DESC
      `
  
      return {
        personalStats,
        emotionalProgress
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas personalizadas:', error)
      throw new Error('Error al obtener estadísticas personalizadas')
    }
  }
  