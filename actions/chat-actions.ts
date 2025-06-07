// lib/actions/chat-actions.ts
'use server'

import { db } from '@/lib/db' 
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from 'next/cache'


export async function ensureUser() {
  const { userId } =await auth()
  
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
    
    const entrance = await db.entrance.create({
      data: {}
    })

    let chat = await db.chat.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    if (!chat) {
      chat = await db.chat.create({
        data: {
          userId: user.id
        }
      })
    }

    return { entrance, chat, user }
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


    const entrance = await db.entrance.create({
      data: {}
    })

    const detalleChat = await db.detalleChat.create({
      data: {
        entranceId: entrance.id,
        chatId: chat.id,
        message: message
      }
    })

    revalidatePath('/chat')
    return detalleChat
  } catch (error) {
    console.error('Error guardando mensaje:', error)
    throw new Error('Error al guardar mensaje')
  }
}


export async function getChatHistory() {
  try {
    const user = await ensureUser()
    
    const chats = await db.chat.findMany({
      where: { userId: user.id },
      include: {
        detalleChat: {
          include: {
            entrance: true
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return chats
  } catch (error) {
    console.error('Error obteniendo historial:', error)
    throw new Error('Error al obtener historial')
  }
}

export async function createNewChat() {
  try {
    const user = await ensureUser()
    
    const chat = await db.chat.create({
      data: {
        userId: user.id
      }
    })

    revalidatePath('/chat')
    return chat
  } catch (error) {
    console.error('Error creando nuevo chat:', error)
    throw new Error('Error al crear chat')
  }
}

export async function getChatStats() {
  try {
    const totalEntrances = await db.entrance.count()
    const totalMessages = await db.detalleChat.count({
      where: {
        message: {
          not: null
        }
      }
    })
    const totalUsers = await db.user.count()
    const totalChats = await db.chat.count()

    return {
      totalEntrances,
      totalMessages,
      totalUsers,
      totalChats
    }
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error)
    throw new Error('Error al obtener estadísticas')
  }
}