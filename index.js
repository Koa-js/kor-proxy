'use strict';

const url = require('url');
const http = require('http');
const https = require('https');
const request = require('neat-request');

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

// protocol, auth, host, port getFrom `target`
const parseTarget = (target) => {
  const {
    protocol,
    auth,
    hostname,
    port
  } = url.parse(target);
  return {
    protocol,
    auth,
    host: hostname,
    port
  };
}

// path default use ctx.req.url
module.exports = function proxy(options = {}, ext = {}) {
  if (typeof options === 'string') {
    options = parseTarget(options);
  }
  const {
    timeout,
    headerRewrite,
    dealTimeout,
  } = ext;
  const proHeader = processHeader(headerRewrite, options.headers);
  if (!options.host) throw new Error('Target Must Have a host!');
  if (!options.agent) options.agent = newAgent(options.protocol);

  return async(ctx, next) => {
    try {
      const opts = Object.assign(options, {
        path: ctx.req.url,
        method: ctx.method,
        headers: proHeader(ctx.headers),
      });
      const cres = await request(opts, {
        body: ctx.req,
        timeout,
      });
      ctx.res.writeHead(cres.statusCode, cres.headers);
      // undefined == null, is true
      ctx.body = cres;
      return;
    } catch (err) {
      if (err.message === 'request-timeout') {
        if (dealTimeout) return dealTimeout(ctx, next);
        err.message = 'proxy-timeout';
      }
      ctx.throw(err.message);
    }
  }
}