'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useApi, apiFetch } from '@/hooks/useApi'
import Link from 'next/link'

interface Department { id:string; name:string }

const STEPS = ['Identité','Coordonnées','Département','Confirmation']

const Field = ({label,type='text',placeholder,value,onChange,required=false}:{label:string;type?:string;placeholder?:string;value:string;onChange:(v:string)=>void;required?:boolean}) => (
  <div>
    <label className="block font-sans text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-1">{label}{required&&<span className="text-red-400 ml-1">*</span>}</label>
    <input type={type} placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)}
      className="w-full border border-neutral-200 rounded-lg px-4 h-11 text-sm focus:outline-none focus:border-brand-500 transition-colors bg-white"/>
  </div>
)

export default function NewMemberPage() {
  const { user } = useAuth()
  const router   = useRouter()
  const [step, setStep]     = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState<string|null>(null)

  const [firstName, setFirstName]   = useState('')
  const [lastName, setLastName]     = useState('')
  const [gender, setGender]         = useState('')
  const [birthDate, setBirthDate]   = useState('')
  const [phone, setPhone]           = useState('')
  const [email, setEmail]           = useState('')
  const [address, setAddress]       = useState('')
  const [notes, setNotes]           = useState('')
  const [deptIds, setDeptIds]       = useState<string[]>([])

  const { data: depts } = useApi<Department[]>(user?.church?.id ? `/api/departments?churchId=${user.church.id}` : null)

  const toggleDept = (id:string) => setDeptIds(ds => ds.includes(id) ? ds.filter(d=>d!==id) : [...ds,id])

  const handleSubmit = async () => {
    if (!firstName || !lastName) { setError('Prénom et nom requis'); return }
    setLoading(true); setError(null)
    const { error: err } = await apiFetch('/api/members', 'POST', {
      firstName, lastName, gender: gender||undefined, birthDate: birthDate||undefined,
      phone: phone||undefined, email: email||undefined, address: address||undefined,
      notes: notes||undefined, departmentIds: deptIds,
      churchId: user?.church?.id,
    })
    setLoading(false)
    if (err) { setError(err); return }
    router.push('/admin/membres')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-2xl font-bold text-neutral-900">Nouveau membre</h1>
          <p className="text-neutral-500 text-sm">Enregistrez un nouveau membre dans la communauté.</p>
        </div>
        <Link href="/admin/membres" className="text-sm text-neutral-500 hover:text-brand-600 font-medium transition-colors">Annuler</Link>
      </div>

      {/* STEPPER */}
      <div className="flex items-center gap-0">
        {STEPS.map((s,i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i<=step?'bg-brand-600 text-white':'bg-neutral-100 text-neutral-400'}`}>
                {i<step ? '✓' : i+1}
              </div>
              <span className={`text-[10px] font-bold mt-1 uppercase tracking-wider ${i<=step?'text-brand-600':'text-neutral-300'}`}>{s}</span>
            </div>
            {i < STEPS.length-1 && <div className={`flex-1 h-0.5 mx-2 mb-5 transition-all ${i<step?'bg-brand-600':'bg-neutral-100'}`}/>}
          </div>
        ))}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-8">
        {/* STEP 0 - Identité */}
        {step === 0 && (
          <div className="space-y-5">
            <h2 className="font-sans font-bold text-neutral-800 mb-6">Informations d&apos;identité</h2>
            <div className="grid grid-cols-2 gap-5">
              <Field label="Prénom" value={firstName} onChange={setFirstName} required placeholder="Jean-Pierre"/>
              <Field label="Nom de famille" value={lastName} onChange={setLastName} required placeholder="Mutombo"/>
            </div>
            <div>
              <label className="block font-sans text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-1">Genre</label>
              <div className="flex gap-3">
                {[['MALE','Homme'],['FEMALE','Femme']].map(([v,l]) => (
                  <div key={v} onClick={()=>setGender(v)} className={`flex-1 py-3 rounded-lg border text-sm font-bold text-center cursor-pointer transition-all ${gender===v?'bg-brand-600 border-brand-600 text-white':'border-neutral-200 text-neutral-500 hover:border-brand-300'}`}>{l}</div>
                ))}
              </div>
            </div>
            <Field label="Date de naissance" type="date" value={birthDate} onChange={setBirthDate}/>
          </div>
        )}

        {/* STEP 1 - Coordonnées */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="font-sans font-bold text-neutral-800 mb-6">Coordonnées</h2>
            <Field label="Téléphone" type="tel" value={phone} onChange={setPhone} placeholder="+243 81 234 5678"/>
            <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="jean@email.com"/>
            <div>
              <label className="block font-sans text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-1">Adresse</label>
              <textarea value={address} onChange={e=>setAddress(e.target.value)} rows={3} placeholder="Avenue de la Paix, Pointe-Noire"
                className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-500 transition-colors resize-none"/>
            </div>
            <div>
              <label className="block font-sans text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-1">Notes</label>
              <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder="Informations complémentaires..."
                className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-500 transition-colors resize-none"/>
            </div>
          </div>
        )}

        {/* STEP 2 - Département */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="font-sans font-bold text-neutral-800 mb-6">Assignation aux départements</h2>
            <p className="text-sm text-neutral-500">Sélectionnez un ou plusieurs départements (optionnel).</p>
            {depts?.length ? (
              <div className="grid grid-cols-2 gap-3">
                {depts.map(d => (
                  <div key={d.id} onClick={()=>toggleDept(d.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${deptIds.includes(d.id)?'border-brand-600 bg-brand-50':'border-neutral-200 hover:border-brand-200'}`}>
                    <span className="font-bold text-sm text-neutral-800">{d.name}</span>
                    {deptIds.includes(d.id) && <span className="block text-[10px] text-brand-600 font-bold uppercase tracking-wider mt-1">Sélectionné</span>}
                  </div>
                ))}
              </div>
            ) : <p className="text-neutral-400 italic text-sm">Aucun département disponible.</p>}
          </div>
        )}

        {/* STEP 3 - Confirmation */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-sans font-bold text-neutral-800 mb-6">Confirmation</h2>
            <div className="bg-neutral-50 rounded-xl p-5 space-y-3">
              {[
                ['Nom complet', `${firstName} ${lastName}`],
                ['Genre', gender==='MALE'?'Homme':gender==='FEMALE'?'Femme':'—'],
                ['Date de naissance', birthDate ? new Intl.DateTimeFormat('fr-FR').format(new Date(birthDate)) : '—'],
                ['Téléphone', phone||'—'],
                ['Email', email||'—'],
                ['Département(s)', depts?.filter(d=>deptIds.includes(d.id)).map(d=>d.name).join(', ')||'Aucun'],
              ].map(([l,v]) => (
                <div key={l} className="flex justify-between text-sm">
                  <span className="text-neutral-500 font-medium">{l}</span>
                  <span className="font-bold text-neutral-800">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* NAVIGATION */}
      <div className="flex gap-3">
        {step > 0 && (
          <button onClick={()=>setStep(s=>s-1)} className="flex-1 py-3 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-600 hover:bg-neutral-50 transition-colors">
            Précédent
          </button>
        )}
        {step < STEPS.length-1 ? (
          <button onClick={()=>setStep(s=>s+1)} disabled={step===0&&(!firstName||!lastName)}
            className="flex-1 py-3 bg-brand-600 rounded-xl text-sm font-bold text-white hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Suivant
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 py-3 bg-brand-600 rounded-xl text-sm font-bold text-white hover:bg-brand-700 transition-colors disabled:opacity-50">
            {loading ? 'Enregistrement...' : 'Enregistrer le membre'}
          </button>
        )}
      </div>
    </div>
  )
}
