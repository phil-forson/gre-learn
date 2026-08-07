import { z } from "zod";

const envSchema = z.object({
  DATA_DRIVER: z.enum(["local", "firebase"]).default("local"),
  AI_PROVIDER: z.enum(["mock", "openai"]).default("mock"),
  AI_API_KEY: z.string().optional(),
  AI_MODEL: z.string().default("gpt-4o"),
  TTS_PROVIDER: z.enum(["mock", "openai"]).default("mock"),
  TTS_API_KEY: z.string().optional(),
  TTS_VOICE: z.string().default("alloy"),
  AUDIO_STORAGE_DRIVER: z.enum(["local", "firebase"]).default("local"),
  AUDIO_STORAGE_PATH: z.string().default("./public/audio/generated"),
  DEFAULT_USER_ID: z.string().default("default-user"),
  FIREBASE_ADMIN_PROJECT_ID: z.string().optional(),
  FIREBASE_ADMIN_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_ADMIN_PRIVATE_KEY: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

let cached: AppEnv | null = null;

export function getEnv(): AppEnv {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration: ${message}`);
  }
  cached = parsed.data;
  return cached;
}

export function requireAiKey(): string {
  const env = getEnv();
  if (env.AI_PROVIDER === "openai" && !env.AI_API_KEY) {
    throw new Error(
      "AI_PROVIDER=openai requires AI_API_KEY. Set it in .env.local or use AI_PROVIDER=mock.",
    );
  }
  return env.AI_API_KEY ?? "";
}

export function requireTtsKey(): string {
  const env = getEnv();
  if (env.TTS_PROVIDER === "openai" && !env.TTS_API_KEY && !env.AI_API_KEY) {
    throw new Error(
      "TTS_PROVIDER=openai requires TTS_API_KEY (or AI_API_KEY). Or use TTS_PROVIDER=mock.",
    );
  }
  return env.TTS_API_KEY || env.AI_API_KEY || "";
}

export function getProviderStatus() {
  const env = getEnv();
  return {
    dataDriver: env.DATA_DRIVER,
    aiProvider: env.AI_PROVIDER,
    aiConfigured:
      env.AI_PROVIDER === "mock" || Boolean(env.AI_API_KEY),
    ttsProvider: env.TTS_PROVIDER,
    ttsConfigured:
      env.TTS_PROVIDER === "mock" ||
      Boolean(env.TTS_API_KEY || env.AI_API_KEY),
    ttsVoice: env.TTS_VOICE,
    audioStorageDriver: env.AUDIO_STORAGE_DRIVER,
    firebaseConfigured: Boolean(
      env.FIREBASE_ADMIN_PROJECT_ID &&
        env.FIREBASE_ADMIN_CLIENT_EMAIL &&
        env.FIREBASE_ADMIN_PRIVATE_KEY,
    ),
  };
}
