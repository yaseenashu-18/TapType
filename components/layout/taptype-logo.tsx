"use client";

import Image from "next/image";

export function TapTypeLogo({
  className,
  size = 28,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md shadow-sm transition-transform hover:scale-105 ${className ?? ""}`}
      style={{ height: size, width: Math.round(size * 1.5) }}
    >
      <Image
        alt="TapType Logo"
        className="object-cover"
        height={size}
        src="/logo.png"
        width={Math.round(size * 1.5)}
      />
    </div>
  );
}
