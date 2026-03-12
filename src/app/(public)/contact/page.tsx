'use client'
import { useState } from "react"
import { motion, AnimatePresence } from "motion/react";

// Hand-coded minimal SVG icons
const IconCross = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20M7 7h10" />
  </svg>
);

const IconPin = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconPhone = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const IconMail = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const IconClock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconFacebook = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const IconInstagram = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const IconYoutube = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.14 1 12 1 12s0 3.86.4 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.86 23 12 23 12s0-3.86-.46-5.58z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
  </svg>
);

const IconTikTok = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const IconCheck = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-brand-600">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconSpinner = () => (
  <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.21-8.56" />
  </svg>
);

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "Informations générales",
    message: "",
  });

  const handleSubmit = () => {
    setStatus("loading");
    // Simulate API call
    setTimeout(() => {
      setStatus("success");
    }, 2000);
  };

  const handleReset = () => {
    setStatus("idle");
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      subject: "Informations générales",
      message: "",
    });
  };

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-950 selection:bg-brand-600 selection:text-white">
      <main className="flex flex-col lg:flex-row">
        {/* LEFT PANEL */}
        <section className="flex flex-col justify-between bg-brand-950 p-12 text-white lg:min-h-screen lg:w-[40%] lg:p-24 border-r border-brand-900">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Logo Placeholder */}
            <div className="flex h-20 w-20 items-center justify-center border border-brand-800 text-brand-400">
              <IconCross />
            </div>

            <h1 className="mt-12 font-display text-4xl font-bold leading-tight md:text-6xl">
              Communauté <br />
              <span className="italic font-light text-brand-300">Messagers de Dieu</span>
            </h1>
            <p className="mt-6 text-[10px] font-bold tracking-[0.4em] text-brand-400 uppercase">
              Porter la lumière, transformer des vies.
            </p>

            {/* Contact Cards */}
            <div className="mt-24 space-y-12">
              {[
                { icon: <IconPin />, label: "Adresse", value: "Avenue de l'Église, Kinshasa, RDC" },
                { icon: <IconPhone />, label: "Téléphone", value: "+243 XXX XXX XXX" },
                { icon: <IconMail />, label: "Email", value: "contact@messagersdedieu.org" },
                { icon: <IconClock />, label: "Horaires", value: "Dim 9h-13h | Mar & Jeu 18h-20h" },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  className="flex items-start gap-6 group"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-brand-800 text-brand-400 group-hover:text-brand-300 transition-colors">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-brand-600">
                      {item.label}
                    </div>
                    <div className="mt-2 text-sm font-medium leading-relaxed text-brand-100">
                      {item.value}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Social Links */}
          <div className="mt-24 flex items-center gap-6 lg:mt-0">
            {[
              { icon: <IconFacebook />, label: "Facebook" },
              { icon: <IconInstagram />, label: "Instagram" },
              { icon: <IconYoutube />, label: "YouTube" },
              { icon: <IconTikTok />, label: "TikTok" },
            ].map((social, idx) => (
              <a
                key={idx}
                href="#"
                className="flex h-12 w-12 items-center justify-center border border-brand-800 text-brand-400 transition-all hover:border-brand-400 hover:text-white"
                aria-label={social.label}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </section>

        {/* RIGHT PANEL */}
        <section className="relative flex flex-col bg-white p-12 lg:w-[60%] lg:p-32">
          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="flex flex-1 flex-col items-center justify-center text-center py-20"
              >
                <div className="flex h-32 w-32 items-center justify-center border border-brand-100 bg-brand-50">
                  <motion.div
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <IconCheck />
                  </motion.div>
                </div>
                <h2 className="mt-12 font-display text-5xl font-bold text-brand-950">Message envoyé</h2>
                <p className="mt-6 max-w-sm text-neutral-500 font-sans leading-relaxed">
                  Merci de nous avoir contactés. Notre équipe vous répondra dans les plus brefs délais.
                </p>
                <div
                  onClick={handleReset}
                  className="mt-12 text-[10px] font-bold tracking-[0.3em] uppercase text-brand-600 hover:text-brand-400 cursor-pointer border-b border-brand-100 pb-1"
                >
                  Envoyer un autre message
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-1 flex-col"
              >
                <header>
                  <span className="text-[10px] font-bold tracking-[0.4em] text-brand-600 uppercase">
                    Contactez-nous
                  </span>
                  <h2 className="font-display text-5xl font-bold text-brand-950 mt-6 leading-tight">
                    Comment pouvons-nous <br /> <span className="italic font-light text-brand-400">vous aider ?</span>
                  </h2>
                </header>

                {/* FORM */}
                <div className="mt-20 space-y-12">
                  <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400">Prénom</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full border-b border-neutral-200 py-4 text-sm outline-none transition-all focus:border-brand-600 bg-transparent"
                        placeholder="Jean"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400">Nom</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full border-b border-neutral-200 py-4 text-sm outline-none transition-all focus:border-brand-600 bg-transparent"
                        placeholder="Dupont"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full border-b border-neutral-200 py-4 text-sm outline-none transition-all focus:border-brand-600 bg-transparent"
                        placeholder="jean.dupont@email.com"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400">Téléphone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full border-b border-neutral-200 py-4 text-sm outline-none transition-all focus:border-brand-600 bg-transparent"
                        placeholder="+243 ..."
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400">Sujet</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full border-b border-neutral-200 bg-transparent py-4 text-sm outline-none transition-all focus:border-brand-600 appearance-none cursor-pointer"
                    >
                      <option>Informations générales</option>
                      <option>Événements</option>
                      <option>Prière</option>
                      <option>Devenir membre</option>
                      <option>Autre</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400">Message</label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full resize-none border-b border-neutral-200 py-4 text-sm outline-none transition-all focus:border-brand-600 bg-transparent"
                      placeholder="Votre message ici..."
                    />
                  </div>

                  <div
                    onClick={handleSubmit}
                    className={`group relative flex h-16 w-full items-center justify-center overflow-hidden bg-brand-950 text-white transition-all hover:bg-brand-600 cursor-pointer ${status === "loading" ? "opacity-70 pointer-events-none" : ""}`}
                  >
                    <span className={`text-[10px] font-bold tracking-[0.3em] uppercase transition-all ${status === "loading" ? "opacity-0" : "opacity-100"}`}>
                      Envoyer le message
                    </span>
                    {status === "loading" && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <IconSpinner />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* MAP SECTION */}
      <section className="w-full border-t border-neutral-100">
        <div className="relative flex h-[500px] w-full items-center justify-center bg-neutral-50">
          {/* Decorative Grid Background */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(var(--color-brand-600) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
          
          <div className="relative flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center border border-brand-200 bg-white text-brand-600 shadow-2xl shadow-brand-600/10">
              <IconPin />
            </div>
            <div className="mt-8">
              <h3 className="font-display text-3xl font-bold text-brand-950">Temple Central</h3>
              <p className="mt-2 text-xs font-bold tracking-[0.2em] text-neutral-400 uppercase">Kinshasa, RDC</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-brand-950 py-16 text-center border-t border-brand-900">
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-brand-700">
          © {new Date().getFullYear()} Communauté des Messagers de Dieu.
        </p>
      </footer>
    </div>
  );
}
