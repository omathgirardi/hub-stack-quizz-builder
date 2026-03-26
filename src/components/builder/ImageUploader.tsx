'use client'
import Image from 'next/image'

interface ImageUploaderProps {
  value: string
  onChange: (url: string) => void
  label?: string
}

export function ImageUploader({ value, onChange, label }: ImageUploaderProps) {
  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const form = new FormData()
    form.append('file', file)

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (data.url) onChange(data.url)
    } catch {
      // fallback — usar URL direta
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <div className="flex items-center gap-3">
        <label className="cursor-pointer rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600">
          📎 Selecionar imagem
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </label>
        {value && (
          <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-gray-200">
            <Image src={value} alt="preview" fill className="object-cover" unoptimized />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute right-0.5 top-0.5 rounded-full bg-red-500 px-1 text-xs text-white"
            >
              ✕
            </button>
          </div>
        )}
      </div>
      <input
        type="url"
        placeholder="ou cole uma URL de imagem"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  )
}
