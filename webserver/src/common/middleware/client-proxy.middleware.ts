import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import * as httpProxy from 'http-proxy';

@Injectable()
export class ClientProxyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: Function) {
    const excludeRegExp = /^\/(api|oauth)\/*/;
    if (excludeRegExp.test(req.path)) {
      next();
    } else {
      const proxy = httpProxy.createProxyServer({});
      proxy.web(req, res, {
        target: 'http://0.0.0.0:8080',
      });
    }
  }
}
