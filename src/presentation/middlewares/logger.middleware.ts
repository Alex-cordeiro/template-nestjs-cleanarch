import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { IncomingMessage, ServerResponse } from 'node:http';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: IncomingMessage, res: ServerResponse, next: () => void) {
    const { method, url } = req;

    res.on('finish', () => {
      const contentLength = String(res.getHeader('content-length') ?? '-');
      this.logger.log(`${method} ${url} ${res.statusCode} ${contentLength}`);
    });

    next();
  }
}
