"use client";

import { useQuery } from "@tanstack/react-query";
import { toBlob } from "html-to-image";
import { motion, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import { visitsApi } from "@/api/visits";
import { Button, ImagePlaceholder, Screen, ScreenBody, ScreenFooter, SectionTitle, TextArea, TopBar } from "@/components/ui";
import { usePlaces } from "@/hooks/usePlaces";
import { t as translate, useLang, useT, type MsgKey } from "@/i18n";
import { monthDay } from "@/lib/format";
import { journeyMoments, journeyPeriod, type Moment } from "@/lib/journey";
import { placeImage } from "@/lib/placeImage";
import { saveImage } from "@/platform/share";
import { useUserStore } from "@/store/user";

// 11 나의 발자취 · F8 — Figma 9:1206
// 전용 API가 없어 GET /users/{id}/visits로 기간·도장·완주 코스·순간들을 만든다.
// 한걸음 수와 마지막 한 줄은 서버가 작성자를 내보내지 않아 이 기기의 기록으로 보여준다.
// shortcut: 이야기는 AI 생성이 아니라 고정 문장이다. 서버에 생성 API가 생기면 바꾼다.
const NOTE_MAX = 40;
// 보드 위 카드·핀의 위치 (Figma 321×350 기준). 순간이 더 많으면 보드를 아래로 이어 붙인다.
const BOARD_SIZE = 4;
const CARDS = [
  { left: 0, top: 3, rotate: "3.73deg" },
  { left: 165, top: 21, rotate: "-4.67deg" },
  { left: 0, top: 182, rotate: "4.36deg" },
  { left: 165, top: 210, rotate: "0deg" },
];
const PINS = [
  [78, 0],
  [233, 20],
  [78, 181],
  [233, 207],
];
const MOMENT_STEP = 0.25; // 카드가 한 장씩 나오는 간격(초)
const seoulToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());

function momentLabel(m: Moment, t: ReturnType<typeof useT>) {
  if (m.kind === "note") return `“${m.text}”`;
  if (m.kind === "course") return t("{course} 완주", { course: m.text ?? "" });
  if (m.kind === "step") return t("첫 한걸음 · {place}", { place: t(m.name as MsgKey) });
  const place = t(m.name as MsgKey);
  return m.kind === "stamp" ? t("첫 도장 · {place}", { place }) : place;
}

export default function JourneyPage() {
  const t = useT();
  const lang = useLang();
  const places = usePlaces();
  const userId = useUserStore((s) => s.userId);
  const name = useUserStore((s) => s.name);
  const footsteps = useUserStore((s) => s.footsteps);
  const note = useUserStore((s) => s.journeyNote);
  const setNote = useUserStore((s) => s.setJourneyNote);
  const history = useQuery({
    queryKey: ["visits", userId],
    queryFn: ({ signal }) => visitsApi.getHistory(userId!, signal),
    enabled: Boolean(userId),
  });
  const board = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<string | null>(null); // null이면 입력창을 닫은 상태
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [revealed, setRevealed] = useState(false); // 한 번 저장하면 카드를 다 펼친 채로 둔다

  const data = history.data;
  const period = data ? journeyPeriod(data.days) : null;
  const moments = data ? journeyMoments(data, footsteps, note) : [];
  const image = (placeName: string) => placeImage(placeName, places.data?.find((p) => p.name === placeName)?.imageUrl);
  const story = (language: string | null) =>
    translate(language, "학교와 집만 알던 날부터, 서대문의 {count}곳을 걸었어요.", { count: data?.stampCount ?? 0 });

  const save = async () => {
    if (!board.current) return;
    setSaving(true);
    setSaveFailed(false);
    try {
      setRevealed(true);
      await new Promise((resolve) => setTimeout(resolve, 100)); // 스크롤 전이라 숨어 있거나 나오는 중인 카드까지 펼쳐진 뒤 찍는다
      // shortcut: 글꼴을 넣지 않아 저장 이미지는 기기 기본 글꼴이다. 10MB 가변 글꼴을 인라인하지 않으려는 선택으로, 서브셋 글꼴이 생기면 바꾼다.
      const blob = await toBlob(board.current, { backgroundColor: "#ffffff", pixelRatio: 2, skipFonts: true });
      if (!blob) throw new Error("이미지를 만들지 못했어요");
      await saveImage(blob, "footnote-journey.png", t("나의 발자취"));
    } catch {
      setSaveFailed(true);
    } finally {
      setSaving(false);
    }
  };

  const stats: [string, MsgKey][] = data
    ? [
        [t("{count}곳", { count: data.stampCount }), "방문 도장"],
        [t("{count}개", { count: data.completedCourseCount }), "완주 코스"],
        [t("{count}개", { count: footsteps.length }), "남긴 한걸음"],
      ]
    : [];

  return (
    <Screen>
      <TopBar title={t("나의 발자취")} />
      <ScreenBody className="p-0!">
        {/* 저장 이미지에 여백이 들어가도록 캡처 영역 안에 좌우 여백을 둔다 */}
        <div ref={board} className="flex flex-col gap-6 bg-surface px-6 py-2">
          <header className="flex flex-col gap-1.5">
            <h2 className="text-heading font-bold text-fg">
              {t("서대문에서 보낸 {period}", {
                period: period ? (period.months > 0 ? t("{count}개월", { count: period.months }) : t("{count}일", { count: period.days })) : "",
              })}
            </h2>
            <p className="flex items-center gap-1.5 text-body font-medium text-fg-muted">
              {period && (
                <>
                  {period.range}
                  <span aria-hidden className="h-[15px] w-px bg-fg-muted" />
                </>
              )}
              {t("{name}의 발자취", { name: name ?? "" })}
            </p>
          </header>

          {history.isError && <p className="text-body text-fg-muted">{t("불러오지 못했어요. 잠시 후 다시 시도해 주세요.")}</p>}

          {data && (
            <>
              <ul className="flex gap-2">
                {stats.map(([value, label]) => (
                  <li key={label} className="flex flex-1 flex-col items-center gap-1.5 rounded-control bg-primary px-2 py-2.5">
                    <span className="text-headline font-bold text-point">{value}</span>
                    <span className="text-caption font-medium text-white">{t(label)}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-3 rounded-control border border-fg-sub p-4">
                <p className="text-caption font-bold text-fg-sub">{t("나의 이야기")}</p>
                <div className="flex flex-col gap-2 font-medium">
                  {lang !== "ko" && <p className="text-body leading-[1.45] text-fg">{story(lang)}</p>}
                  <p className="text-caption leading-[1.5] text-fg-muted">
                    {story(null)}
                    <br />
                    {translate(null, "이 동네는 이제 당신의 이야기가 되었어요.")}
                  </p>
                </div>
              </div>

              <section className="flex flex-col gap-5">
                <SectionTitle>{t("내가 남긴 순간들")}</SectionTitle>
                {moments.length === 0 ? (
                  <p className="text-body text-fg-muted">{t("아직 남긴 순간이 없어요")}</p>
                ) : (
                  <div className="flex flex-col gap-5">
                    {Array.from({ length: Math.ceil(moments.length / BOARD_SIZE) }, (_, i) => (
                      <MomentBoard key={`${i}-${revealed}`} moments={moments.slice(i * BOARD_SIZE, (i + 1) * BOARD_SIZE)} image={image} lang={lang} revealed={revealed} connected={(i + 1) * BOARD_SIZE < moments.length} />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </ScreenBody>

      <ScreenFooter>
        {saveFailed && (
          <p role="alert" className="text-caption text-fg">
            {t("이미지를 저장하지 못했어요. 다시 시도해 주세요.")}
          </p>
        )}
        {draft === null ? (
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" disabled={moments.length === 0} onClick={() => setDraft(note?.text ?? "")}>
              {t("한 줄 남기기")}
            </Button>
            <Button className="flex-1" disabled={moments.length === 0 || saving} onClick={save}>
              {saving ? t("준비하는 중…") : t("이미지 저장")}
            </Button>
          </div>
        ) : (
          <>
            <TextArea
              rows={2}
              maxLength={NOTE_MAX}
              autoFocus
              aria-label={t("한 줄 남기기")}
              placeholder={t("이 여정을 한 줄로 남겨보세요")}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <Button
              disabled={!draft.trim()}
              onClick={() => {
                setNote({ text: draft.trim(), date: seoulToday() });
                setDraft(null);
              }}
            >
              {t("저장")}
            </Button>
          </>
        )}
      </ScreenFooter>
    </Screen>
  );
}

// 사진 카드 4장을 실로 이은 보드. 순간이 적으면 있는 카드까지만 잇는다.
// 카드는 화면에 들어올 때 핀과 함께 한 장씩 나오고, 실은 이어지는 카드가 나온 뒤에 나타난다.
// revealed는 이미지 저장용이다. 진행 중인 애니메이션은 끊기지 않아서 key를 바꿔 다시 그릴 때 처음부터 다 펼친 상태로 그린다.
// CSS 애니메이션 대신 motion을 쓴다: 저장 이미지(html-to-image)가 복제한 CSS 애니메이션은 첫 프레임(투명)으로 찍힌다.
function MomentBoard({
  moments,
  image,
  lang,
  revealed,
  connected,
}: {
  moments: Moment[];
  image: (name: string) => string | null;
  lang: string | null;
  revealed: boolean;
  connected: boolean;
}) {
  const t = useT();
  const count = moments.length;
  const reduced = useReducedMotion();
  const appear = (step: number, from?: { y: number; scale: number }) => ({
    initial: reduced || revealed ? false : { opacity: 0, ...from },
    whileInView: { opacity: 1, y: 0, scale: 1 },
    viewport: { once: true, amount: 0.2 },
    transition: { delay: step * MOMENT_STEP, duration: 0.35 },
  });

  return (
    <div className="relative mx-auto h-[350px] w-[321px]">
      {count >= 3 && <motion.img {...appear(2)} src="/images/journey/string-back.svg" alt="" className="absolute top-[28px] left-[82px]" />}
      {/* 다음 보드로 넘어가는 실: 마지막 핀에서 다음 보드의 첫 핀까지. 2번→3번 카드 실과 간격이 같아 그대로 쓴다 */}
      {connected && <motion.img {...appear(4)} src="/images/journey/string-back.svg" alt="" className="absolute top-[215px] left-[82px]" />}
      {moments.map((m, i) => (
        <motion.article
          {...appear(i, { y: 14, scale: 0.94 })}
          key={`${m.kind}-${m.date}-${m.name}`}
          style={CARDS[i]}
          className="absolute flex w-[146px] flex-col gap-2.5 rounded-control border border-line bg-surface px-2 pt-2 pb-2.5"
        >
          <ImagePlaceholder src={image(m.name)} label={t(m.name as MsgKey)} className="h-[78px]" />
          <div className="flex flex-col gap-1.5 font-medium">
            <p className="text-caption text-fg">{monthDay(m.date, lang)}</p>
            <p className="truncate text-micro text-fg-muted">{momentLabel(m, t)}</p>
          </div>
        </motion.article>
      ))}
      {count >= 2 && <motion.img {...appear(1)} src="/images/journey/string-top.svg" alt="" style={{ rotate: "3.69deg" }} className="absolute top-[10px] left-[82px]" />}
      {count >= 4 && <motion.img {...appear(3)} src="/images/journey/string-bottom.svg" alt="" style={{ rotate: "7.77deg" }} className="absolute top-[196px] left-[80px]" />}
      {PINS.slice(0, count).map(([left, top], i) => (
        <motion.span {...appear(i)} key={left + top} aria-hidden style={{ left, top }} className="absolute size-2.5 rounded-full bg-primary" />
      ))}
    </div>
  );
}
