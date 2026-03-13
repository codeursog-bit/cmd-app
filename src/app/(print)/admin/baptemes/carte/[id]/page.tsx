'use client'

import { useApi } from '@/hooks/useApi'
import Link from 'next/link'

interface Baptism {
  id: string; baptismType: string; baptismDate: string; location: string | null
  officiant: string | null; certificateNo: string | null; notes: string | null
  member: { firstName: string; lastName: string; photoUrl: string | null; church: { name: string; logoUrl: string | null } }
}

export default function CarteBapteme({ params }: { params: { id: string } }) {
  const { id } = params
  const { data: baptism, loading } = useApi<Baptism>(`/api/baptisms/${id}`)

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-100">
      <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!baptism) return (
    <div className="text-center py-32">
      <p className="font-bold text-lg text-neutral-500">Baptême introuvable</p>
      <Link href="/admin/baptemes" className="mt-4 inline-block text-brand-600 font-bold hover:underline">← Retour</Link>
    </div>
  )

  const fmt = (d: string) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(d))
  const isWater = baptism.baptismType === 'WATER'
  // Logo : celui de l'église si défini, sinon le logo CMD public
  const logoSrc = baptism.member.church.logoUrl || '/logo-cmd.png'

  return (
    <div>
      {/* Barre d'action — masquée à l'impression */}
      <div className="print:hidden flex items-center justify-between gap-4 p-6 bg-neutral-50 border-b border-neutral-200">
        <Link href={`/admin/baptemes/${id}`} className="flex items-center gap-2 text-neutral-500 hover:text-brand-600 text-sm font-medium">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Retour
        </Link>
        <button onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
            <rect x="6" y="14" width="12" height="8"/>
          </svg>
          Imprimer / PDF
        </button>
      </div>

      {/* Prévisualisation */}
      <div className="flex items-center justify-center min-h-screen bg-neutral-100 p-8 print:p-0 print:bg-white print:min-h-0">

        {/* CARTE — format A5 paysage */}
        <div id="baptism-card"
          className="bg-white w-[720px] print:w-full shadow-2xl print:shadow-none"
          style={{ minHeight: '480px', fontFamily: 'serif' }}>

          {/* Bordure décorative double */}
          <div className="border-8 border-double border-brand-800 m-3" style={{ minHeight: '456px' }}>
            <div className="border border-brand-300 m-1 p-8 flex flex-col" style={{ minHeight: '436px' }}>

              {/* En-tête avec logo */}
              <div className="text-center border-b-2 border-brand-200 pb-5 mb-5">
                <div className="w-20 h-20 mx-auto mb-3 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoSrc}
                    alt="Logo CMD"
                    className="w-full h-full object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/logo-cmd.png' }}
                  />
                </div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-brand-700 font-bold mb-1">
                  Communauté des Messagers de Dieu
                </p>
                <p className="text-base font-bold text-neutral-800">{baptism.member.church.name}</p>
              </div>

              {/* Titre */}
              <div className="text-center mb-6">
                <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-400 mb-1">Certificat de</p>
                <h1 className="text-4xl font-black text-brand-900" style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.05em' }}>
                  BAPTÊME
                </h1>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="h-px w-16 bg-brand-300" />
                  <span className="text-brand-400 text-lg">✦</span>
                  <div className="h-px w-16 bg-brand-300" />
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  {isWater ? 'Baptême par immersion' : 'Baptême du Saint-Esprit'}
                </p>
              </div>

              {/* Corps */}
              <div className="flex-1 text-center space-y-4">
                <p className="text-sm text-neutral-500">Nous certifions que</p>

                <div>
                  <p className="text-3xl font-black text-brand-900" style={{ fontFamily: 'Georgia, serif' }}>
                    {baptism.member.firstName} {baptism.member.lastName}
                  </p>
                  <div className="h-0.5 w-48 bg-brand-200 mx-auto mt-2" />
                </div>

                <p className="text-sm text-neutral-600 leading-relaxed max-w-md mx-auto">
                  a reçu le baptême{isWater ? ' par immersion dans les eaux' : ' du Saint-Esprit'}<br />
                  conformément aux Saintes Écritures
                </p>

                <div className="grid grid-cols-2 gap-6 mt-4 text-sm">
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-neutral-400 mb-1">Date</p>
                    <p className="font-bold text-neutral-800">{fmt(baptism.baptismDate)}</p>
                  </div>
                  {baptism.location && (
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-neutral-400 mb-1">Lieu</p>
                      <p className="font-bold text-neutral-800">{baptism.location}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Signatures */}
              <div className="border-t border-brand-100 pt-4 mt-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  {baptism.officiant && (
                    <div>
                      <div className="h-8 border-b border-neutral-300 mb-1" />
                      <p className="text-[9px] uppercase tracking-widest text-neutral-400">Officiant</p>
                      <p className="text-xs font-bold text-neutral-600">{baptism.officiant}</p>
                    </div>
                  )}
                  <div>
                    <div className="h-8 border-b border-neutral-300 mb-1" />
                    <p className="text-[9px] uppercase tracking-widest text-neutral-400">Pasteur / Berger</p>
                  </div>
                  <div>
                    <div className="h-8 border-b border-neutral-300 mb-1" />
                    <p className="text-[9px] uppercase tracking-widest text-neutral-400">Secrétaire</p>
                  </div>
                </div>
                {baptism.certificateNo && (
                  <p className="text-[9px] text-neutral-300 text-center mt-3 font-mono">N° {baptism.certificateNo}</p>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: A5 landscape; margin: 0; }
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        }
      `}</style>
    </div>
  )
}
