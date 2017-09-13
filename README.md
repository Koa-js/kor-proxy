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