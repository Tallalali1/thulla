"use client";

interface PlayerNameInputProps {
  index: number;
  value: string;
  onChange: (value: string) => void;
}

export function PlayerNameInput({ index, value, onChange }: PlayerNameInputProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 w-6 text-right">
        {index + 1}.
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Player ${index + 1}`}
        className="flex-1 min-h-[44px] px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500"
      />
    </div>
  );
}
