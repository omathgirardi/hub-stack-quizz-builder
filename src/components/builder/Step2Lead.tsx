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

const DEFAULT_FIELDS = ['whatsapp', 'name', 'email']
const inp = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-label focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'

function SortableField({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div ref={setNodeRef} style={style} className="rounded-xl border border-gray-200 bg-white p-4 space-y-4 shadow-sm">
      <div className="flex items-center gap-2 border-b border-gray-50 pb-2 mb-2">
        <span {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600">⠿</span>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{id}</span>
      </div>
      {children}
    </div>
  )
}

export function Step2Lead({ settings, onChange }: Props) {
  const fieldsOrder = settings.lead_fields_order || DEFAULT_FIELDS
  const set = (key: keyof QuizSettings) => (val: unknown) => onChange({ ...settings, [key]: val })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = fieldsOrder.indexOf(active.id as string)
      const newIndex = fieldsOrder.indexOf(over.id as string)
      const next = arrayMove([...fieldsOrder], oldIndex, newIndex)
      onChange({ ...settings, lead_fields_order: next })
    }
  }

  const renderField = (id: string) => {
    switch (id) {
      case 'whatsapp':
        return (
          <SortableField key={id} id={id}>
            <Toggle checked={!!settings.whatsapp_capture} onChange={(v) => set('whatsapp_capture')(v)} label="Capturar WhatsApp" />
            {settings.whatsapp_capture && (
              <div className="grid gap-3 pl-2">
                <div>
                  <label className="text-xs font-medium text-gray-600">Label do campo</label>
                  <input className={inp} value={settings.whatsapp_label ?? ''} onChange={(e) => set('whatsapp_label')(e.target.value)} placeholder="Seu WhatsApp" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Mensagem WhatsApp (pós quiz)</label>
                  <textarea className={inp} rows={3} value={settings.whatsapp_msg ?? ''} onChange={(e) => set('whatsapp_msg')(e.target.value)} placeholder="Olá! Acabei de fazer o quiz..." />
                </div>
              </div>
            )}
          </SortableField>
        )
      case 'name':
        return (
          <SortableField key={id} id={id}>
            <Toggle checked={!!settings.name_capture} onChange={(v) => set('name_capture')(v)} label="Capturar Nome" />
            {settings.name_capture && (
              <div className="pl-2">
                <label className="text-xs font-medium text-gray-600">Placeholder do campo</label>
                <input className={inp} value={settings.name_placeholder ?? ''} onChange={(e) => set('name_placeholder')(e.target.value)} placeholder="Seu nome" />
              </div>
            )}
          </SortableField>
        )
      case 'email':
        return (
          <SortableField key={id} id={id}>
            <Toggle checked={!!settings.email_capture} onChange={(v) => set('email_capture')(v)} label="Capturar E-mail" />
            {settings.email_capture && (
              <div className="pl-2">
                <label className="text-xs font-medium text-gray-600">Placeholder do campo</label>
                <input className={inp} value={settings.email_placeholder ?? ''} onChange={(e) => set('email_placeholder')(e.target.value)} placeholder="seu@email.com" />
              </div>
            )}
          </SortableField>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">2. Captura de Lead</h2>
        <div className="text-[10px] font-bold text-gray-400 uppercase bg-gray-100 px-2 py-1 rounded">Reordene os campos abaixo</div>
      </div>

      <div className="rounded-xl border border-gray-200 p-4 space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Título da tela de lead</label>
          <input className={inp} value={settings.lead_headline ?? ''} onChange={(e) => set('lead_headline')(e.target.value)} placeholder="Antes de ver seu resultado..." />
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fieldsOrder} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {fieldsOrder.map((id: string) => renderField(id))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
