# Express Cloudflare Ip

### Middleware to get client ip for connections through cloudflare reverse proxy.

[![NPM version](https://badge.fury.io/js/%40ozanbaskan%2Fexpress-cloudflare-ip.svg)](https://www.npmjs.com/package/@ozanbaskan/express-cloudflare-ip)


#### Usage

```javascript

import express from 'express';
import { expressCloudflareIp } from 'express-cloudflare-ip';

const app = express();
app.use(expressCloudflareIp());

app.use((req, res) => {
    console.log(req.cloudflareIp);
});

```
