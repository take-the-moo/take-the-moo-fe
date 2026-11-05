// 실행: node --test src/api/api.test.mjs (실서버·추가 테스트 의존성 불필요)
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, beforeEach, test } from "node:test";
import ts from "typescript";

// 설치된 TypeScript로 API 모듈만 임시 컴파일한다. 타입 검사는 프로젝트 tsc로 별도 수행한다.
const compiled = mkdtempSync(join(tmpdir(), "storywalk-api-test-"));
for (const file of readdirSync(new URL(".", import.meta.url)).filter((name) => name.endsWith(".ts"))) {
  const { outputText } = ts.transpileModule(readFileSync(new URL(file, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  writeFileSync(join(compiled, file.replace(/\.ts$/, ".js")), outputText);
}
const require = createRequire(import.meta.url);
const previousEnv = { base: process.env.NEXT_PUBLIC_API_BASE_URL, mock: process.env.NEXT_PUBLIC_USE_MOCK };
const originalFetch = globalThis.fetch;
const originalWindow = globalThis.window;
process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.test/";
process.env.NEXT_PUBLIC_USE_MOCK = "false";
const client = require(join(compiled, "client.js"));
const { authApi } = require(join(compiled, "auth.js"));
const { usersApi } = require(join(compiled, "users.js"));
const { nowApi } = require(join(compiled, "now.js"));
const { photosApi } = require(join(compiled, "photos.js"));
const { reviewsApi } = require(join(compiled, "reviews.js"));
const { postcardsApi } = require(join(compiled, "postcards.js"));
const { llmApi } = require(join(compiled, "llm.js"));

const calls = [];
let respond;
const success = (data) => Response.json({ resultType: "SUCCESS", httpStatusCode: 200, message: "성공", data });
beforeEach(() => {
  globalThis.window = {};
  client.setAccessToken(null);
  calls.length = 0;
  respond = () => success({ ok: true });
  globalThis.fetch = async (url, init) => { calls.push({ url, ...init }); return respond(); };
});
after(() => {
  globalThis.fetch = originalFetch;
  if (originalWindow === undefined) delete globalThis.window;
  else globalThis.window = originalWindow;
  for (const [key, value] of [["NEXT_PUBLIC_API_BASE_URL", previousEnv.base], ["NEXT_PUBLIC_USE_MOCK", previousEnv.mock]]) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  rmSync(compiled, { recursive: true, force: true });
});

test("auth requests omit stale tokens; following user requests use the supplied Bearer token", async () => {
  const body = { loginId: "demo_user", password: "example-password", name: "테스트", nationality: "VN", language: "VI" };
  const session = { accessToken: "test-token", expiresAt: "2026-12-07T06:00:00Z", user: { userId: body.loginId } };
  client.setAccessToken("stale-token");
  respond = () => success(session);
  const result = await authApi.signup(body);
  assert.deepEqual(result, session);
  assert.equal(calls[0].url, "https://api.example.test/api/auth/signup");
  assert.equal(calls[0].method, "POST");
  assert.equal(calls[0].headers.has("Authorization"), false);
  assert.deepEqual(JSON.parse(calls[0].body), body);
  await authApi.login({ loginId: body.loginId, password: body.password });
  await authApi.checkId(body.loginId);
  assert.equal(calls[1].headers.has("Authorization"), false);
  assert.equal(calls[2].headers.has("Authorization"), false);
  client.setAccessToken(result.accessToken);
  await usersApi.getMe();
  assert.equal(calls[3].headers.get("Authorization"), "Bearer test-token");
  await usersApi.updateMe({ language: "EN" });
  assert.equal(calls[4].method, "PATCH");
  assert.deepEqual(JSON.parse(calls[4].body), { language: "EN" });
  client.setAccessToken(null);
  await usersApi.getMe();
  assert.equal(calls[5].headers.has("Authorization"), false);
});

test("query values and user IDs are encoded, omitted values stay absent, requests can be aborted", async () => {
  const controller = new AbortController();
  await nowApi.get({ stationId: 12, weather: "RAINY", time: "15:00", userId: "a&b" }, controller.signal);
  const url = new URL(calls[0].url);
  assert.equal(url.searchParams.get("time"), "15:00");
  assert.equal(url.searchParams.get("userId"), "a&b");
  assert.equal(url.searchParams.has("lat"), false);
  assert.equal(calls[0].signal, controller.signal);
  await usersApi.getUser("a/b");
  assert.equal(calls[1].url, "https://api.example.test/api/users/a%2Fb");
  assert.equal(client.withQuery("/test", { zero: 0, flag: false, missing: undefined, empty: null }), "/test?zero=0&flag=false");
  assert.equal(client.getAssetUrl("/api/photos/demo"), "https://api.example.test/api/photos/demo");
  assert.equal(client.getAssetUrl("https://images.example.test/photo.jpg"), "https://images.example.test/photo.jpg");
});

test("photo upload uses multipart; reviews and postcards reference its ID in JSON", async () => {
  client.setAccessToken("test-token");
  const file = new File(["test image"], "photo.jpg", { type: "image/jpeg" });
  await photosApi.upload({ file, userId: "demo_user", placeId: 34 });
  assert.ok(calls[0].body instanceof FormData);
  assert.equal(calls[0].body.get("file").name, "photo.jpg");
  const uploadUrl = new URL(calls[0].url);
  assert.equal(uploadUrl.searchParams.get("userId"), "demo_user");
  assert.equal(uploadUrl.searchParams.get("placeId"), "34");
  assert.equal(calls[0].headers.has("Content-Type"), false);
  assert.equal(calls[0].headers.get("Authorization"), "Bearer test-token");
  await reviewsApi.create(34, { userId: "demo_user", content: "좋은 산책", photoId: "photo-1" });
  assert.equal(calls[1].headers.get("Content-Type"), "application/json");
  assert.deepEqual(JSON.parse(calls[1].body), { userId: "demo_user", content: "좋은 산책", photoId: "photo-1" });
  await postcardsApi.create({ userId: "demo_user", photoId: "photo-1", comment: "오늘의 발자취" });
  assert.equal(calls[2].url, "https://api.example.test/api/postcards");
  assert.equal(postcardsApi.getImageUrl("card-1", true), "https://api.example.test/api/postcards/card-1/image?download=true");
});

test("API failures preserve server status, code and message, including FAIL in a 200 response", async () => {
  for (const status of [200, 401, 403, 409, 422]) {
    respond = () => Response.json({ resultType: "FAIL", code: "TEST_FAILURE", message: "다시 시도해 주세요." }, { status });
    await assert.rejects(usersApi.getMe(), (error) => error instanceof client.ApiError && error.status === status
      && error.code === "TEST_FAILURE" && error.message === "다시 시도해 주세요.");
  }
  respond = () => new Response("upstream unavailable", { status: 502, statusText: "Bad Gateway" });
  await assert.rejects(usersApi.getMe(), (error) => error.status === 502 && error.code === "UNKNOWN");
  respond = () => Response.json({ resultType: "SUCCESS" });
  await assert.rejects(usersApi.getMe(), (error) => error.code === "INVALID_RESPONSE");
});

test("binary and SSE responses are read without JSON decoding; JSON errors still propagate", async () => {
  respond = () => new Response("image bytes", { headers: { "Content-Type": "image/jpeg" } });
  assert.equal(await (await postcardsApi.getImage("card-1")).text(), "image bytes");
  respond = () => new Response('event:token\ndata:{"text":"hi"}\n\n', { headers: { "Content-Type": "text/event-stream" } });
  const reader = (await llmApi.streamChat({ message: "hello" })).getReader();
  assert.match(new TextDecoder().decode((await reader.read()).value), /event:token/);
  await reader.cancel();
  respond = () => Response.json({ resultType: "FAIL", code: "POSTCARD_NOT_READY", message: "아직 만드는 중이에요." }, { status: 409 });
  await assert.rejects(postcardsApi.getImage("card-1"), (error) => error.code === "POSTCARD_NOT_READY");
  respond = () => Response.json({ resultType: "FAIL", code: "LLM_PROMPT_NOT_FOUND", message: "없는 프롬프트" }, { status: 400 });
  await assert.rejects(llmApi.streamChat({ message: "hello" }), (error) => error.code === "LLM_PROMPT_NOT_FOUND");
});

test("server-side calls cannot set shared browser credentials", () => {
  delete globalThis.window;
  assert.throws(() => client.setAccessToken("test-token"), /브라우저/);
});
