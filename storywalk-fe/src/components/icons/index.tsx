import type { SVGProps } from "react";

// Figma ui_ref WF 컴포넌트에서 export한 아이콘.
// 상태별 색(활성/비활성)을 CSS로 바꾸도록 stroke만 currentColor로 바꿨다. 경로·크기는 원본 그대로다.
type IconProps = SVGProps<SVGSVGElement>;

export function BackIcon(props: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ImageIcon(props: IconProps) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden {...props}>
      <path
        d="M22.1667 5.83334H5.83333C4.54467 5.83334 3.5 6.878 3.5 8.16667V19.8333C3.5 21.122 4.54467 22.1667 5.83333 22.1667H22.1667C23.4553 22.1667 24.5 21.122 24.5 19.8333V8.16667C24.5 6.878 23.4553 5.83334 22.1667 5.83334Z"
        stroke="currentColor"
        strokeWidth="1.86667"
      />
      <path
        d="M10.5 13.5333C11.5309 13.5333 12.3666 12.6976 12.3666 11.6667C12.3666 10.6357 11.5309 9.8 10.5 9.8C9.46904 9.8 8.6333 10.6357 8.6333 11.6667C8.6333 12.6976 9.46904 13.5333 10.5 13.5333Z"
        stroke="currentColor"
        strokeWidth="1.86667"
      />
      <path d="M24.5 18.6667L18.6667 12.8333L9.33337 22.1667" stroke="currentColor" strokeWidth="1.86667" strokeLinejoin="round" />
    </svg>
  );
}

export function NowIcon(props: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden {...props}>
      <path
        d="M11 13.75C12.5188 13.75 13.75 12.5188 13.75 11C13.75 9.48122 12.5188 8.25 11 8.25C9.48122 8.25 8.25 9.48122 8.25 11C8.25 12.5188 9.48122 13.75 11 13.75Z"
        stroke="currentColor"
        strokeWidth="1.83333"
        strokeLinecap="round"
      />
      <path
        d="M10.9999 1.83334V4.58334M10.9999 17.4167V20.1667M1.83325 11H4.58325M17.4166 11H20.1666"
        stroke="currentColor"
        strokeWidth="1.83333"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MapIcon(props: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden {...props}>
      <path
        d="M8.25 3.66666L2.75 5.5V18.3333L8.25 16.5L13.75 18.3333L19.25 16.5V3.66666L13.75 5.5L8.25 3.66666Z"
        stroke="currentColor"
        strokeWidth="1.83333"
        strokeLinejoin="round"
      />
      <path d="M8.25 3.66666V16.5M13.75 5.5V18.3333" stroke="currentColor" strokeWidth="1.83333" strokeLinejoin="round" />
    </svg>
  );
}

export function LogIcon(props: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden {...props}>
      <path d="M7.79167 2.75H4.125C3.36561 2.75 2.75 3.36561 2.75 4.125V7.79167C2.75 8.55106 3.36561 9.16667 4.125 9.16667H7.79167C8.55106 9.16667 9.16667 8.55106 9.16667 7.79167V4.125C9.16667 3.36561 8.55106 2.75 7.79167 2.75Z" stroke="currentColor" strokeWidth="1.83333" />
      <path d="M17.8749 2.75H14.2083C13.4489 2.75 12.8333 3.36561 12.8333 4.125V7.79167C12.8333 8.55106 13.4489 9.16667 14.2083 9.16667H17.8749C18.6343 9.16667 19.2499 8.55106 19.2499 7.79167V4.125C19.2499 3.36561 18.6343 2.75 17.8749 2.75Z" stroke="currentColor" strokeWidth="1.83333" />
      <path d="M7.79167 12.8333H4.125C3.36561 12.8333 2.75 13.4489 2.75 14.2083V17.875C2.75 18.6344 3.36561 19.25 4.125 19.25H7.79167C8.55106 19.25 9.16667 18.6344 9.16667 17.875V14.2083C9.16667 13.4489 8.55106 12.8333 7.79167 12.8333Z" stroke="currentColor" strokeWidth="1.83333" />
      <path d="M17.8749 12.8333H14.2083C13.4489 12.8333 12.8333 13.4489 12.8333 14.2083V17.875C12.8333 18.6344 13.4489 19.25 14.2083 19.25H17.8749C18.6343 19.25 19.2499 18.6344 19.2499 17.875V14.2083C19.2499 13.4489 18.6343 12.8333 17.8749 12.8333Z" stroke="currentColor" strokeWidth="1.83333" />
    </svg>
  );
}
