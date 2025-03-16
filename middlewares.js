import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.user = null; // Указываем, что пользователь не авторизован
    return next();
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    req.user = decoded; // Передаем декодированные данные
    next();
  } catch (error) {
    console.log("JWT Verification Error in Middleware:", error.message);
    return res.status(401).json({ message: "Invalid or expired token", error: error.message });
  }
};


function isAdmin(req, res, next) {
  try {
    // Предполагаем, что verifyToken уже добавил информацию о пользователе в req.user
    if (!req.user) {
      return res.status(401).json({ message: "Требуется авторизация" });
    }

    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: "Доступ запрещен. Требуются права администратора" });
    }

    // Если пользователь админ, передаем управление следующему middleware/обработчику
    next();
  } catch (error) {
    console.log('[IS_ADMIN_MIDDLEWARE] Error:', error);
    return res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
}
export { verifyToken, isAdmin };