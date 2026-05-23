import clsx from "clsx";
import type { Difficulty } from "@/types/assessment";

const STYLES: Record<Difficulty, string> = {
  easy: "text-primary",
  medium: "text-primary",
  hard: "text-primary",
};

const LABELS: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Moderate",
  hard: "Challenging",
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span
      className={clsx(
        "font-inter text-base font-normal leading-[240%] tracking-[-0.04em]",
        STYLES[difficulty]
      )}
    >
      [{LABELS[difficulty]}]
    </span>
  );
}
