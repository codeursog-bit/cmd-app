'use client'
import { useState } from 'react'
import { motion } from 'motion/react'
import { useApi } from '@/hooks/useApi'
import EventCard from '@/components/public/EventCard'
import Link from 'next/link'

interface Event { id:string; title:string; slug:string; startDate:string; location:string|null; description:string|null; status:string; coverUrl:string|null; audioUrl:string|null; videoUrl:string|null }
interface ApiResp { events:Event[]; total:number }

const MONTHS_FR = ['JAN','FÉV','MAR','AVR','MAI','JUN','JUL','AOÛ','SEP','OCT','NOV','DÉC']

export default function EventsPage() {
  const { data: upcoming } = useApi<ApiResp>('/api/events?upcoming=true&limit=20')
  const { data: past }     = useApi<ApiResp>('/api/events?status=COMPLETED&limit=10')

  const fmt = (d:string) => {
    const dt = new Date(d)
    return { day: String(dt.getDate()).padStart(2,'0'), month: MONTHS_FR[dt.getMonth()] }
  }

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-950 selection:bg-brand-600 selection:text-white">
      <header className="relative flex h-[350px] w-full flex-col justify-center bg-brand-950 px-6 md:px-12">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.6}} className="mx-auto w-full max-w-7xl">
          <nav className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-brand-400">
            <a href="/" className="hover:text-white transition-colors">Accueil</a>
            <span className="text-brand-800">/</span>
            <span className="text-white">Événements</span>
          </nav>
          <h1 className="mt-8 font-display text-5xl font-bold text-white md:text-7xl leading-none">Nos <span className="italic font-light text-brand-300">Rassemblements</span></h1>
          <p className="mt-6 text-xs font-bold tracking-[0.2em] text-brand-400 uppercase">Cultes, conférences et activités communautaires</p>
        </motion.div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-24 md:px-12">
        <div className="grid grid-cols-1 gap-20 lg:grid-cols-[1fr_320px]">
          <div>
            {/* UPCOMING */}
            <section>
              <div className="flex items-center gap-4 mb-12">
                <h2 className="font-display text-3xl font-bold text-brand-950">Prochains Événements</h2>
                <div className="flex-1 h-[1px] bg-brand-100"/>
              </div>
              {!upcoming ? (
                <div className="grid grid-cols-1 gap-12 sm:grid-cols-2">
                  {Array(4).fill(0).map((_,i)=><div key={i} className="h-72 bg-neutral-100 rounded-xl animate-pulse"/>)}
                </div>
              ) : upcoming.events.length ? (
                <div className="grid grid-cols-1 gap-12 sm:grid-cols-2">
                  {upcoming.events.map(e => {
                    const {day,month} = fmt(e.startDate)
                    return (
                      <EventCard key={e.id} day={day} month={month} title={e.title} location={e.location||''} time={new Intl.DateTimeFormat('fr-FR',{hour:'2-digit',minute:'2-digit'}).format(new Date(e.startDate))} description={e.description||''} status="À venir" slug={e.slug} coverUrl={e.coverUrl} audioUrl={e.audioUrl} videoUrl={e.videoUrl}/>
                    )
                  })}
                </div>
              ) : (
                <p className="text-neutral-400 italic">Aucun événement à venir pour le moment.</p>
              )}
            </section>

            {/* PAST */}
            {past?.events.length ? (
              <section className="mt-32">
                <div className="flex items-center gap-4 mb-12">
                  <h2 className="font-display text-3xl font-bold text-neutral-400">Événements Passés</h2>
                  <div className="flex-1 h-[1px] bg-neutral-100"/>
                </div>
                <div className="space-y-8">
                  {past.events.map(e => {
                    const {day,month} = fmt(e.startDate)
                    return (
                      <div key={e.id} className="flex flex-col gap-8 border-b border-neutral-100 pb-8 md:flex-row md:items-center group">
                        <div className="flex h-24 w-24 flex-col items-center justify-center bg-neutral-50 border border-neutral-100 text-center group-hover:bg-brand-50 transition-colors">
                          <span className="font-display text-3xl font-bold text-neutral-400 group-hover:text-brand-600">{day}</span>
                          <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-300">{month}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-display text-2xl font-bold text-neutral-400 group-hover:text-neutral-600 transition-colors">{e.title}</h3>
                          {e.location && <div className="mt-3 text-[10px] font-bold tracking-widest uppercase text-neutral-300">{e.location}</div>}
                        </div>
                        <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-300 border border-neutral-100 px-4 py-2">Terminé</div>
                      </div>
                    )
                  })}
                </div>
              </section>
            ) : null}
          </div>

          {/* SIDEBAR */}
          <aside>
            <div className="sticky top-32 space-y-16">
              {upcoming?.events.slice(0,3).map(e => (
                <div key={e.id} className="group cursor-pointer border-l border-brand-100 pl-6 hover:border-brand-600 transition-colors">
                  <div className="text-[10px] font-bold tracking-widest uppercase text-brand-400">
                    {new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'long'}).format(new Date(e.startDate)).toUpperCase()}
                  </div>
                  <h4 className="mt-2 font-display text-xl font-bold text-brand-950 group-hover:text-brand-600 transition-colors leading-tight">{e.title}</h4>
                </div>
              ))}
              <div className="bg-brand-50 p-10 border border-brand-100">
                <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-950">S&apos;abonner aux alertes</h3>
                <p className="mt-4 text-xs leading-relaxed text-neutral-500">Recevez les notifications pour nos prochains rassemblements directement par email.</p>
                <div className="mt-8 space-y-4">
                  <input type="email" placeholder="Votre email" className="w-full border border-brand-200 bg-white px-5 py-4 text-xs outline-none focus:border-brand-600 transition-colors"/>
                  <div className="w-full bg-brand-950 py-4 text-[10px] font-bold tracking-widest uppercase text-white text-center cursor-pointer hover:bg-brand-600 transition-all">M&apos;inscrire</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="bg-brand-950 py-16 text-center border-t border-brand-900">
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-brand-700">© {new Date().getFullYear()} Communauté des Messagers de Dieu.</p>
      </footer>
    </div>
  )
}
