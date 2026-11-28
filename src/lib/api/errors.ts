export interface ApiErrorOptions<TCode extends string = string> {
  message: string;
  code: TCode;
  status: number;
  cause?: unknown;
}

/**
 * Base typed error class for domain service layers.
 * Preserves instanceof checks across transpiled targets and optional cause chaining.
 */
export class ApiError<TCode extends string = string> extends Error {
  readonly code: TCode;
  readonly status: number;

  constructor(options: ApiErrorOptions<TCode>);
  constructor(message: string, code: TCode, status: number, cause?: unknown);
  constructor(
    messageOrOptions: string | ApiErrorOptions<TCode>,
    code?: TCode,
    status?: number,
    cause?: unknown
  ) {
    if (typeof messageOrOptions === 'string') {
      super(messageOrOptions, cause !== undefined ? { cause } : undefined);
      this.code = code as TCode;
      this.status = status as number;
    } else {
      super(
        messageOrOptions.message,
        messageOrOptions.cause !== undefined
          ? { cause: messageOrOptions.cause }
          : undefined
      );
      this.code = messageOrOptions.code;
      this.status = messageOrOptions.status;
    }

    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
