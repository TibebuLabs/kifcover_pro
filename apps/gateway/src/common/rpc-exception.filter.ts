import { Catch, ExceptionFilter, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response, Request } from 'express';

@Catch()
export class GatewayExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('Gateway');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    // TCP connection failure — microservice is unreachable
    if ((exception as any)?.constructor?.name === 'AggregateError' || (exception as any)?.code === 'ECONNREFUSED') {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = 'Service temporarily unavailable. Please try again later.';
      this.logger.error(`${req.method} ${req.url} → 503 (service unreachable)`, String(exception));
      return res.status(status).json({ statusCode: status, message, path: req.url, timestamp: new Date().toISOString() });
    }

    if (exception instanceof RpcException) {
      const err = exception.getError() as any;
      status = err?.statusCode || HttpStatus.BAD_REQUEST;
      message = err?.message || 'Service error';
    } else if ((exception as any)?.status) {
      status = (exception as any).status;
      const resp = (exception as any).response;
      message = typeof resp === 'object' ? resp.message : (exception as any).message;
    }

    if (status >= 500) {
      this.logger.error(`${req.method} ${req.url} → ${status}`, String(exception));
    }

    res.status(status).json({
      statusCode: status,
      message,
      path: req.url,
      timestamp: new Date().toISOString(),
    });
  }
}
