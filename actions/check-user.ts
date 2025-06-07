import { auth } from "@clerk/nextjs/server";
import { currentUser } from '@clerk/nextjs/server';
import { db } from "@/lib/db";


export const checkUser = async () => {
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
      },
    });

    return newUser;
  } catch (error) {
    console.error('[Authentication Error]:', error);
    return null;
  }
}