import { NextResponse } from "next/server";
import { toPublicError } from "@/lib/errors";

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(error: unknown) {
  const pub = toPublicError(error);
  return NextResponse.json(
    { error: { message: pub.message, code: pub.code } },
    { status: pub.status },
  );
}
