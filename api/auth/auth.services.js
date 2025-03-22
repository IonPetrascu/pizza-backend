import { prisma } from "../../prisma/prisma-client.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Секретный ключ для JWT (должен совпадать с cart.routes.js)
const JWT_SECRET = process.env.BACKEND_JWT_SECRET || 'your-backend-jwt-secret';


export async function login(email, password) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return null;
  }

  // Данные для токена
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role || "USER",
  };

  // Генерация JWT-токена
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

  console.log('GENERATE TOKEN', JWT_SECRET);
  console.log({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role || "USER",
    token, // Добавляем токен в ответ
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role || "USER",
    token, // Добавляем токен в ответ
  };
}

export async function register({ fullName, email, password }) {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      name: fullName,
      email,
      password: hashedPassword,
      role: "USER",
    },
  });
  console.log("new user");

  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
  };
}