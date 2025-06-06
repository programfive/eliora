"use server";
import { auth } from "@clerk/nextjs/server";
import { currentUser } from '@clerk/nextjs/server';
import { db } from "@/lib/db";
import { User } from "@/lib/generated/prisma";

export const checkUser = async (): Promise<User | null> => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return null;
    }

    const user = await currentUser();
    if (!user) {
      return null;
    }


    const loggedInUser = await db.user.findUnique({
      where: {
        clerkId: userId,
      },
    });

    if (loggedInUser) return loggedInUser;

    const newUser = await db.user.create({
      data: {
        clerkId: user.id,
        name: `${user.firstName} ${user.lastName}`.trim(),
        isFirstTime:true,
      },
    });

    return newUser;
  } catch (error) {
    console.error('[Authentication Error]:', error);
    return null;
  }
}