'use client'
import { useState } from 'react'
import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

const IconCross = () => (<svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M7 7h10"/></svg>)
const IconMail = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>)
const IconLock = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>)
const IconEye = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>)
const IconEyeOff = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>)
const IconSpinner = () => (<svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.21-8.56"/></svg>)

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [err, setErr]           = useState<string | null>(null)
  const { login } = useAuth()
  const router    = useRouter()

  const handleLogin = async () => {
    if (!email || !password) { setErr('Veuillez remplir tous les champs.'); return }
    setErr(null); setLoading(true)
    const error = await login(email, password)
    setLoading(false)
    if (error) { setErr(error); return }
    router.push('/admin/dashboard')
  }

  return (
    <div className="flex min-h-screen w-full bg-white font-sans text-neutral-950 selection:bg-brand-600 selection:text-white">
      <section className="relative hidden w-[40%] flex-col items-center justify-center overflow-hidden bg-brand-950 lg:flex border-r border-brand-900">
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:`linear-gradient(45deg,#2563eb 25%,transparent 25%),linear-gradient(-45deg,#2563eb 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#2563eb 75%),linear-gradient(-45deg,transparent 75%,#2563eb 75%)`,backgroundSize:'60px 60px'}}/>
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.8,ease:'easeOut'}} className="relative z-10 flex flex-col items-center text-center px-12">
          <img src="/logo-cmd.png" alt="CMD" className="h-24 w-24 object-contain" />
          <h1 className="mt-12 font-display text-6xl font-bold tracking-[0.2em] text-white">CMD</h1>
          <div className="mt-10 h-[1px] w-20 bg-brand-600"/>
          <p className="mt-10 text-[10px] font-bold tracking-[0.4em] uppercase text-brand-300">Administration</p>
          <p className="mt-6 text-sm font-light text-neutral-400 leading-relaxed max-w-xs">Espace sécurisé pour la gestion du ministère et de la communauté.</p>
        </motion.div>
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-[0.3em] uppercase text-brand-800">v1.0.0</div>
      </section>

      <section className="flex w-full flex-col items-center justify-center p-12 lg:w-[60%] lg:p-32">
        <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.7}} className="w-full max-w-md">
          <header>
            <span className="text-[10px] font-bold tracking-[0.4em] text-brand-600 uppercase">Bienvenue</span>
            <h2 className="font-display text-5xl font-bold text-brand-950 mt-6 leading-tight">Accès au <br/><span className="italic font-light text-brand-400">tableau de bord</span></h2>
          </header>

          {err && (
            <motion.div initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} className="mt-10 flex items-center gap-4 border border-brand-100 bg-brand-50 p-5 text-xs font-medium text-brand-900">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {err}
            </motion.div>
          )}

          <div className="mt-16 space-y-10">
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400">Identifiant email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center text-neutral-300"><IconMail /></div>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()}
                  className="h-14 w-full border-b border-neutral-200 bg-transparent pl-10 pr-4 text-sm outline-none transition-all focus:border-brand-600" placeholder="admin@cmd.cg"/>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400">Mot de passe</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center text-neutral-300"><IconLock /></div>
                <input type={showPass?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()}
                  className="h-14 w-full border-b border-neutral-200 bg-transparent pl-10 pr-12 text-sm outline-none transition-all focus:border-brand-600" placeholder="••••••••"/>
                <button onClick={()=>setShowPass(!showPass)} className="absolute inset-y-0 right-0 flex items-center text-neutral-300 hover:text-brand-600 transition-colors">
                  {showPass?<IconEyeOff/>:<IconEye/>}
                </button>
              </div>
            </div>
            <div onClick={handleLogin} className={`group relative flex h-16 w-full items-center justify-center overflow-hidden bg-brand-950 text-white transition-all hover:bg-brand-600 cursor-pointer ${loading?'opacity-70 pointer-events-none':''}`}>
              <span className={`text-[10px] font-bold tracking-[0.3em] uppercase ${loading?'opacity-0':'opacity-100'}`}>Se connecter</span>
              {loading && <div className="absolute inset-0 flex items-center justify-center"><IconSpinner /></div>}
            </div>
          </div>
          <footer className="mt-20">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-300 text-center">Espace réservé • CMD Administration</p>
          </footer>
        </motion.div>
      </section>
    </div>
  )
}
