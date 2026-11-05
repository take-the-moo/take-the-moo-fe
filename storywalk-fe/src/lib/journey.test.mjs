// 실행: node --test src/lib/journey.test.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";

const { outputText } = ts.transpileModule(readFileSync(new URL("journey.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});
const mod = { exports: {} };
new Function("exports", "module", outputText)(mod.exports, mod);
const { journeyMoments, journeyPeriod } = mod.exports;

const stamp = (placeId, name, firstVisitedDate) => ({ placeId, name, firstVisitedDate });
const stamps = [stamp(3, "영천시장", "2026-09-03"), stamp(2, "독립문", "2026-08-01"), stamp(1, "형무소", "2026-07-12")];
const course = (completed) => ({
  name: "독립 코스",
  completed,
  stops: stamps.map(({ placeId, name }) => ({ placeId, name, visited: completed })),
});

test("기간: 달이 바뀌면 개월 수, 해가 같으면 끝 연도를 뺀다", () => {
  assert.deepEqual(journeyPeriod([{ date: "2026-11-08" }, { date: "2026-07-06" }]), { months: 4, days: 126, range: "2026.7.6 ~ 11.8" });
});

test("기간: 연도가 바뀌면 끝 연도를 쓰고, 하루뿐이면 날짜 하나다", () => {
  assert.equal(journeyPeriod([{ date: "2026-12-30" }, { date: "2027-01-02" }]).range, "2026.12.30 ~ 2027.1.2");
  assert.deepEqual(journeyPeriod([{ date: "2026-07-06" }]), { months: 0, days: 1, range: "2026.7.6" });
  assert.equal(journeyPeriod([]), null);
});

test("순간: 도장이 없으면 빈 목록이다", () => {
  assert.deepEqual(journeyMoments({ stamps: [], courses: [] }, [], null), []);
});

test("순간: 첫 도장·첫 한걸음·완주·마지막 한 줄을 날짜순으로 고른다", () => {
  const moments = journeyMoments(
    { stamps, courses: [course(true)] },
    [{ name: "영천시장", date: "2026-08-20" }, { name: "독립문", date: "2026-10-01" }],
    { text: "오래 기억할게요.", date: "2026-11-08" },
  );
  assert.deepEqual(moments.map((m) => [m.kind, m.date]), [
    ["stamp", "2026-07-12"],
    ["step", "2026-08-20"],
    ["course", "2026-09-03"],
    ["note", "2026-11-08"],
  ]);
  assert.equal(moments[3].name, "영천시장"); // 한 줄의 사진은 가장 최근 도장의 장소
});

test("순간: 완주하지 않은 코스는 빼고 남는 칸은 최근 도장으로 채운다", () => {
  const moments = journeyMoments({ stamps, courses: [course(false)] }, [], null);
  assert.deepEqual(moments.map((m) => [m.kind, m.name]), [["stamp", "형무소"], ["visit", "독립문"], ["visit", "영천시장"]]);
});

test("순간: 칸 수를 넘지 않고 한 줄은 잘리지 않는다", () => {
  const many = Array.from({ length: 8 }, (_, i) => stamp(i, `곳${i}`, `2026-07-1${i}`));
  const moments = journeyMoments({ stamps: many, courses: [] }, [], { text: "끝", date: "2026-11-08" });
  assert.equal(moments.length, 4);
  assert.equal(moments.at(-1).kind, "note");
});
