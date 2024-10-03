import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class CaseConverterInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    if (request.body) {
      request.body = this.convertSnakeToCamel(request.body);
    }

    if (request.query) {
      request.query = this.convertSnakeToCamel(request.query);
    }

    return next.handle().pipe(map((data) => this.convertCamelToSnake(data)));
  }

  private convertSnakeToCamel(obj: any): any {
    if (obj instanceof Date) {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map((v) => this.convertSnakeToCamel(v));
    }
    if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj).reduce((result, key) => {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
          letter.toUpperCase(),
        );
        result[camelKey] = this.convertSnakeToCamel(obj[key]);
        return result;
      }, {});
    }
    return obj;
  }

  private convertCamelToSnake(obj: any): any {
    if (obj instanceof Date) {
      return obj.toISOString();
    }
    if (Array.isArray(obj)) {
      return obj.map((v) => this.convertCamelToSnake(v));
    }
    if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj).reduce((result, key) => {
        const snakeKey = key.replace(
          /[A-Z]/g,
          (letter) => `_${letter.toLowerCase()}`,
        );
        result[snakeKey] = this.convertCamelToSnake(obj[key]);
        return result;
      }, {});
    }
    return obj;
  }
}
