import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        phone: true,
        createdAt: true,
      }
    });

    return user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

export function getFullName(user: { firstname: string; lastname: string }) {
  return `${user.firstname} ${user.lastname}`.trim();
}

export function getUserInitials(user: { firstname: string; lastname: string }) {
  return `${user.firstname.charAt(0)}${user.lastname.charAt(0)}`.toUpperCase();
}