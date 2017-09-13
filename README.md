# kor-proxy
promise proxy middleware for koa

### Install
```shell
npm install kor-proxy
```

### Hello Kor-proxy
```js
const Koa = require('neat-kor'); // router wrap for Koa
const proxy = require('kor-proxy');
const app = new Koa();

const opts = {}; // the same as http(s).request 's options parameter
const ext = {
  dealHeader() {
    // selected, deal req.headers before proxy;
  },
  dealTimeout() {
    // if none, will throw ('proxy-timeout');
  },
}

app.get('/proxy', proxy('https://auth:pwd@test.url.com:8080', opts, ext));
```

## API

### proxy([target] [, opts] [, ext])

- `target` (str) - The absolute url path for proxy target, Eg: `http(s)://auth:pwd@www.proxy.com:8080`.It's used for getting `protocol, auth, host, port` properties, can also be defined explicitly in `options`.
- `opts` (obj) - additional options will pass to http(s).request's `options` parameters. Eg: `agent, headers..`
- `ext` (obj) - extension object.
- `ext.timeout` (num) - timeout(ms) between proxy request send and recieve response.
- `ext.dealHeader` (fn) - : deal headers before proxy.
- `ext.dealTimeout` (fn) - : deal timeout error when proxy, if none will `ctx.throw('proxy-timeout')`.

### Error Handle
- When catch Errors, will throw through `ctx.throw(error.message)`, should deal in your koa app.