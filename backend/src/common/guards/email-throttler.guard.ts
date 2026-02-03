import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class EmailThrottlerGuard extends ThrottlerGuard {
  // eslint-disable-next-line @typescript-eslint/require-await
  protected async getTracker(req: Record<string, unknown>): Promise<string> {
    const email: unknown = (req as { body?: { email?: unknown } }).body?.email;

    if (typeof email === 'string') {
      return `email:${email.toLowerCase()}`;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return super.getTracker(req);
  }

  protected getRequestResponse(context: ExecutionContext) {
    const http = context.switchToHttp();

    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      req: http.getRequest(),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      res: http.getResponse(),
    };
  }
}
