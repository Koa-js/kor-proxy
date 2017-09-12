'use strict';

const url = require('url');
const http = require('http');
const https = require('https');
const send = require('neat-send');

const processHeader = (fn, add) => (inHeader) => {
  if (add) Object.assign(inHeader, add);
  if (fn) return fn(inHeader);
  return inHeader;
}

const newAgent = (protocol) => {
  return new(protocol === 'https:' ? https : http).Agent({
    keepAlive: true,
    keepAliveMsecs: 10 * 1000,
    maxSockets: 2000,
    maxFreeSockets: 256,
  });
}

// config: https
module.exports = function proxy(target, {
  dealHeader,
  dealTimeout,
}) {
  const proHeader = processHeader(dealHeader, target.headers);
  const options = {};
  if (typeof target === 'string') {
    Object.assign(options, url.parse(target));
    options.agent = newAgent(options.protocol);
  } else {
    if (!target.host) throw new Error('Target Must Have a host!');
    if (!target.agent) target.agent = newAgent(target.protocol);
    Object.assign(options, target);
  }
  target = null;

  return async(ctx, next) => {
    try {
      const opts = Object.assign({
        path: ctx.req.url,
        method: ctx.method,
        headers: proHeader(ctx.headers),
      }, options);
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