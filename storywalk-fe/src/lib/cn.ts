// 조건부 className 결합. 의존성을 늘리지 않으려고 clsx 대신 사용한다.
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
