export interface QuestionOption {
  label: string
  points: number
  letter: string
}

export interface Question {
  id: string
  field_id: string
  question: string
  icon: string
  image_url: string
  use_carousel: boolean
  carousel_images: string[]
  is_informational: boolean
  media_position: 'top' | 'bottom'
  options: QuestionOption[]
}

export interface BandSettings {
  label: string
  range_min: number
  range_max: number
  color: string
  badge_text_color: string
  level: string
  description: string
  image_url: string
  offer_url: string
  last_question_message: string
}

export interface QuizSettings {
  headline?: string
  subheadline?: string
  cta_button?: string
  badge_text?: string
  landing_image?: string
  checklist_item_1?: string
  checklist_item_2?: string
  checklist_item_3?: string
  urgency_text?: string
  cta_offer_url?: string
  webhook_url?: string
  language?: 'pt' | 'es'
  show_landing?: boolean
  whatsapp_capture?: boolean
  name_capture?: boolean
  email_capture?: boolean
  lead_headline?: string
  whatsapp_label?: string
  whatsapp_msg?: string
  name_placeholder?: string
  email_placeholder?: string
  results?: {
    leve?: BandSettings
    moderada?: BandSettings
    moderada_avancada?: BandSettings
    avancada?: BandSettings
  }
  result_page?: Record<string, unknown>
}

export function sanitizeQuestions(raw: unknown): Question[] {
  if (!Array.isArray(raw)) return []
  return raw.map((q: Record<string, unknown>) => ({
    id: String(q.id ?? ''),
    field_id: String(q.field_id ?? ''),
    question: String(q.question ?? ''),
    icon: String(q.icon ?? ''),
    image_url: String(q.image_url ?? ''),
    use_carousel: Boolean(q.use_carousel),
    carousel_images: Array.isArray(q.carousel_images) ? q.carousel_images.map(String) : [],
    is_informational: Boolean(q.is_informational),
    media_position: q.media_position === 'bottom' ? 'bottom' : 'top',
    options: Array.isArray(q.options)
      ? q.options.slice(0, 4).map((o: Record<string, unknown>) => ({
          label: String(o.label ?? ''),
          points: Number(o.points ?? 0),
          letter: String(o.letter ?? ''),
        }))
      : [],
  }))
}

export function sanitizeSettings(raw: unknown): QuizSettings {
  if (!raw || typeof raw !== 'object') return {}
  return raw as QuizSettings
}
