import { describe, expect, it } from "vitest";
import {
  isLikelyVapidPublicKey,
  sanitizePublicEnvValue,
} from "@/lib/env/sanitize-public-env";

describe("sanitizePublicEnvValue", () => {
  it("strips inline hash comments copied from .env lines", () => {
    expect(
      sanitizePublicEnvValue(
        "BPNQLB1669f7_key   # Firebase Console → Web Push certs",
      ),
    ).toBe("BPNQLB1669f7_key");
  });

  it("trims wrapping quotes", () => {
    expect(sanitizePublicEnvValue('"abc123"')).toBe("abc123");
  });
});

describe("isLikelyVapidPublicKey", () => {
  it("accepts url-safe base64 public keys", () => {
    expect(
      isLikelyVapidPublicKey(
        "BPNQLB1669f7_VduxL3BCgJdCY4UGCk4Dn8behkg0BC_4pezORVxIxobkBLhZrTu_3BZNJLM_-zwp16f4aima4M",
      ),
    ).toBe(true);
  });

  it("rejects values with spaces or hash comments", () => {
    expect(isLikelyVapidPublicKey("abc # comment")).toBe(false);
  });
});
