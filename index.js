"use strict";

const url = require("url");
const http = require("http");
const https = require("https");
const neat_http = require("neat-http");

const newAgent = protocol => {
  return new (protocol === "https:" ? https : http).Agent({
    keepAlive: true,
    keepAliveMsecs: 10 * 1000,
    maxSockets: 2000,
    maxFreeSockets: 256
  });
};

// protocol, auth, host, port getFrom `target`
const parseTarget = target => {
  const { protocol, auth, hostname, port } = url.parse(target);
  return {
    protocol,
    auth,
    host: hostname,
    port
  };
};

// path default use ctx.req.url
module.exports = function proxy(options = {}, ext = {}) {
  if (typeof options === "string") {
    options = parseTarget(options);
  }
  const {
    // send ext
    rr,
    timeout,
    // proxy handle
    preCtx,
    postRes,
    dealTimeout,
    // client
    client
  } = ext;
  if (!client) {
    if (!options.host && (!rr || !rr[0] || !rr[0].host))
      throw new Error("Target/rr Must Have a host!");
    if (!options.agent) options.agent = newAgent(options.protocol);
  }
  const cs = client || {
    send: neat_http.createRequest(options, {
      rr,
      timeout
    })
  };

  return async (ctx, next) => {
    try {
      if (preCtx) preCtx(ctx);
      const opts = {
        path: ctx.req.url,
        method: ctx.method,
        headers: options.headers
          ? Object.assign(ctx.headers, ctx.headers)
          : ctx.headers
      };
      const cres = await cs.send(opts, {
        req: ctx.req
      });
      if (postRes) postRes(cres);
      ctx.res.writeHead(cres.statusCode, cres.headers);
      // undefined == null, is true
      ctx.body = cres;
      return;
    } catch (err) {
      if (err.message === "request-timeout") {
        if (dealTimeout) return dealTimeout(ctx, next);
        err.message = "proxy-timeout";
      }
      ctx.throw(err.message);
    }
  };
};
