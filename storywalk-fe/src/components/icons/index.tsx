import type { SVGProps } from "react";

// Figma ui_final 컴포넌트에서 export한 아이콘.
// 상태별 색(활성/비활성)을 CSS로 바꾸도록 stroke만 currentColor로 바꿨다. 경로·크기는 원본 그대로다.
type IconProps = SVGProps<SVGSVGElement>;

export function BackIcon(props: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden {...props}>
      <path d="M14.25 18.5L5.75 10L14.25 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M18.1 12C18.1 15.3689 15.3689 18.1 12 18.1C8.63106 18.1 5.9 15.3689 5.9 12C5.9 8.63106 8.63106 5.9 12 5.9C15.3689 5.9 18.1 8.63106 18.1 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <path d="M12 1.5V5M12 19V22.5M1.5 12H5M19 12H22.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MapIcon(props: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path d="M15 5L9 3L3 5V19L9 17M9 3V17M9 17L15 19L21 17V3L15 5M15 5V19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LogIcon(props: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden {...props}>
      <rect x="4.4" y="4.4" width="5.2" height="5.2" rx="1.1" />
      <rect x="14.4" y="4.4" width="5.2" height="5.2" rx="1.1" />
      <rect x="4.4" y="14.4" width="5.2" height="5.2" rx="1.1" />
      <rect x="14.4" y="14.4" width="5.2" height="5.2" rx="1.1" />
    </svg>
  );
}

// 회색 원 위의 카메라 (03 사진으로 묻기)
export function CameraIcon(props: IconProps) {
  return (
    <svg width="38" height="38" viewBox="0 0 38 38" fill="none" aria-hidden {...props}>
      <path d="M38 19C38 29.4934 29.4934 38 19 38C8.50659 38 0 29.4934 0 19C0 8.50659 8.50659 0 19 0C29.4934 0 38 8.50659 38 19Z" fill="#F5F5F5" />
      <path d="M26.7407 13.4583H23.75L23.0375 11.4616C22.9883 11.3249 22.8981 11.2068 22.7792 11.1234C22.6603 11.04 22.5186 10.9952 22.3734 10.9954H15.6266C15.3297 10.9954 15.0637 11.1823 14.9647 11.4616L14.25 13.4583H11.2593C10.2873 13.4583 9.5 14.2456 9.5 15.2176V25.2454C9.5 26.2174 10.2873 27.0046 11.2593 27.0046H26.7407C27.7127 27.0046 28.5 26.2174 28.5 25.2454V15.2176C28.5 14.2456 27.7127 13.4583 26.7407 13.4583ZM26.9167 25.2454C26.9167 25.3421 26.8375 25.4213 26.7407 25.4213H11.2593C11.1625 25.4213 11.0833 25.3421 11.0833 25.2454V15.2176C11.0833 15.1208 11.1625 15.0417 11.2593 15.0417H15.3649L16.2446 12.5787H21.7532L22.6329 15.0417H26.7407C26.8375 15.0417 26.9167 15.1208 26.9167 15.2176V25.2454ZM19 16.4491C17.056 16.4491 15.4815 18.0236 15.4815 19.9676C15.4815 21.9116 17.056 23.4861 19 23.4861C20.944 23.4861 22.5185 21.9116 22.5185 19.9676C22.5185 18.0236 20.944 16.4491 19 16.4491ZM19 22.0787C17.8345 22.0787 16.8889 21.1331 16.8889 19.9676C16.8889 18.8021 17.8345 17.8565 19 17.8565C20.1655 17.8565 21.1111 18.8021 21.1111 19.9676C21.1111 21.1331 20.1655 22.0787 19 22.0787Z" fill="#3D3D3D" />
    </svg>
  );
}

export function ChevronIcon(props: IconProps) {
  return (
    <svg width="9" height="16" viewBox="0 0 9.02886 16" fill="none" aria-hidden {...props}>
      <path d="M1 15L8.02886 8L1 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowUpRightIcon(props: IconProps) {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" aria-hidden {...props}>
      <path d="M1.43031 17C1.80939 16.9997 2.17283 16.8489 2.44068 16.5806L14.143 4.87732V12.7862C14.143 13.1651 14.2935 13.5285 14.5614 13.7964C14.8293 14.0643 15.1926 14.2148 15.5715 14.2148C15.9504 14.2148 16.3137 14.0643 16.5816 13.7964C16.8495 13.5285 17 13.1651 17 12.7862V1.42862C17 1.04973 16.8495 0.686355 16.5816 0.418436C16.3137 0.150516 15.9504 0 15.5715 0H4.21488C3.83601 0 3.47268 0.150516 3.20478 0.418436C2.93689 0.686355 2.78638 1.04973 2.78638 1.42862C2.78638 1.80752 2.93689 2.17089 3.20478 2.43881C3.47268 2.70673 3.83601 2.85725 4.21488 2.85725H12.1231L0.41792 14.5605C0.150064 14.8288 -0.000267183 15.1925 3.56488e-07 15.5716C0.000268611 15.9507 0.151115 16.3142 0.41935 16.5821C0.687586 16.8499 1.05124 17.0003 1.43031 17Z" fill="currentColor" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden {...props}>
      <path d="M9 17V9M9 9V1M9 9H17M9 9H1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function UploadIcon(props: IconProps) {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden {...props}>
      <path d="M36 18C36 13.2261 34.1036 8.64773 30.7279 5.27208C27.3523 1.89642 22.7739 0 18 0C13.2261 0 8.64773 1.89642 5.27208 5.27208C1.89642 8.64773 0 13.2261 0 18C0 22.7739 1.89642 27.3523 5.27208 30.7279C8.64773 34.1036 13.2261 36 18 36C22.7739 36 27.3523 34.1036 30.7279 30.7279C34.1036 27.3523 36 22.7739 36 18ZM19.125 25.875C19.125 26.1734 19.0065 26.4595 18.7955 26.6705C18.5845 26.8815 18.2984 27 18 27C17.7016 27 17.4155 26.8815 17.2045 26.6705C16.9935 26.4595 16.875 26.1734 16.875 25.875V12.8407L12.0465 17.6715C11.8353 17.8827 11.5487 18.0014 11.25 18.0014C10.9513 18.0014 10.6647 17.8827 10.4535 17.6715C10.2423 17.4603 10.1236 17.1737 10.1236 16.875C10.1236 16.5763 10.2423 16.2897 10.4535 16.0785L17.2035 9.3285C17.308 9.22373 17.4321 9.14061 17.5688 9.0839C17.7055 9.02718 17.852 8.99799 18 8.99799C18.148 8.99799 18.2945 9.02718 18.4312 9.0839C18.5679 9.14061 18.692 9.22373 18.7965 9.3285L25.5465 16.0785C25.7577 16.2897 25.8764 16.5763 25.8764 16.875C25.8764 17.1737 25.7577 17.4603 25.5465 17.6715C25.3353 17.8827 25.0487 18.0014 24.75 18.0014C24.4513 18.0014 24.1647 17.8827 23.9535 17.6715L19.125 12.8407V25.875Z" fill="black" />
    </svg>
  );
}
