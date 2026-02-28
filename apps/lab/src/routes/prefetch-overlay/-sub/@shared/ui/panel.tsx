import type { ReactNode } from "react";
import { CodeBlock } from "~/@lib/ui/common/code-block";

export type PanelData = {
  description: string;
  demo: ReactNode;
  code: string;
};

export function Panel({
  variant,
  label,
  tag,
  data,
}: {
  variant: "problem" | "solution";
  label: string;
  tag: string;
  data: PanelData;
}) {
  const styles = {
    problem: {
      border: "border-red-200",
      bg: "bg-red-50/30",
      badge: "bg-red-100 text-red-700",
      demoBorder: "border-red-100",
    },
    solution: {
      border: "border-green-200",
      bg: "bg-green-50/30",
      badge: "bg-green-100 text-green-700",
      demoBorder: "border-green-100",
    },
  }[variant];

  return (
    <div className={`rounded-lg border ${styles.border} ${styles.bg} p-5`}>
      <div className="mb-3 flex items-center gap-2">
        <span
          className={`rounded px-2 py-0.5 text-xs font-semibold ${styles.badge}`}
        >
          {label}
        </span>
        <span className="text-sm font-medium text-gray-700">{tag}</span>
      </div>

      <div
        className={`mb-3 rounded-lg border ${styles.demoBorder} bg-white p-4`}
      >
        {data.demo}
      </div>

      <p className="mb-3 text-sm leading-relaxed text-gray-600">
        {data.description}
      </p>

      <div className={`rounded-lg border ${styles.demoBorder} bg-white`}>
        <CodeBlock code={data.code} />
      </div>
    </div>
  );
}
