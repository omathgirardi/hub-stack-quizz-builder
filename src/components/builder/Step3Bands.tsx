'use client'
import { ColorPicker } from '@/components/ui/ColorPicker'
import { ImageUploader } from './ImageUploader'
import type { QuizSettings, BandSettings } from '@/lib/sanitize'

interface Props {
  settings: QuizSettings
  onChange: (s: QuizSettings) => void
}

const BANDS: { key: string; label: string; min: number; max: number; color: string }[] = [
  { key: 'leve', label: '🟢 Leve a moderada', min: 6, max: 10, color: '#426A35' },
  { key: 'moderada', label: '🟡 Moderada', min: 11, max: 14, color: '#FBBF24' },
  { key: 'moderada_avancada', label: '🟠 Moderada a avanzada', min: 15, max: 19, color: '#F59E0B' },
  { key: 'avancada', label: '🔴 Avanzada a crítica', min: 20, max: 24, color: '#EF4444' },
]

const CHALET_GREEN_PRESETS = [
  '#f1f7ee', '#e0edda', '#c4ddb9', '#9fc78f', '#7eb06b',
  '#60954d', '#426a35', '#3a5b30', '#314a2a', '#2c4027', '#142211'
]

function BadgePreview({ label, color, textColor }: { label: string; color: string; textColor: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg bg-gray-50 p-4 border border-gray-100">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Preview do Badge</span>
      <div className="flex justify-center">
        <div
          style={{ backgroundColor: color, color: textColor }}
          className="inline-block rounded-full px-6 py-2 text-sm font-bold uppercase tracking-wide shadow-sm"
        >
          {label || 'Sua Faixa Aqui'}
        </div>
      </div>
    </div>
  )
}

const inp = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-label focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'

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
      {BANDS.map(({ key, label: defaultLabel, min, max, color: defaultColor }) => {
        const band = (results[key as keyof typeof results] ?? {
          label: defaultLabel.split(' ').slice(1).join(' '),
          range_min: min,
          range_max: max,
          color: defaultColor,
          badge_text_color: '#ffffff'
        }) as BandSettings
        const set = (field: keyof BandSettings) => (val: unknown) => setBand(key, { [field]: val } as Partial<BandSettings>)
        return (
          <div key={key} className="rounded-xl border border-gray-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">{defaultLabel}</h3>
              <BadgePreview
                label={band.label ?? ''}
                color={band.color ?? defaultColor}
                textColor={band.badge_text_color ?? '#ffffff'}
              />
            </div>
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
              <ColorPicker
                label="Cor de fundo"
                value={band.color ?? defaultColor}
                onChange={(v) => set('color')(v)}
                presets={CHALET_GREEN_PRESETS}
              />
              <ColorPicker
                label="Cor do texto (badge)"
                value={band.badge_text_color ?? '#ffffff'}
                onChange={(v) => set('badge_text_color')(v)}
                presets={['#ffffff', '#000000', ...CHALET_GREEN_PRESETS]}
              />
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
