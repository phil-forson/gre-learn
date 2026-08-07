export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status = 400,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function toPublicError(error: unknown): {
  message: string;
  code: string;
  status: number;
} {
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      status: error.status,
    };
  }

  console.error("[app-error]", error);
  return {
    message: "Something went wrong. Please try again.",
    code: "INTERNAL_ERROR",
    status: 500,
  };
}
