export class ApiException extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, message: string, code = "ERROR", details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(message: string, details?: unknown) {
    return new ApiException(400, message, "BAD_REQUEST", details);
  }

  static notFound(message: string) {
    return new ApiException(404, message, "NOT_FOUND");
  }

  static conflict(message: string) {
    return new ApiException(409, message, "CONFLICT");
  }

  static internal(message = "Internal server error", details?: unknown) {
    return new ApiException(500, message, "INTERNAL_ERROR", details);
  }
}
