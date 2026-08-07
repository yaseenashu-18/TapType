"use client";

import { DownloadSimple, Info } from "@phosphor-icons/react";
import { type ReactNode, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { ResultStats } from "@/lib/types";

export const actionBtnClass =
  "flex items-center gap-2 rounded-lg px-4 py-2 text-xs text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground focus-visible:ring-0 focus-visible:outline-none";

export function ResultsActionButton({
  onClick,
  label,
  icon,
  spinOnClick = false,
}: {
  onClick: () => void;
  label: string;
  icon: ReactNode;
  spinOnClick?: boolean;
}) {
  const [spinning, setSpinning] = useState(false);

  function handleClick() {
    if (spinOnClick) {
      setSpinning(true);
      setTimeout(() => setSpinning(false), 600);
    }
    onClick();
  }

  return (
    <button className={actionBtnClass} onClick={handleClick} type="button">
      <span
        style={{
          display: "inline-flex",
          transition: "transform 0.6s cubic-bezier(0.4,0,0.2,1)",
          transform: spinning ? "rotate(360deg)" : "rotate(0deg)",
        }}
      >
        {icon}
      </span>
      {label}
    </button>
  );
}

export function DownloadResultsPopover({ stats }: { stats: ResultStats }) {
  const downloadPdf = () => {
    const origin = typeof window === "undefined" ? "" : window.location.origin;
    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (!printWindow) {
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>TapType Result Certificate - ${stats.wpm} WPM</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;600;700&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              background: #09090b;
              color: #f4f4f5;
              padding: 40px;
              margin: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              box-sizing: border-box;
            }
            .card {
              background: #18181b;
              border: 1px solid #27272a;
              border-radius: 24px;
              padding: 48px;
              width: 100%;
              max-width: 600px;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            }
            .header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 1px solid #27272a;
              padding-bottom: 24px;
              margin-bottom: 32px;
            }
            .brand {
              display: flex;
              align-items: center;
              gap: 14px;
            }
            .brand-name {
              font-size: 24px;
              font-weight: 700;
              color: #f4f4f5;
              letter-spacing: -0.5px;
            }
            .subtitle {
              font-size: 12px;
              color: #a1a1aa;
              margin-top: 2px;
            }
            .hero-stats {
              display: flex;
              justify-content: space-around;
              margin-bottom: 40px;
              text-align: center;
            }
            .stat-box {
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .stat-value {
              font-family: 'JetBrains Mono', monospace;
              font-size: 68px;
              font-weight: 700;
              color: #f59e0b;
              line-height: 1;
            }
            .stat-value.acc {
              color: #f4f4f5;
            }
            .stat-label {
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 2px;
              color: #71717a;
              margin-top: 10px;
            }
            .details-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 16px;
              background: #09090b;
              border: 1px solid #27272a;
              padding: 24px;
              border-radius: 16px;
              margin-bottom: 32px;
            }
            .detail-item {
              display: flex;
              justify-content: space-between;
              font-size: 13px;
            }
            .detail-label {
              color: #a1a1aa;
            }
            .detail-val {
              font-family: 'JetBrains Mono', monospace;
              font-weight: 600;
              color: #f4f4f5;
            }
            .footer {
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 11px;
              color: #71717a;
              border-top: 1px solid #27272a;
              padding-top: 20px;
            }
            @media print {
              body { background: white; color: black; padding: 0; }
              .card { background: white; color: black; border: 2px solid #ccc; box-shadow: none; }
              .stat-value { color: #d97706; }
              .stat-value.acc { color: #111; }
              .detail-val { color: #111; }
              .details-grid { background: #f4f4f5; border-color: #e4e4e7; }
              .detail-label { color: #52525b; }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <div class="brand">
                <div>
                  <div class="brand-name">TapType</div>
                  <div class="subtitle">Typing Speed Certificate</div>
                </div>
              </div>
              <div class="subtitle" style="text-align: right">
                <div>${new Date().toLocaleDateString()}</div>
                <div style="font-size: 11px; opacity: 0.75; margin-top: 2px">${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
              </div>
            </div>

            <div class="hero-stats">
              <div class="stat-box">
                <div class="stat-value">${stats.wpm}</div>
                <div class="stat-label">WPM</div>
              </div>
              <div class="stat-box">
                <div class="stat-value acc">${stats.accuracy}%</div>
                <div class="stat-label">Accuracy</div>
              </div>
            </div>

            <div class="details-grid">
              <div class="detail-item">
                <span class="detail-label">Raw Speed</span>
                <span class="detail-val">${stats.raw} WPM</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Consistency</span>
                <span class="detail-val">${stats.consistency}%</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Test Mode</span>
                <span class="detail-val">${stats.mode} ${stats.modeDetail}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Characters</span>
                <span class="detail-val">${stats.correctChars}/${stats.incorrectChars}/${stats.extraChars}/${stats.missedChars}</span>
              </div>
            </div>

            <div class="footer">
              <span>Verified by TapType (yaseenashu-18)</span>
              <span>https://github.com/yaseenashu-18/TapType</span>
            </div>
          </div>
          <script>
            window.onload = () => {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <button className={actionBtnClass} onClick={downloadPdf} type="button">
      <DownloadSimple aria-hidden size={15} weight="duotone" />
      download PDF
    </button>
  );
}

export function CalculationFormulaPopover() {
  return (
    <Popover>
      <PopoverTrigger className={actionBtnClass}>
        <Info aria-hidden size={15} weight="duotone" />
        formula
      </PopoverTrigger>
      <PopoverContent
        align="center"
        className="w-[min(20rem,calc(100vw-2rem))] p-4"
        side="top"
        sideOffset={8}
      >
        <div className="space-y-4">
          <FormulaItem
            description="Only fully correct words and their spaces count. In time mode, a correct prefix of the current word is included before you press space."
            formula="(correct chars + spaces) / 5 / minutes"
            label="WPM"
          />
          <div className="h-px bg-foreground/[0.06]" />
          <FormulaItem
            description="Every keystroke counts regardless of accuracy. Measures raw typing speed before error correction."
            formula="total keystrokes / 5 / minutes"
            label="Raw"
          />
          <div className="h-px bg-foreground/[0.06]" />
          <FormulaItem
            description="Character-level accuracy. Extra characters beyond the target word count as incorrect."
            formula="correct / (correct + incorrect) x 100"
            label="Accuracy"
          />
          <div className="h-px bg-foreground/[0.06]" />
          <FormulaItem
            description="Measures how steady your speed was. σ is standard deviation, μ is mean of per-second WPM. 100% means perfectly even pacing."
            formula="100 - (σ / μ x 100)"
            label="Consistency"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

function FormulaItem({
  label,
  formula,
  description,
}: {
  label: string;
  formula: string;
  description: string;
}) {
  return (
    <div className="space-y-1.5">
      <p className="font-medium text-[11px] text-foreground">{label}</p>
      <p className="rounded-md bg-foreground/[0.04] px-2.5 py-1.5 text-[11px] text-muted-foreground">
        {formula}
      </p>
      <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
