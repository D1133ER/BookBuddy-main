import { db } from "@/lib/mockDb";
import { ensureMockDbSeeded } from "@/lib/mockDbSeed";

const createUsername = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "") || "reader";

export async function signUp(
  email: string,
  _password: string,
  username: string,
) {
  ensureMockDbSeeded();

  const users = db.users;
  const normalizedEmail = email.trim().toLowerCase();

  if (users.find((user) => user.email?.toLowerCase() === normalizedEmail)) {
    throw new Error("User already exists");
  }

  const newUser = {
    id: db.generateId(),
    username: createUsername(username),
    email: normalizedEmail,
    display_name: username,
    avatar_url: "",
    created_at: new Date().toISOString(),
  };

  db.users = [...users, newUser];

  const session = {
    user: newUser,
    access_token: "mock-token",
  };
  db.session = session;

  return { user: newUser };
}

export async function signIn(email: string, _password: string) {
  ensureMockDbSeeded();

  const users = db.users;
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find((entry) => entry.email?.toLowerCase() === normalizedEmail);

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const session = {
    user,
    access_token: "mock-token",
  };
  db.session = session;

  return { user, session };
}

export async function signOut() {
  db.session = null;
  return true;
}

export async function resetPassword(_email: string) {
  return true;
}

export async function updatePassword(_password: string) {
  return true;
}

export async function getCurrentSession() {
  ensureMockDbSeeded();
  return db.session;
}
