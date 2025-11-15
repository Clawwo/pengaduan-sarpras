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

      // Normalize role: trim whitespace and convert to lowercase for comparison
      const userRole = decoded.role ? decoded.role.trim().toLowerCase() : "";
      const normalizedRoles = roles.map((role) => role.toLowerCase());

      // Check if role is required and if user has the required role
      if (roles.length && !normalizedRoles.includes(userRole)) {
        console.log(
          `Access denied - User role: "${decoded.role}" (normalized: "${userRole}"), Required roles: ${JSON.stringify(roles)}`
        );
        return res.status(403).json({
          message: "Akses ditolak",
          detail: `Role "${decoded.role}" tidak memiliki akses`,
        });
      }

      // Store both original and normalized role
      req.user = {
        ...decoded,
        normalizedRole: userRole,
      };
      next();
    });
  };
};

export default authMiddleware;
