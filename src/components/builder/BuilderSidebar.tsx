'use client'

const STEPS = [
  { n: 1, label: 'Geral' },
  { n: 2, label: 'Lead' },
  { n: 3, label: 'Faixas' },
  { n: 4, label: 'Perguntas' },
  { n: 5, label: 'Resultado' },
]

interface Props {
  activeStep: number
  onChange: (n: number) => void
}

export function BuilderSidebar({ activeStep, onChange }: Props) {
  return (
    <aside className="w-48 shrink-0 border-r border-gray-200 bg-white pt-6">
      <p className="mb-4 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Steps</p>
      <nav className="flex flex-col gap-1 px-2">
        {STEPS.map(({ n, label }) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              activeStep === n ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${activeStep === n ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
              {n}
            </span>
            {label}
          </button>
        ))}
      </nav>
    </aside>
  )
}
