import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Получение всех пользователей
app.get("/users", async (req, res) => {
    const users = await prisma.user.findMany();
    res.json(users);
});

// Получение пользователя по ID
app.get("/users/:id", async (req, res) => {
    const { id } = req.params; // Получаем id из параметров маршрута
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: Number(id), // Преобразуем id в число, так как оно должно быть числовым в вашей модели
            },
        });

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: "Пользователь не найден" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ошибка при поиске пользователя" });
    }
});

// Добавление нового пользователя
app.post("/users", async (req, res) => {
    const { name, email } = req.body;
    try {
        const user = await prisma.user.create({ data: { name, email } });
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: "Ошибка при создании пользователя" });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
