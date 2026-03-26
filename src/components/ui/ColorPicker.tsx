'use client'

interface ColorPickerProps {
  value: string
  onChange: (v: string) => void
  label?: string
  presets?: string[]
}

export function ColorPicker({ value, onChange, label, presets }: ColorPickerProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={value || '#60954D'}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 w-9 cursor-pointer rounded border border-gray-300 p-0.5"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#60954D"
            className="w-28 rounded-lg border border-gray-300 px-3 py-1.5 text-label font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        {presets && presets.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {presets.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => onChange(color)}
                style={{ backgroundColor: color }}
                className={`h-6 w-6 rounded-md border border-gray-200 transition-transform hover:scale-110 ${
                  value === color ? 'ring-2 ring-primary ring-offset-1' : ''
                }`}
                title={color}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
