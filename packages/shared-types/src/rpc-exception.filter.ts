import { Catch, ExceptionFilter, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Catch(HttpException)
export class MicroserviceExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const error = exception as any;
    const statusCode = error?.getStatus?.() ?? error?.status ?? error?.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR;
    const response = error?.getResponse?.();
    const message = typeof response === 'string' ? response : response?.message ?? error?.message ?? 'Service error';

    throw new RpcException({ statusCode, message });
  }
}
