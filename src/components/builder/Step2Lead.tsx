'use client'
import { Toggle } from '@/components/ui/Toggle'
import type { QuizSettings } from '@/lib/sanitize'

interface Props {
  settings: QuizSettings
  onChange: (s: QuizSettings) => void
}

const inp = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-label focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'

export function Step2Lead({ settings, onChange }: Props) {
  const set = (key: keyof QuizSettings) => (val: unknown) => onChange({ ...settings, [key]: val })

  return (
    <div className="space-y-6">
      <h2 className="text-base font-semibold text-gray-800">2. Captura de Lead</h2>

      <div className="rounded-xl border border-gray-200 p-4 space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Título da tela de lead</label>
          <input className={inp} value={settings.lead_headline ?? ''} onChange={(e) => set('lead_headline')(e.target.value)} placeholder="Antes de ver seu resultado..." />
        </div>
      </div>

      {/* WhatsApp */}
      <div className="rounded-xl border border-gray-200 p-4 space-y-4">
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
      </div>

      {/* Nome */}
      <div className="rounded-xl border border-gray-200 p-4 space-y-4">
        <Toggle checked={!!settings.name_capture} onChange={(v) => set('name_capture')(v)} label="Capturar Nome" />
        {settings.name_capture && (
          <div className="pl-2">
            <label className="text-xs font-medium text-gray-600">Placeholder do campo</label>
            <input className={inp} value={settings.name_placeholder ?? ''} onChange={(e) => set('name_placeholder')(e.target.value)} placeholder="Seu nome" />
          </div>
        )}
      </div>

      {/* E-mail */}
      <div className="rounded-xl border border-gray-200 p-4 space-y-4">
        <Toggle checked={!!settings.email_capture} onChange={(v) => set('email_capture')(v)} label="Capturar E-mail" />
        {settings.email_capture && (
          <div className="pl-2">
            <label className="text-xs font-medium text-gray-600">Placeholder do campo</label>
            <input className={inp} value={settings.email_placeholder ?? ''} onChange={(e) => set('email_placeholder')(e.target.value)} placeholder="seu@email.com" />
          </div>
        )}
      </div>
    </div>
  )
}
