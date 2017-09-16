# kor-proxy
promise proxy middleware for koa

### Install
```shell
npm install kor-proxy
```

### Aim
This middleware is supported do two things:
1. Set Proxy Server Four options: (host [, protocol] [, auth] [, port])
2. Rewrite the proxy request Header
Match request will respond automatical internally use `Stream.pipe`.

### Hello Kor-proxy
```js
const Koa = require('neat-kor'); // router wrap for Koa
const proxy = require('kor-proxy');
const app = new Koa();

const ext = {
  timeout: 1000,
  headerRewrite() {
    // selected, deal req.headers before proxy;
  },
  dealTimeout() {
    // if none, will throw ('proxy-timeout');
  },
}

app.get('/proxy1', proxy('https://auth:pwd@test.url.com:8080', ext));

// the same as http(s).request 's options parameter
const options = {
  protocol: 'https', // defalut is http:
  auth: 'auth:pwd', // default is null
  host: 'test.url.com', // must pass!
  port: '8088', // defalut is 80(443)
};
app.get('/proxy2', proxy(options, ext));
```

## API

### proxy(options [, ext])
- `options`(str | obj) - The absolute url path for proxy target, Eg: `http(s)://auth:pwd@www.proxy.com:8080`.It's used for getting `protocol, auth, host, port` properties, can also be defined explicitly in `options`.
- `opts` (obj) - additional options will pass to http(s).request's `options` parameters. Eg: `agent, headers..`
- `ext` (obj) - extension object.
- `ext.timeout` (num) - timeout(ms) between proxy request send and recieve response, defalut is 15s.
- `ext.headerRewrite` (fn) - : deal headers before proxy, recieve one param, the raw `message.headers`.
- `ext.dealTimeout` (fn) - : deal timeout error when proxy, if none will `ctx.throw('proxy-timeout')`.

### Error Handle
- When catch Errors, will throw through `ctx.throw(error.message)`, should deal in your koa app.