'use client'

import { useState } from 'react'
import type { QuizSettings } from '@/lib/sanitize'

interface Props {
  settings: QuizSettings
  onSubmit: (data: { name: string; email: string; whatsapp: string }) => void
}

const DDI_OPTIONS = [
  { value: '+55', label: '🇧🇷 +55' },
  { value: '+54', label: '🇦🇷 +54' },
  { value: '+34', label: '🇪🇸 +34' },
  { value: '+1', label: '🇺🇸 +1' },
  { value: '+351', label: '🇵🇹 +351' },
  { value: '+52', label: '🇲🇽 +52' },
  { value: '+57', label: '🇨🇴 +57' },
  { value: '+56', label: '🇨🇱 +56' },
  { value: '+51', label: '🇵🇪 +51' },
]

function applyMask(value: string, ddi: string): string {
  const digits = value.replace(/\D/g, '')
  if (ddi === '+55') {
    if (digits.length > 7) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
    if (digits.length > 2) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    return digits
  }
  if (ddi === '+351') {
    if (digits.length > 6) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`
    if (digits.length > 3) return `${digits.slice(0, 3)} ${digits.slice(3)}`
    return digits
  }
  return digits
}

export function LeadCaptureScreen({ settings: s, onSubmit }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [ddi, setDdi] = useState('+55')
  const [error, setError] = useState('')

  const fieldsOrder = s.lead_fields_order || ['whatsapp', 'name', 'email']

  function handleSubmit() {
    if ((s.name_capture && !name) || (s.email_capture && !email) || (s.whatsapp_capture && !phone)) {
      setError('Por favor, preencha todos os campos obrigatórios.')
      return
    }
    if (s.email_capture && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Por favor, insira um e-mail válido.')
      return
    }
    onSubmit({
      name,
      email,
      whatsapp: s.whatsapp_capture ? ddi + phone : '',
    })
  }

  const inputClass = 'w-full rounded-[10px] border border-gray-200 px-3.5 py-3.5 text-base outline-none transition-colors focus:border-[#426a35]'

  return (
    <div className="rounded-xl bg-white p-8 text-center">
      <h3 className="mb-6 text-[1.4em] font-bold text-gray-900">
        {s.lead_headline || 'Antes de começar...'}
      </h3>

      {fieldsOrder.map((fieldId) => {
        if (fieldId === 'name' && s.name_capture) {
          return (
            <div key="name" className="mb-3">
              <div className="mb-1 text-left text-[0.9em] font-semibold text-gray-600">
                {s.name_label || 'Nome'} *
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={s.name_placeholder || 'Seu nome'}
                className={inputClass}
              />
            </div>
          )
        }
        if (fieldId === 'email' && s.email_capture) {
          return (
            <div key="email" className="mb-3">
              <div className="mb-1 text-left text-[0.9em] font-semibold text-gray-600">
                {s.email_label || 'E-mail'} *
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={s.email_placeholder || 'seu@email.com'}
                className={inputClass}
              />
            </div>
          )
        }
        if (fieldId === 'whatsapp' && s.whatsapp_capture) {
          return (
            <div key="whatsapp" className="mb-3">
              <div className="mb-1 text-left text-[0.9em] font-semibold text-gray-600">
                {s.whatsapp_label || 'WhatsApp'} *
              </div>
              <div className="flex gap-2">
                <select
                  value={ddi}
                  onChange={(e) => setDdi(e.target.value)}
                  className="w-[100px] rounded-[10px] border border-gray-200 px-3 py-3.5 text-base focus:border-[#426a35] focus:outline-none"
                >
                  {DDI_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(applyMask(e.target.value, ddi))}
                  placeholder={s.whatsapp_placeholder || '99 99999-9999'}
                  className={`flex-1 ${inputClass}`}
                />
              </div>
            </div>
          )
        }
        return null
      })}

      {error && (
        <div className="mb-3 text-[0.85em] text-red-500">{error}</div>
      )}

      <button
        onClick={handleSubmit}
        className="mt-2 w-full rounded-xl bg-[#426a35] px-4 py-4 text-[1.1em] font-bold text-white shadow-[0_4px_12px_rgba(66,106,53,0.3)]"
      >
        Continuar
      </button>
    </div>
  )
}
