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

const opts = {
  host: 'x.x.x.x',
  // port: 8080,
  // agent,
};
proxyConfig = {
  dealHeader() {
    // selected, deal req.headers before proxy;
  },
  dealTimeout() {
    // if none, will throw ('proxy-timeout');
  },
}
app.get('/proxy', proxy());
```