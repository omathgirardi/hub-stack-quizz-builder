'use client'
import { useState } from 'react'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { v4 as uuid } from 'uuid'
import { Toggle } from '@/components/ui/Toggle'
import { Button } from '@/components/ui/Button'
import { ImageUploader } from './ImageUploader'
import type { Question } from '@/lib/sanitize'

interface Props {
  questions: Question[]
  onChange: (q: Question[]) => void
}

const LETTERS = ['A', 'B', 'C', 'D']
const inp = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'

function newQuestion(): Question {
  return {
    id: uuid(), field_id: uuid(), question: '', icon: '', image_url: '', use_carousel: false,
    carousel_images: [], is_informational: false, media_position: 'top',
    options: LETTERS.map((letter) => ({ label: '', points: 0, letter })),
  }
}

function QuestionCard({ question, index, total, onChange, onRemove }: {
  question: Question; index: number; total: number
  onChange: (q: Question) => void; onRemove: () => void
}) {
  const [open, setOpen] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: question.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  const set = (key: keyof Question) => (val: unknown) => onChange({ ...question, [key]: val })

  return (
    <div ref={setNodeRef} style={style} className="rounded-xl border border-gray-200 bg-white">
      <div
        className="flex cursor-pointer items-center justify-between gap-3 p-4"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <span {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-700" onClick={(e) => e.stopPropagation()}>⠿</span>
          <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
          <span className="text-sm text-gray-800 line-clamp-1">{question.question || <em className="text-gray-400">Sem título</em>}</span>
        </div>
        <button type="button" onClick={(e) => { e.stopPropagation(); onRemove() }} className="text-red-400 hover:text-red-600 text-lg">✕</button>
      </div>

      {open && (
        <div className="border-t border-gray-100 p-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600">Texto da pergunta</label>
            <input className={inp} value={question.question} onChange={(e) => set('question')(e.target.value)} />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-600">Ícone (emoji)</label>
              <input className={inp} value={question.icon} onChange={(e) => set('icon')(e.target.value)} placeholder="🎯" maxLength={4} />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-600">Posição da mídia</label>
              <select className={inp} value={question.media_position} onChange={(e) => set('media_position')(e.target.value as 'top' | 'bottom')}>
                <option value="top">Topo</option>
                <option value="bottom">Base</option>
              </select>
            </div>
          </div>
          <div className="flex gap-6">
            <Toggle checked={question.is_informational} onChange={(v) => set('is_informational')(v)} label="Pergunta informacional" />
            <Toggle checked={question.use_carousel} onChange={(v) => set('use_carousel')(v)} label="Usar carrossel" />
          </div>
          <ImageUploader label="Imagem da pergunta" value={question.image_url} onChange={(v) => set('image_url')(v)} />
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600">Opções de resposta</label>
            {question.options.map((opt, oi) => (
              <div key={oi} className="flex items-center gap-2">
                <span className="w-6 text-sm font-bold text-gray-500">{opt.letter}.</span>
                <input
                  className={inp + ' flex-1'}
                  placeholder="Texto da opção"
                  value={opt.label}
                  onChange={(e) => {
                    const opts = [...question.options]
                    opts[oi] = { ...opts[oi], label: e.target.value }
                    set('options')(opts)
                  }}
                />
                <input
                  type="number"
                  className="w-20 rounded-lg border border-gray-300 px-2 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="pts"
                  value={opt.points}
                  onChange={(e) => {
                    const opts = [...question.options]
                    opts[oi] = { ...opts[oi], points: Number(e.target.value) }
                    set('options')(opts)
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function Step4Questions({ questions, onChange }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id)
      const newIndex = questions.findIndex((q) => q.id === over.id)
      onChange(arrayMove(questions, oldIndex, newIndex))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">4. Perguntas ({questions.length})</h2>
        <Button type="button" size="sm" onClick={() => onChange([...questions, newQuestion()])}>
          + Adicionar
        </Button>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {questions.map((q, i) => (
              <QuestionCard
                key={q.id}
                question={q}
                index={i}
                total={questions.length}
                onChange={(updated) => onChange(questions.map((x) => (x.id === updated.id ? updated : x)))}
                onRemove={() => onChange(questions.filter((x) => x.id !== q.id))}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {questions.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 py-12 text-center text-gray-400">
          Nenhuma pergunta. Clique em + Adicionar para começar.
        </div>
      )}
    </div>
  )
}
