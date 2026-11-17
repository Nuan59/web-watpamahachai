import { createHmac, randomBytes, scrypt as _scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(_scrypt) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

export async function hashPassword(pw: string) {
  const salt = randomBytes(16);
  return ["scrypt", salt.toString("hex"), (await scrypt(pw, salt, 64)).toString("hex")].join("$");
}

export async function verifyPassword(pw: string, stored: string) {
  const [alg, salt, hash] = stored.split("$");
  if (alg !== "scrypt" || !salt || !hash) return false;
  const got = await scrypt(pw, Buffer.from(salt, "hex"), 64);
  const want = Buffer.from(hash, "hex");
  return got.length === want.length && timingSafeEqual(got, want);
}

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET must be set (32+ chars)");
  return s;
}
const mac = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

/** Token = userId.expiresEpoch.hmac */
export async function signSession(userId: string, ttlSeconds: number) {
  const payload = `${userId}.${Math.floor(Date.now() / 1000) + ttlSeconds}`;
  return `${payload}.${mac(payload)}`;
}

export async function readSession(token: string | undefined): Promise<string | null> {
  const parts = token?.split(".");
  if (!parts || parts.length !== 3) return null;
  const [uid, exp, sig] = parts;
  const want = Buffer.from(mac(`${uid}.${exp}`));
  const got = Buffer.from(sig);
  if (got.length !== want.length || !timingSafeEqual(got, want)) return null;
  return Number(exp) > Date.now() / 1000 ? uid : null;
}
