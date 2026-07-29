export class ApiResponse<T> {
  public readonly success: boolean;

  constructor(
    public readonly statusCode: number,
    public readonly data: T,
    public readonly message = 'Success',
    public readonly meta?: Record<string, unknown>,
  ) {
    this.success = statusCode < 400;
  }
}
