// Figma: N1 'divider' — 양쪽 1px 선 + 가운데 12px 문구 ("또는")
export function Divider({ label }: { label?: string }) {
  if (!label) return <hr className="w-full border-0 border-t border-line-subtle" />;
  return (
    <div className="flex w-full items-center gap-3 text-caption text-fg-muted" role="separator">
      <span className="h-px flex-1 bg-line-subtle" />
      {label}
      <span className="h-px flex-1 bg-line-subtle" />
    </div>
  );
}
