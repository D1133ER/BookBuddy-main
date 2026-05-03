import { db, type User } from '@/lib/mockDb';

export const login = async (username: string): Promise<User | null> => {
  const users = await db.getUsers();
  const user = users.find((u) => u.username === username);
  if (!user) return null;

  await db.setSession({ user });
  return user;
};

export const register = async (userData: Omit<User, 'id'>): Promise<User> => {
  const newUser: User = {
    ...userData,
    id: db.generateId(),
    created_at: new Date().toISOString(),
  };

  const users = await db.getUsers();
  await db.setUsers([...users, newUser]);
  await db.setSession({ user: newUser });
  return newUser;
};

export const logout = async (): Promise<void> => {
  await db.setSession(null);
};

export const getCurrentUser = async (): Promise<User | null> => {
  const session = await db.getSession();
  return session?.user || null;
};
