# kor-proxy
promise proxy middleware for koa, support **Load-Balance**

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
  rr: [options1, options2, ...] // every time merge one element to options
}

app.get('/proxy1', proxy('https://auth:pwd@test.url.com:8080', ext));

// the same as http(s).request 's options parameter
const options = {
  protocol: 'https', // defalut is http:
  auth: 'auth:pwd', // default is null
  host: 'test.url.com', // must pass!
  port: 8088, // defalut is 80(443)
};
app.get('/proxy2', proxy(options, ext));
```

### Load-Balance

```js
const Koa = require('neat-kor'); // router wrap for Koa
const proxy = require('kor-proxy');
const app = new Koa();

const rr = [{
    host: 'target.url.com1',
    port: 8000
  },
  {
    host: 'target.url.com2',
    port: 9000
  },
];

const ext = {
  timeout: 1000,
  headerRewrite() {
    // selected, deal req.headers before proxy;
  },
  dealTimeout() {
    // if none, will throw ('proxy-timeout');
  },
  rr// every time merge one element to options, except the same key.
}


// the same as http(s).request 's options parameter
const options = {
  port: 8088, // defalut is 80(443)
};
// Important: In this example, proxy server port will always be 8088, because options is prefer than rr's element.
app.get('/proxy2', proxy(options, ext));
```



## API

### proxy(options [, ext])
- `options`(str | obj) - Default is `{}`.The absolute url path for proxy target, Eg: `http(s)://auth:pwd@www.proxy.com:8080`.It's used for getting `protocol, auth, host, port` properties, can also be defined explicitly in `options`.(Prefer than `ext.rr`'s element.)Which will pass to http(s).request's `options` parameters. Eg: `agent, headers..`
- `ext` (obj) - Default is `{}`.extension object.
- `ext.rr` (Array) - : Default is `undefined`.Every element of arr will merge into `options`, in a round-robin manner. especially when need **Load-Balance**. (If `rr`'s element have same key with `options`, it will not merge into, please put common key in options, dynamic for **Load-Banlance** put in `rr` )
- `ext.timeout` (num) - Defalut is `15s`, timeout(ms) between proxy request send and recieve response.
- `ext.preCtx` (fn(ctx)) - : Default is `undefined`, normally used for prepare request before proxy to target, eg: `headerRewrite`, `pathRewite`.
- `ext.postCtx` (fn(ctx)) - : Default is `undefined`, normally used for post deal response before back.
- `ext.dealTimeout` (fn) - : Default is `undefined`, deal timeout error when proxy, if none will `ctx.throw('proxy-timeout')`.
- `ext.client` (fn) - : Default is `undefined`, Custom client, can created by `neat-http`, which `kor-proxy` is based.This method is set, `ext.rr` will be ignore(Because the client may be have `rr` configuration).


### Error Handle
- When catch Errors, will throw through `ctx.throw(error.message)`, should deal in your koa app.