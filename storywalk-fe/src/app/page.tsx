"use client";

import { useState } from "react";
import { api } from "@/api/client";
import { getCurrentPosition } from "@/platform/location";
import { notifyNearby } from "@/platform/notify";

// 세팅 확인용 화면. 동작 확인 후 '지금' 화면으로 교체한다.
export default function Home() {
  const [log, setLog] = useState<string[]>([]);
  const push = (s: string) => setLog((l) => [s, ...l]);

  return (
    <div className="flex flex-col gap-3 p-4">
      <h1 className="text-xl font-bold">세팅 확인</h1>
      <button className="rounded-lg bg-black p-3 text-white" onClick={async () => {
        try { push(JSON.stringify(await api("/health"))); } catch (e) { push(`API 실패: ${e}`); }
      }}>API 호출</button>
      <button className="rounded-lg bg-black p-3 text-white" onClick={async () => {
        try { const p = await getCurrentPosition(); push(`위치: ${p.lat}, ${p.lng}`); } catch (e) { push(`위치 실패: ${e}`); }
      }}>현재 위치</button>
      <button className="rounded-lg bg-black p-3 text-white" onClick={async () => {
        await notifyNearby("dongnimmun", "독립문 근처에 있어요", "100년 전 이곳 이야기를 들어볼래요?");
        push("3초 뒤 알림 (앱을 홈으로 내려서 확인)");
      }}>근처 알림 테스트</button>
      <pre className="whitespace-pre-wrap rounded-lg bg-neutral-100 p-3 text-xs">{log.join("\n")}</pre>
    </div>
  );
}
