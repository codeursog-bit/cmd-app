'use client'
import { useApi, apiFetch } from '@/hooks/useApi'
import Link from 'next/link'
import { useState } from 'react'

interface Baptism {
  id: string; baptismType: string; baptismDate: string; location: string | null
  officiant: string | null; certificateNo: string | null; notes: string | null
  member: { id: string; firstName: string; lastName: string; gender: string | null; church: { name: string } }
}

export default function BaptismCertificatePage({ params }: { params: { id: string } }) {
  const { id } = params
  const { data: baptism, loading } = useApi<Baptism>(`/api/baptisms/${id}`)
  const [printing, setPrinting] = useState(false)

  const fmt = (d: string) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(d))

  const handlePrint = () => {
    setPrinting(true)
    setTimeout(() => { window.print(); setPrinting(false) }, 100)
  }

  if (loading) return (
    <div className="space-y-6 animate-fade-in">
      <div className="h-8 w-48 bg-neutral-100 rounded animate-pulse" />
      <div className="h-96 bg-neutral-100 rounded-2xl animate-pulse" />
    </div>
  )

  if (!baptism) return (
    <div className="text-center py-32 text-neutral-400">
      <p className="font-bold text-lg">Baptême introuvable</p>
      <Link href="/admin/baptemes" className="mt-4 inline-block text-brand-600 font-bold hover:underline">← Retour</Link>
    </div>
  )

  const isWater = baptism.baptismType === 'WATER'
  const typeLabel = isWater ? 'Baptême par Immersion' : 'Baptême du Saint-Esprit'

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between print:hidden">
        <Link href="/admin/baptemes" className="flex items-center gap-2 text-neutral-500 hover:text-brand-600 text-sm font-medium transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          Retour au registre
        </Link>
        <div className="flex gap-2">
          <a href={`/admin/baptemes/carte/${baptism.id}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 border border-brand-200 text-brand-700 hover:bg-brand-50 rounded-lg text-sm font-bold transition-colors">
            🎓 Carte de baptême
          </a>
          <button onClick={handlePrint} disabled={printing}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 transition-all shadow-sm disabled:opacity-50">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
            </svg>
            {printing ? 'Préparation...' : 'Imprimer / PDF'}
          </button>
        </div>
      </div>

      <div id="certificate" className="bg-white border-8 border-brand-950 rounded-none max-w-3xl mx-auto p-12 relative overflow-hidden print:border-4">
        <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-brand-400" />
        <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-brand-400" />
        <div className="absolute bottom-0 left-0 w-20 h-20 border-b-4 border-l-4 border-brand-400" />
        <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-brand-400" />

        <div className="text-center mb-10">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-brand-600 mb-4">
            <path d="M12 2v20M7 7h10" />
          </svg>
          <p className="font-sans text-[10px] font-bold tracking-[0.4em] uppercase text-brand-500">Communauté des Messagers de Dieu</p>
          <h1 className="font-display text-5xl font-bold text-brand-950 mt-3 leading-tight">Certificat de<br /><span className="italic font-light text-brand-600">{typeLabel}</span></h1>
          <div className="w-24 h-[2px] bg-brand-600 mx-auto mt-5" />
        </div>

        <div className="text-center space-y-5 my-10">
          <p className="font-sans text-neutral-500 text-sm tracking-wide">Ceci certifie que</p>
          <p className="font-display text-4xl font-bold text-brand-950">{baptism.member.firstName} {baptism.member.lastName}</p>
          <p className="font-sans text-neutral-500 text-sm leading-relaxed max-w-sm mx-auto">
            {isWater
              ? "a reçu le baptême par immersion au nom du Père, du Fils et du Saint-Esprit,"
              : "a été baptisé(e) du Saint-Esprit et a reçu la grâce divine,"}
            <br />conformément aux Saintes Écritures
          </p>
          <div className="inline-flex flex-col items-center bg-brand-50 border border-brand-100 rounded-2xl px-10 py-5">
            <p className="font-sans text-[10px] uppercase tracking-widest text-brand-400 font-bold">Le</p>
            <p className="font-display text-3xl font-bold text-brand-700 mt-1">{fmt(baptism.baptismDate)}</p>
          </div>
          {baptism.location && <p className="font-sans text-neutral-500 text-sm">à <span className="font-semibold text-neutral-700">{baptism.location}</span></p>}
        </div>

        <div className="grid grid-cols-2 gap-10 mt-14 pt-8 border-t border-brand-100">
          <div className="text-center">
            <div className="w-32 h-[1px] bg-neutral-300 mx-auto mb-2" />
            <p className="font-sans text-xs font-bold text-neutral-600 uppercase tracking-widest">Officiant</p>
            <p className="font-sans text-sm text-neutral-700 mt-1">{baptism.officiant || '—'}</p>
          </div>
          <div className="text-center">
            <div className="w-32 h-[1px] bg-neutral-300 mx-auto mb-2" />
            <p className="font-sans text-xs font-bold text-neutral-600 uppercase tracking-widest">Église</p>
            <p className="font-sans text-sm text-neutral-700 mt-1">{baptism.member.church.name}</p>
          </div>
        </div>

        {baptism.certificateNo && (
          <p className="text-center mt-8 font-mono text-[10px] text-neutral-300 tracking-widest">N° {baptism.certificateNo}</p>
        )}
      </div>

      <style>{`@media print { .print\\:hidden { display: none !important; } body { background: white; } }`}</style>
    </div>
  )
}
