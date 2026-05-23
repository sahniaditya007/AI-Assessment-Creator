"use client";

interface CounterInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function CounterInput({
  value,
  onChange,
  min = 1,
  max = 99,
}: CounterInputProps) {
  const canDecrement = value > min;
  const canIncrement = value < max;

  return (
    <div className="pill-input-white flex h-11 w-[108px] select-none items-center justify-between px-1">
      {/* Decrease button — full height, generous hit area */}
      <button
        type="button"
        onClick={() => canDecrement && onChange(value - 1)}
        disabled={!canDecrement}
        aria-label="Decrease"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:bg-bg-off-white-20 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 7H12" stroke="#303030" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {/* Value — not clickable */}
      <span className="w-6 text-center text-p-3 font-medium text-primary">
        {value}
      </span>

      {/* Increase button — full height, generous hit area */}
      <button
        type="button"
        onClick={() => canIncrement && onChange(value + 1)}
        disabled={!canIncrement}
        aria-label="Increase"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:bg-bg-off-white-20 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 2V12M2 7H12" stroke="#303030" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
