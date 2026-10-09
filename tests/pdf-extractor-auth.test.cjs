const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const root = path.join(__dirname, '..');
const fakeKey = 'test-only-pdf-extractor-key';
const source = (file) => fs.readFileSync(path.join(root, file), 'utf8');

function load(file, { env = {}, mocks = {}, logs = [] } = {}) {
  const compiled = ts.transpileModule(source(file), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
    reportDiagnostics: true,
  });
  assert.equal(compiled.diagnostics.length, 0);
  const module = { exports: {} };
  const context = {
    module, exports: module.exports, process: { env }, Buffer, Blob, FormData, Error,
    console: { log() {}, error(...args) { logs.push(args); } },
    setTimeout: (callback) => callback(),
    require(name) {
      if (Object.hasOwn(mocks, name)) return mocks[name];
      throw new Error(`Unexpected dependency: ${name}`);
    },
  };
  vm.runInNewContext(compiled.outputText, context, { filename: file });
  return module.exports;
}

function serverConfig(env) {
  return load('src/lib/config/pdfExtractor.server.ts', { env, mocks: { 'server-only': {} } });
}

test('server credential is required at request time and shared config contains no key', () => {
  assert.match(source('src/lib/config/pdfExtractor.server.ts'), /import 'server-only'/);
  for (const value of [undefined, '', '   ']) {
    const server = serverConfig({ PDF_EXTRACTOR_API_KEY: value });
    assert.throws(() => server.getPdfExtractorApiKey(), /PDF_EXTRACTOR_API_KEY is not configured/);
  }
  assert.equal(serverConfig({ PDF_EXTRACTOR_API_KEY: fakeKey }).getPdfExtractorApiKey(), fakeKey);
  const shared = load('src/lib/config/environment.ts', { env: { PDF_EXTRACTOR_API_KEY: fakeKey } });
  assert.equal(Object.hasOwn(shared.PDF_EXTRACTOR_CONFIG, 'API_KEY'), false);
  assert.equal(JSON.stringify(shared).includes(fakeKey), false);
});

test('PM2 only forwards the environment credential without an embedded fallback', () => {
  for (const value of [undefined, fakeKey]) {
    const module = { exports: {} };
    vm.runInNewContext(source('ecosystem.config.js'), { module, process: { env: { PDF_EXTRACTOR_API_KEY: value } } });
    assert.equal(module.exports.apps[0].env.PDF_EXTRACTOR_API_KEY, value);
  }
});

for (const [endpoint, method, verb] of [['status', 'GET', 'get'], ['extract-pdf', 'POST', 'post']]) {
  function setup(value, fail = false) {
    const calls = [], logs = [];
    const axios = {
      isAxiosError: (error) => error.isAxiosError === true,
      async [verb](...args) {
        calls.push(args);
        if (fail) {
          const error = new Error('Upstream unavailable');
          Object.assign(error, { isAxiosError: true, code: 'ECONNREFUSED', config: { headers: { Authorization: `Bearer ${fakeKey}` } } });
          throw error;
        }
        return { data: { success: true } };
      },
    };
    const route = load(`src/app/api/proxy/${endpoint}/route.ts`, {
      logs,
      mocks: {
        axios,
        'next/server': { NextResponse: { json: (data, options) => ({ data, ...options }) } },
        '@/lib/config/environment': load('src/lib/config/environment.ts'),
        '@/lib/config/pdfExtractor.server': serverConfig({ PDF_EXTRACTOR_API_KEY: value }),
      },
    });
    const form = new FormData();
    form.append('file', new Blob(['fake PDF'], { type: 'application/pdf' }), 'test.pdf');
    form.append('prompt', 'test prompt');
    form.append('use_ocr', 'true');
    return { route, calls, logs, request: { formData: async () => form } };
  }

  test(`${endpoint}: missing key fails before any upstream request`, async () => {
    const { route, calls, request } = setup(undefined);
    assert.equal((await route[method](request)).status, 500);
    assert.equal(calls.length, 0);
  });

  test(`${endpoint}: server sends Bearer with the configured key`, async () => {
    const { route, calls, request } = setup(fakeKey);
    const response = await route[method](request);
    assert.equal(response.status, 200);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].at(-1).headers.Authorization, `Bearer ${fakeKey}`);
    assert.equal(JSON.stringify(response).includes(fakeKey), false);
    if (verb === 'post') {
      assert.equal(calls[0][1].get('prompt'), 'test prompt');
      assert.equal(calls[0][1].get('use_ocr'), 'true');
      assert.equal(calls[0][1].get('file').name, 'test.pdf');
    }
  });

  test(`${endpoint}: retry errors do not log credential-bearing Axios objects`, async () => {
    const { route, calls, logs, request } = setup(fakeKey, true);
    assert.equal((await route[method](request)).status, 503);
    assert.equal(calls.length, 3);
    assert.equal(JSON.stringify(logs).includes(fakeKey), false);
  });
}

test('browser helper calls internal proxies without credentials and preserves form fields', async () => {
  const calls = [];
  const axios = {
    create: () => ({ post: async (...args) => { calls.push(args); return { data: {} }; } }),
    get: async (...args) => { calls.push(args); return { status: 200, data: {} }; },
    isAxiosError: () => false,
  };
  const client = load('src/lib/api/pdfExtractor.ts', {
    mocks: { axios, '@/lib/config/environment': load('src/lib/config/environment.ts') },
  });
  assert.equal((await client.extractPDF(new Blob(['fake PDF']), 'browser prompt', true)).success, true);
  assert.equal(calls[0].length, 2);
  assert.equal(calls[0][0], '/extract-pdf');
  assert.equal(calls[0][1].get('prompt'), 'browser prompt');
  assert.equal(calls[0][1].get('use_ocr'), 'true');
  assert.equal((await client.getApiStatus()).success, true);
  assert.equal(calls[1].length, 1);
  assert.equal(calls[1][0], '/api/proxy/status');
  assert.doesNotMatch(source('src/lib/api/pdfExtractor.ts'), /API_KEY|Authorization|pdfExtractor\.server/);
});
