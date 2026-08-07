import { promises as fs } from "fs";
import path from "path";
import { getEnv } from "@/lib/env";

export interface AudioStorage {
  save(key: string, bytes: Uint8Array, contentType: string): Promise<string>;
  getPublicUrl(key: string): string | null;
}

export class LocalAudioStorage implements AudioStorage {
  private root: string;

  constructor(root = getEnv().AUDIO_STORAGE_PATH) {
    this.root = path.isAbsolute(root) ? root : path.join(process.cwd(), root);
  }

  async save(key: string, bytes: Uint8Array, contentType: string): Promise<string> {
    void contentType;
    const filePath = path.join(this.root, key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, bytes);
    // Served from public/
    const publicRel = filePath.includes(`${path.sep}public${path.sep}`)
      ? filePath.split(`${path.sep}public${path.sep}`)[1]
      : `audio/generated/${key}`;
    return `/${publicRel.replace(/\\/g, "/")}`;
  }

  getPublicUrl(key: string): string | null {
    return `/audio/generated/${key}`;
  }
}

export class FirebaseAudioStorage implements AudioStorage {
  async save(key: string, bytes: Uint8Array, contentType: string): Promise<string> {
    const { getBucket } = await import("@/lib/db/firebase-admin");
    const bucket = getBucket();
    const file = bucket.file(`audio/${key}`);
    await file.save(Buffer.from(bytes), {
      contentType,
      metadata: { cacheControl: "public, max-age=31536000" },
    });
    await file.makePublic().catch(() => {
      // Bucket may block public ACL — signed URL fallback omitted for MVP
    });
    return `https://storage.googleapis.com/${bucket.name}/audio/${key}`;
  }

  getPublicUrl(key: string): string | null {
    void key;
    return null;
  }
}

export function getAudioStorage(): AudioStorage {
  const env = getEnv();
  if (env.AUDIO_STORAGE_DRIVER === "firebase") {
    return new FirebaseAudioStorage();
  }
  return new LocalAudioStorage();
}
