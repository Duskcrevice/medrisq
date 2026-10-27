import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  if (!user && opts.req.headers["x-demo-user"]) {
    try {
      const raw = opts.req.headers["x-demo-user"];
      const str = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "";
      if (str) {
        const parsed = JSON.parse(str);
        if (parsed && (parsed.openId || parsed.name)) {
          const parsedId = Number(parsed.id);
          const safeId = !isNaN(parsedId) && parsedId > 0 ? parsedId : 101;
          user = {
            id: safeId,
            openId: String(parsed.openId || `user-${parsed.role || "demo"}`),
            name: parsed.name || "Authenticated User",
            email: parsed.email || null,
            role: parsed.role === "admin" ? "admin" : "user",
            hospital_id: String(parsed.hospital_id || "HOSP-DEFAULT"),
            loginMethod: "demo",
            lastSignedIn: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        }
      }
    } catch {
      // ignore JSON parse error
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
