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
  return (
    <div className="pill-input-white flex w-[100px] justify-between px-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-4 w-4 items-center justify-center text-border-muted disabled:opacity-40"
        disabled={value <= min}
        aria-label="Decrease"
      >
        <MinusIcon active={value > min} />
      </button>
      <span className="text-p-3 font-medium">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex h-4 w-4 items-center justify-center"
        disabled={value >= max}
        aria-label="Increase"
      >
        <PlusIcon />
      </button>
    </div>
  );
}

function MinusIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <path
        d="M3 8H13"
        stroke={active ? "#303030" : "#DADADA"}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <path
        d="M8 3V13M3 8H13"
        stroke="#DADADA"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
