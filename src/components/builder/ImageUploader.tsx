'use client'
import { useState } from 'react'
import { GalleryModal } from './GalleryModal'

interface ImageUploaderProps {
  value: string
  onChange: (url: string) => void
  label?: string
}

export function ImageUploader({ value, onChange, label }: ImageUploaderProps) {
  const [showGallery, setShowGallery] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      const result = event.target?.result as string
      if (result) {
        onChange(result)
        // Salvar na galeria do app
        fetch('/api/gallery', {
          method: 'POST',
          body: JSON.stringify({ url: result, name: file.name }),
        })
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <div className="flex items-center gap-3">
        <label className="cursor-pointer rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-primary hover:text-primary transition-colors">
          📎 Selecionar imagem
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </label>
        
        <button
          type="button"
          onClick={() => setShowGallery(true)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          🖼️ Minha Galeria
        </button>

        {value && (
          <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-gray-200 shadow-sm group">
            <img src={value} alt="preview" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute right-1 top-1 rounded-full bg-red-500 p-0.5 text-white shadow-md transition-transform hover:scale-110"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
      <input
        type="url"
        placeholder="ou cole uma URL de imagem"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />

      <GalleryModal
        isOpen={showGallery}
        onClose={() => setShowGallery(false)}
        onSelect={onChange}
      />
    </div>
  )
}
