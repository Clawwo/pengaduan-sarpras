import jwt from "jsonwebtoken";

const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token tidak ada" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Token tidak valid" });
      }

      // Cek role
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: "Akses ditolak" });
      }

      req.user = decoded;
      next();
    });
  };
};

export default authMiddleware;
