import { useUserHydrated, useUserStore } from "@/store/user";
import { messages, type MsgKey } from "./messages";

export type { MsgKey };
export type Lang = "ko" | "vi" | "zh" | "mn" | "en" | "ja";

const LANGS: readonly string[] = ["ko", "vi", "zh", "mn", "en", "ja"] satisfies Lang[];
type Vars = Record<string, string | number>;

// 키가 한국어 원문이라 ko와 사전에 없는 값은 키를 그대로 보여준다.
export function t(lang: string | null, key: MsgKey, vars?: Vars): string {
  const text: string = messages[key]?.[lang as Exclude<Lang, "ko">] ?? key;
  return text.replace(/\{(\w+)\}/g, (match, name: string) => String(vars?.[name] ?? match));
}

// 복원 전에는 서버 HTML과 맞추려고 null(한국어)을 준다. 언어를 고르기 전에는 기기 언어를 쓴다.
export function useLang(): string | null {
  const hydrated = useUserHydrated();
  const language = useUserStore((s) => s.language);
  if (!hydrated) return null;
  if (language) return language;
  const device = navigator.language.slice(0, 2);
  return LANGS.includes(device) ? device : "en";
}

// lang을 주면 저장된 언어 대신 그 언어로 보여준다 (처음 설정에서 고르는 중인 언어).
export function useT(lang?: string) {
  const current = useLang();
  return (key: MsgKey, vars?: Vars) => t(lang ?? current, key, vars);
}
