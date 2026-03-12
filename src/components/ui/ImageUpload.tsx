'use client'
import { useState, useRef } from 'react'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
  placeholder?: string
}

export function ImageUpload({ value, onChange, label = 'Image de couverture', placeholder = 'https://...' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Fichier image requis'); return }
    if (file.size > 10 * 1024 * 1024) { setError('Image trop grande (max 10 MB)'); return }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    if (!cloudName) {
      // Fallback : utiliser un FileReader pour preview local si pas de Cloudinary configuré
      const reader = new FileReader()
      reader.onload = (e) => onChange(e.target?.result as string)
      reader.readAsDataURL(file)
      return
    }

    setUploading(true); setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', 'cmdg_unsigned') // preset non signé à créer dans Cloudinary
      formData.append('folder', 'cmdg')

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.secure_url) {
        onChange(data.secure_url)
      } else {
        setError('Erreur upload Cloudinary')
      }
    } catch {
      setError('Erreur réseau lors de l\'upload')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5">{label}</label>

      {/* Preview si URL présente */}
      {value && (
        <div className="relative mb-3 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" className="w-full h-48 object-cover" />
          <button
            onClick={() => onChange('')}
            className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 text-white rounded-lg flex items-center justify-center transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}

      {/* Zone de drop */}
      {!value && (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-neutral-200 hover:border-brand-400 rounded-xl p-6 text-center cursor-pointer transition-colors group">
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-neutral-500">Upload en cours...</p>
            </div>
          ) : (
            <>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 text-neutral-300 group-hover:text-brand-400 transition-colors">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <p className="text-sm font-bold text-neutral-500 group-hover:text-brand-600 transition-colors">Cliquez ou glissez une image</p>
              <p className="text-xs text-neutral-300 mt-1">JPG, PNG, WebP — max 10 MB</p>
            </>
          )}
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />

      {/* Ou URL directe */}
      {!value && (
        <div className="mt-2 flex items-center gap-2">
          <div className="h-px flex-1 bg-neutral-100" />
          <span className="text-[10px] text-neutral-300 font-bold uppercase">ou</span>
          <div className="h-px flex-1 bg-neutral-100" />
        </div>
      )}
      {!value && (
        <input
          type="url"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-2 w-full border border-neutral-200 rounded-xl px-4 h-10 text-xs focus:outline-none focus:border-brand-500 transition-colors font-mono"
        />
      )}

      {error && <p className="text-red-500 text-xs mt-1.5 font-medium">{error}</p>}
    </div>
  )
}
