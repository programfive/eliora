export type User = {
    id: string;
    clerkId: string;
    name: string | null;
    career: string | null;
    birthDate: Date | null;
    gender: string | null;
    createdAt: Date;
    updatedAt: Date;
  };

export type UserData = {
    career: string | null;
    birthDate: Date | null;
    gender: string | null;
  };