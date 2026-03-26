'use client'
import {
  
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Toggle } from '@/components/ui/Toggle'
import type { QuizSettings } from '@/lib/sanitize'

interface Props {
  settings: QuizSettings
  onChange: (s: QuizSettings) => void
}

const DEFAULT_SECTIONS = [
  { id: 'badge', title: '🏷️ Badge de resultado' },
  { id: 'journey', title: '📈 Jornada (Journey Chart)' },
  { id: 'comparison', title: '📊 Comparativo (hoje vs depois)' },
  { id: 'diagnosis', title: '🩺 Diagnóstico' },
  { id: 'needs', title: '🎯 O que seu corpo precisa' },
  { id: 'solution', title: '💊 Solução' },
  { id: 'how_it_works', title: '🪜 Como funciona' },
  { id: 'deliverables', title: '🎁 Entregáveis' },
  { id: 'benefit', title: '⚡ Benefício imediato' },
  { id: 'pricing', title: '💰 Oferta / Pricing' },
  { id: 'social_proof', title: '📸 Prova Social' },
  { id: 'urgency', title: '⚠️ Urgência final' },
]

const inp = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-label focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  )
}

function SortableSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <section ref={setNodeRef} style={style} className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
        <span {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600">⠿</span>
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-tight">{title}</h3>
      </div>
      <div className="pt-2">
        {children}
      </div>
    </section>
  )
}

export function Step5ResultPage({ settings, onChange }: Props) {
  const rp = (settings.result_page ?? {}) as Record<string, unknown>
  const sectionsOrder = (rp.sections_order as string[]) || DEFAULT_SECTIONS.map(s => s.id)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = sectionsOrder.indexOf(active.id as string)
      const newIndex = sectionsOrder.indexOf(over.id as string)
      const next = arrayMove(sectionsOrder, oldIndex, newIndex)
      onChange({ ...settings, result_page: { ...rp, sections_order: next } })
    }
  }

  function setRp(key: string) {
    return (val: unknown) => onChange({ ...settings, result_page: { ...rp, [key]: val } })
  }

  function text(label: string, key: string, placeholder?: string) {
    return (
      <Field label={label}>
        <input className={inp} value={(rp[key] as string) ?? ''} onChange={(e) => setRp(key)(e.target.value)} placeholder={placeholder} />
      </Field>
    )
  }

  function textarea(label: string, key: string, rows = 3) {
    return (
      <Field label={label}>
        <textarea className={inp} rows={rows} value={(rp[key] as string) ?? ''} onChange={(e) => setRp(key)(e.target.value)} />
      </Field>
    )
  }

  function listField(label: string, key: string, count: number, placeholder?: string) {
    const arr = Array.isArray(rp[key]) ? (rp[key] as string[]) : Array(count).fill('')
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {arr.map((val: string, i: number) => (
          <input key={i} className={inp} value={val ?? ''} placeholder={placeholder ? `${placeholder} ${i + 1}` : ''} onChange={(e) => {
            const next = [...arr]
            next[i] = e.target.value
            setRp(key)(next)
          }} />
        ))}
      </div>
    )
  }

  const renderSection = (id: string) => {
    const s = DEFAULT_SECTIONS.find(x => x.id === id)
    if (!s) return null

    switch (id) {
      case 'badge':
        return (
          <SortableSection key={id} id={id} title={s.title}>
            {text('Label do badge', 'result_badge_label', '⚠️ TU RESULTADO basado en tus respuestas:')}
          </SortableSection>
        )
      case 'journey':
        return (
          <SortableSection key={id} id={id} title={s.title}>
            {text('Título', 'journey_title', 'Tu Jornada en los Próximos 30 Días')}
            {text('Subtítulo', 'journey_subtitle')}
            <div className="grid grid-cols-2 gap-3">
              {text('Label Hoje', 'journey_label_today', 'HOY')}
              {text('Label Futuro', 'journey_label_future', 'EN 30 DÍAS')}
            </div>
            {text('Badge de dias', 'journey_days_badge', '30 DÍAS')}
          </SortableSection>
        )
      case 'comparison':
        return (
          <SortableSection key={id} id={id} title={s.title}>
            <div className="grid grid-cols-2 gap-3">
              {text('Ícone coluna Hoje', 'comp_today_icon')}
              {text('Ícone coluna Depois', 'comp_after_icon')}
              {text('Título coluna Hoje', 'comp_today_title')}
              {text('Título coluna Depois', 'comp_after_title')}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="space-y-2 rounded-lg bg-gray-50 p-3 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Item {i}</p>
                  <input className={inp} placeholder="Hoje" value={(rp[`comp_item_${i}_today`] as string) ?? ''} onChange={(e) => setRp(`comp_item_${i}_today`)(e.target.value)} />
                  <input className={inp} placeholder="Depois" value={(rp[`comp_item_${i}_after`] as string) ?? ''} onChange={(e) => setRp(`comp_item_${i}_after`)(e.target.value)} />
                </div>
              ))}
            </div>
          </SortableSection>
        )
      case 'diagnosis':
        return (
          <SortableSection key={id} id={id} title={s.title}>
            {text('Heading do diagnóstico', 'diagnosis_heading', '⚠️ Lo que esto significa en la prática:')}
            {textarea('Texto boa notícia', 'goodnews_text')}
          </SortableSection>
        )
      case 'needs':
        return (
          <SortableSection key={id} id={id} title={s.title}>
            {text('Título', 'needs_title')}
            {text('Descrição', 'needs_desc')}
            {text('CTA', 'needs_cta')}
          </SortableSection>
        )
      case 'solution':
        return (
          <SortableSection key={id} id={id} title={s.title}>
            {text('Badge da solução', 'solution_badge')}
            {text('Título', 'solution_title')}
            {textarea('Descrição', 'solution_desc')}
            {listField('Itens da solução (até 4)', 'solution_items', 4, 'Item')}
          </SortableSection>
        )
      case 'how_it_works':
        return (
          <SortableSection key={id} id={id} title={s.title}>
            <div className="grid grid-cols-2 gap-3">
              {text('Ícone passo 1', 'step_1_icon')}
              {text('Ícone passo 2', 'step_2_icon')}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-3">
                {text('Título passo 1', 'step_1_title')}
                {text('Texto passo 1', 'step_1_text')}
              </div>
              <div className="space-y-3">
                {text('Título passo 2', 'step_2_title')}
                {text('Texto passo 2', 'step_2_text')}
              </div>
            </div>
          </SortableSection>
        )
      case 'deliverables':
        return (
          <SortableSection key={id} id={id} title={s.title}>
            {text('Título', 'deliverables_title')}
            {listField('Entregáveis (até 6)', 'deliverables', 6, 'Entregável')}
          </SortableSection>
        )
      case 'benefit':
        return (
          <SortableSection key={id} id={id} title={s.title}>
            {text('Badge', 'benefit_badge_label')}
            {text('Texto', 'benefit_text')}
          </SortableSection>
        )
      case 'pricing':
        return (
          <SortableSection key={id} id={id} title={s.title}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                {text('Label oferta', 'offer_label')}
                {text('Sub-label', 'offer_sublabel')}
              </div>
              <div className="space-y-3">
                {listField('Features do pricing (até 3)', 'pricing_features', 3, 'Feature')}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {text('Preço DE', 'price_from')}
              {text('Preço POR', 'price_to')}
              {text('Moeda', 'price_currency')}
              {text('Texto do CTA', 'cta_text')}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {text('Garantia', 'guarantee_text')}
              {text('Rodapé 1', 'offer_footer_1')}
              {text('Rodapé 2', 'offer_footer_2')}
            </div>
          </SortableSection>
        )
      case 'social_proof':
        return (
          <SortableSection key={id} id={id} title={s.title}>
            <Field label="Exibir prova social">
              <Toggle
                checked={Boolean(rp.show_social_proof)}
                onChange={(v) => setRp('show_social_proof')(v)}
              />
            </Field>
            {Boolean(rp.show_social_proof) && (
              <div className="space-y-3 mt-3">
                {text('Título', 'social_proof_title')}
                {text('Subtítulo', 'social_proof_subtitle')}
                <Field label="URLs das imagens (separadas por vírgula)">
                  <textarea
                    className={inp}
                    rows={3}
                    placeholder="https://exemplo.com/foto1.jpg, https://exemplo.com/foto2.jpg"
                    value={(rp.gallery_ids as string) ?? ''}
                    onChange={(e) => setRp('gallery_ids')(e.target.value)}
                  />
                </Field>
              </div>
            )}
          </SortableSection>
        )
      case 'urgency':
        return (
          <SortableSection key={id} id={id} title={s.title}>
            {textarea('Texto de urgência', 'urgency_text')}
          </SortableSection>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-headline font-bold text-gray-800">5. Página de Resultado</h2>
        <div className="text-[10px] font-bold text-gray-400 uppercase bg-gray-100 px-2 py-1 rounded">Mova os blocos para reordenar</div>
      </div>

      <Field label="Tipo da página">
        <select className={inp} value={(rp.type as string) ?? 'standard'} onChange={(e) => setRp('type')(e.target.value)}>
          <option value="standard">Padrão (template)</option>
          <option value="manual">HTML Manual</option>
        </select>
      </Field>

      {rp.type === 'manual' ? (
        textarea('HTML Manual', 'manual_html', 10)
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sectionsOrder} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {sectionsOrder.map(id => renderSection(id))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
