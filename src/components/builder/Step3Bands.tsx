'use client'
import { ColorPicker } from '@/components/ui/ColorPicker'
import { ImageUploader } from './ImageUploader'
import type { QuizSettings, BandSettings } from '@/lib/sanitize'

interface Props {
  settings: QuizSettings
  onChange: (s: QuizSettings) => void
}

const BANDS: { key: string; label: string }[] = [
  { key: 'leve', label: '🟢 Leve' },
  { key: 'moderada', label: '🟡 Moderada' },
  { key: 'moderada_avancada', label: '🟠 Moderada Avançada' },
  { key: 'avancada', label: '🔴 Avançada' },
]

const inp = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'

export function Step3Bands({ settings, onChange }: Props) {
  const results = settings.results ?? {}

  function setBand(key: string, patch: Partial<BandSettings>) {
    const current = results[key as keyof typeof results] ?? {} as BandSettings
    onChange({
      ...settings,
      results: { ...results, [key]: { ...current, ...patch } },
    })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-base font-semibold text-gray-800">3. Faixas de Resultado</h2>
      {BANDS.map(({ key, label }) => {
        const band = (results[key as keyof typeof results] ?? {}) as BandSettings
        const set = (field: keyof BandSettings) => (val: unknown) => setBand(key, { [field]: val } as Partial<BandSettings>)
        return (
          <div key={key} className="rounded-xl border border-gray-200 p-5 space-y-4">
            <h3 className="font-semibold text-gray-800">{label}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600">Label da faixa</label>
                <input className={inp} value={band.label ?? ''} onChange={(e) => set('label')(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Nível (texto)</label>
                <input className={inp} value={band.level ?? ''} onChange={(e) => set('level')(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Score mínimo</label>
                <input type="number" className={inp} value={band.range_min ?? 0} onChange={(e) => set('range_min')(Number(e.target.value))} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Score máximo</label>
                <input type="number" className={inp} value={band.range_max ?? 100} onChange={(e) => set('range_max')(Number(e.target.value))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ColorPicker label="Cor de fundo" value={band.color ?? '#3B82F6'} onChange={(v) => set('color')(v)} />
              <ColorPicker label="Cor do texto (badge)" value={band.badge_text_color ?? '#ffffff'} onChange={(v) => set('badge_text_color')(v)} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Descrição</label>
              <textarea className={inp} rows={2} value={band.description ?? ''} onChange={(e) => set('description')(e.target.value)} />
            </div>
            <ImageUploader label="Imagem da faixa" value={band.image_url ?? ''} onChange={(v) => set('image_url')(v)} />
            <div>
              <label className="text-xs font-medium text-gray-600">URL da oferta desta faixa</label>
              <input type="url" className={inp} value={band.offer_url ?? ''} onChange={(e) => set('offer_url')(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Mensagem na última pergunta</label>
              <input className={inp} value={band.last_question_message ?? ''} onChange={(e) => set('last_question_message')(e.target.value)} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
