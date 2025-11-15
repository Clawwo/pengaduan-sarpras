import jwt from "jsonwebtoken";

export const generateToken = (payload) => {
  // Ensure role is normalized (lowercase, trimmed) before generating token
  const normalizedPayload = {
    ...payload,
    role: payload.role ? payload.role.trim().toLowerCase() : "",
  };

  return jwt.sign(normalizedPayload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};
