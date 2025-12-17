import { SignJWT, jwtVerify } from "jose";

export interface JWTPayload {
  userId: string;
  userType: "admin" | "driver";
  phone: string;
  name: string;
}

export async function createToken(
  payload: JWTPayload,
  secret: string
): Promise<string> {
  const secretKey = new TextEncoder().encode(secret);
  
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secretKey);

  return token;
}

export async function verifyToken(
  token: string,
  secret: string
): Promise<JWTPayload | null> {
  try {
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey);
    
    return {
      userId: payload.userId as string,
      userType: payload.userType as "admin" | "driver",
      phone: payload.phone as string,
      name: payload.name as string,
    };
  } catch (error) {
    return null;
  }
}
