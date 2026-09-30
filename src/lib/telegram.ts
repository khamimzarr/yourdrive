import { TelegramClient, Api } from "teleproto";
import { StringSession } from "teleproto/sessions";

const SESSION_KEY = "yourdrive_session";
let client: TelegramClient | null = null;

const apiId = parseInt(process.env.NEXT_PUBLIC_TELEGRAM_API_ID || "0", 10);
const apiHash = process.env.NEXT_PUBLIC_TELEGRAM_API_HASH || "";

export async function getClient(): Promise<TelegramClient> {
  if (client) {
    if (!client.connected) {
      await client.connect();
    }
    return client;
  }

  let sessionString = "";
  if (typeof window !== "undefined") {
    sessionString = localStorage.getItem(SESSION_KEY) || "";
  }
  const session = new StringSession(sessionString);

  client = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 5,
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
