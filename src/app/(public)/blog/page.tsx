'use client'
import { useState, useCallback } from 'react'
import { motion } from 'motion/react'
import { useApi } from '@/hooks/useApi'
import PostCard from '@/components/public/PostCard'

const IconSearch = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>)

interface Post { id:string; title:string; excerpt:string|null; type:string; slug:string; publishedAt:string|null; coverUrl:string|null; audioUrl:string|null; videoUrl:string|null; author:{firstName:string;lastName:string} }
interface ApiResp { posts:Post[]; total:number; page:number; totalPages:number }

const TYPE_LABELS: Record<string,string> = { ARTICLE:'Article', SERMON:'Prédication', TESTIMONY:'Témoignage', ANNOUNCEMENT:'Annonce' }

export default function BlogPage() {
  const [type, setType]     = useState('')
  const [search, setSearch] = useState('')
  const [debSearch, setDeb] = useState('')
  const [page, setPage]     = useState(1)

  const handleSearch = useCallback((v:string) => {
    setSearch(v)
    clearTimeout((handleSearch as any)._t)
    ;(handleSearch as any)._t = setTimeout(() => { setDeb(v); setPage(1) }, 400)
  }, [])

  const q = new URLSearchParams({ status:'PUBLISHED', limit:'9', page:String(page), ...(type?{type}:{}), ...(debSearch?{search:debSearch}:{}) }).toString()
  const { data, loading } = useApi<ApiResp>(`/api/posts?${q}`)

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-950 selection:bg-brand-600 selection:text-white">
      <header className="relative flex h-[350px] w-full flex-col justify-center bg-brand-950 px-6 md:px-12">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.6}} className="mx-auto w-full max-w-7xl">
          <nav className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-brand-400">
            <a href="/" className="hover:text-white transition-colors">Accueil</a>
            <span className="text-brand-800">/</span>
            <span className="text-white">Blog</span>
          </nav>
          <h1 className="mt-8 font-display text-5xl font-bold text-white md:text-7xl lg:text-8xl leading-none">Publications &amp; <br/><span className="italic font-light text-brand-300">Enseignements</span></h1>
        </motion.div>
      </header>

      {/* FILTER BAR */}
      <div className="border-b border-neutral-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 md:flex-row md:px-12">
          <div className="flex flex-wrap items-center gap-4">
            {[['','Tout'],['ARTICLE','Articles'],['SERMON','Prédications'],['TESTIMONY','Témoignages'],['ANNOUNCEMENT','Annonces']].map(([v,l]) => (
              <button key={v} onClick={() => { setType(v); setPage(1) }}
                className={`text-[10px] font-bold tracking-[0.2em] uppercase pb-1 border-b-2 transition-all ${type===v?'border-brand-600 text-brand-950':'border-transparent text-neutral-400 hover:text-neutral-600'}`}>
                {l}
              </button>
            ))}
          </div>
          <div className="relative w-full max-w-xs">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"><IconSearch /></div>
            <input type="text" placeholder="Rechercher..." value={search} onChange={e=>handleSearch(e.target.value)}
              className="w-full border-b border-neutral-200 bg-transparent py-2 pl-12 pr-6 text-xs outline-none focus:border-brand-500 transition-colors"/>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-24 md:px-12">
        {loading ? (
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {Array(6).fill(0).map((_,i) => <div key={i} className="h-72 bg-neutral-100 rounded-xl animate-pulse"/>)}
          </div>
        ) : data?.posts.length ? (
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {data.posts.map(p => (
              <PostCard key={p.id} category={TYPE_LABELS[p.type]||p.type} title={p.title} excerpt={p.excerpt||''} author={`${p.author.firstName} ${p.author.lastName}`} date={p.publishedAt ? new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'long',year:'numeric'}).format(new Date(p.publishedAt)) : ''} slug={p.slug} coverUrl={p.coverUrl} audioUrl={p.audioUrl} videoUrl={p.videoUrl}/>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 text-neutral-400">Aucune publication pour le moment.</div>
        )}

        {data && data.totalPages > 1 && (
          <div className="mt-32 flex items-center justify-center gap-8">
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="flex h-12 w-12 items-center justify-center border border-neutral-200 text-neutral-400 hover:border-brand-600 hover:text-brand-600 disabled:opacity-40 transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            {Array.from({length:data.totalPages},(_,i)=>i+1).map(p => (
              <button key={p} onClick={()=>setPage(p)} className={`text-xs font-bold tracking-widest transition-all ${page===p?'text-brand-600 underline underline-offset-8':'text-neutral-400 hover:text-brand-600'}`}>0{p}</button>
            ))}
            <button onClick={()=>setPage(p=>Math.min(data.totalPages,p+1))} disabled={page===data.totalPages} className="flex h-12 w-12 items-center justify-center border border-neutral-200 text-neutral-400 hover:border-brand-600 hover:text-brand-600 disabled:opacity-40 transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        )}
      </main>

      <section className="bg-brand-950 py-24 text-center">
        <div className="container mx-auto px-6">
          <h2 className="font-display text-3xl text-white font-bold mb-8">Restez informé de nos publications</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
            <input type="email" placeholder="Votre email" className="bg-brand-900 border border-brand-800 px-6 py-3 text-sm text-white outline-none focus:border-brand-500 w-full"/>
            <button className="bg-brand-600 text-white px-8 py-3 text-xs font-bold tracking-widest uppercase hover:bg-brand-500 transition-all">S&apos;abonner</button>
          </div>
        </div>
      </section>
    </div>
  )
}
