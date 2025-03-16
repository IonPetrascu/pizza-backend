import { prisma } from "../../prisma/prisma-client.js";
import bcrypt from "bcrypt";

export async function login(email, password) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return null;
  }

  return {
    id: user.id,
    name: user.name, // Используем name из базы
    email: user.email,
    role: user.role || "USER",
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
      name: fullName, // Сохраняем fullName как name в базе
      email,
      password: hashedPassword,
      role: "USER",
    },
  });
  console.log("new user");

  return {
    id: newUser.id,
    name: newUser.name, // Возвращаем name из базы
    email: newUser.email,
    role: newUser.role,
  };
}