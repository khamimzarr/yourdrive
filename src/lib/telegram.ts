import { TelegramClient, Api } from "teleproto";
import { StringSession } from "teleproto/sessions";
import { PromisedWebSockets } from "teleproto/extensions";

const SESSION_KEY = "yourdrive_session";
let client: TelegramClient | null = null;

const apiId = parseInt(process.env.NEXT_PUBLIC_TELEGRAM_API_ID || "0", 10);
const apiHash = process.env.NEXT_PUBLIC_TELEGRAM_API_HASH || "";

class LocalStorageSession extends StringSession {
  private key: string;
  constructor(key: string) {
    let saved = "";
    if (typeof window !== "undefined") {
      saved = localStorage.getItem(key) || "";
    }
    super(saved);
    this.key = key;
  }

  setAuthKey(authKey?: any, dcId?: number) {
    super.setAuthKey(authKey, dcId);
    if (typeof window !== "undefined") {
      localStorage.setItem(this.key, this.save());
    }
  }

  setDC(dcId: number, serverAddress: string, port: number) {
    super.setDC(dcId, serverAddress, port);
    if (typeof window !== "undefined") {
      localStorage.setItem(this.key, this.save());
    }
  }
}

export async function getClient(): Promise<TelegramClient> {
  if (client) {
    if (!client.connected) {
      await client.connect();
    }
    return client;
  }

  const session = new LocalStorageSession(SESSION_KEY);

  client = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 5,
    ...(typeof window !== "undefined" ? { networkSocket: PromisedWebSockets } : {}),
  });

  await client.connect();
  return client;
}

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(SESSION_KEY);
}

export function getSessionString(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(SESSION_KEY) || "";
}

export function saveSession(clientInstance: TelegramClient): void {
  if (typeof window !== "undefined") {
    const sessionString = clientInstance.session.save() as unknown as string;
    localStorage.setItem(SESSION_KEY, sessionString);
  }
}

export async function logout(): Promise<void> {
  const currentClient = await getClient();
  await currentClient.invoke(new Api.auth.LogOut());
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
  }
  client = null;
}
