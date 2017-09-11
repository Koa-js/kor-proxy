'use strict';

const Promise = require('bluebird');
const send = require('neat-send');

const processHeader = (func, add) => (inHeader) => {
  if (add) Object.assign(inHeader, add);
  if (func) return func(inHeader);
  return inHeader;
}

const newAgent = () => (new http.Agent({
  keepAlive: true,
  keepAliveMsecs: 10 * 1000,
  maxSockets: 2000,
  maxFreeSockets: 256,
}));

// config: https
module.exports = function proxy(target, {
  https,
  dealHeader,
  dealTimeout,
}) {
  const proHeader = processHeader(dealHeader, target.headers);
  if (!target.host) throw new Error('Target Must Have a host!')
  if (!target.agent) target.agent = newAgent();
  if (!target.port) target.port = https ? 443 : 80;
  return async(ctx, next) => {
    try {
      const opts = Object.assign({
        path: ctx.req.url,
        method: ctx.method,
        headers: proHeader(ctx.headers),
      }, target);
      const cres = await send(opts, {
        body: ctx.req,
      })
      ctx.res.writeHead(cres.statusCode, cres.headers);
      // undefined == null, is true
      ctx.body = cres;
      return;
    } catch (err) {
      if (err.message === 'request-timeout' && dealTimeout) {
        return dealTimeout(ctx, next);
      }
      ctx.throw('proxy-timeout');
    }
  }
}