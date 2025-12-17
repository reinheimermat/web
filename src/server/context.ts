import { type FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function createContext(opts: FetchCreateContextFnOptions) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  let user = null;

  if (token) {
    try {
      // Verifica o JWT
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        email: string;
      };
      user = { id: decoded.userId, email: decoded.email };
    } catch (err) {
      // Token inválido ou expirado
      user = null;
    }
  }

  return {
    user, // Se null, não está logado. Se tiver objeto, está logado.
    headers: opts?.req.headers,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
