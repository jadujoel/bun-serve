#!/usr/bin/env bun

import { parse } from './parse'

const {
  directory = process.argv.slice(2)[0] ?? '.',
  port = 3000,
  hostname = "0.0.0.0",
  development = process.env.NODE_ENV !== 'production',
  lowMemoryMode = false,
  dhParamsFile,
  key,
  passphrase,
} = parse(process.argv.slice(2))

const finalPort = port === 'random' ? generateRandomPort() : String(port)

Bun.serve({
  port: finalPort,
  hostname: String(hostname),
  development: Boolean(development),
  lowMemoryMode: Boolean(lowMemoryMode),
  key: key === undefined ? undefined : String(key),
  cert: key === undefined ? undefined : String(key).replace(/\.key$/, '.crt'),
  dhParamsFile: dhParamsFile === undefined ? undefined : String(dhParamsFile),
  passphrase: passphrase === undefined ? undefined : String(passphrase),
  async fetch(req) {
    let fp = directory + new URL(req.url).pathname;
    if (fp.endsWith("/")) {
      fp += "index.html";
    }
    return new Response(Bun.file(fp));
  },
  error() {
    return new Response(null, { status: 404 });
  },
});
console.log(`Serving ${directory} at http://${hostname}:${finalPort}`)

function generateRandomPort() {
  return Math.floor(Math.random() * 10000) + 10000
}
