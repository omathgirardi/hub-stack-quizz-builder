'use client'

interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
  disabled?: boolean
}

export function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow-md ring-0 transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}
        />
      </button>
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </label>
  )
}
