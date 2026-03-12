'use client'
import { motion } from 'motion/react';

const AboutPage = () => {
  return (
    <div className="bg-white pt-24">
      {/* Hero Section */}
      <section className="bg-brand-950 py-32 text-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <span className="font-sans text-brand-400 text-xs font-bold tracking-[0.4em] uppercase">
              Notre Histoire
            </span>
            <h1 className="font-display text-5xl md:text-7xl font-bold mt-6 leading-tight">
              Une vision pour la <br /> <span className="italic font-light text-brand-300">transformation des nations</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-32">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div className="space-y-8 font-sans text-neutral-600 text-lg leading-relaxed">
              <p>
                Fondée en 2012, la Communauté des Messagers de Dieu est née d'un appel profond à proclamer l'Évangile avec puissance et à agir concrètement pour le bien-être de la société.
              </p>
              <p>
                Ce qui a commencé comme un petit groupe de prière est devenu aujourd'hui un ministère multi-facettes, touchant des milliers de vies à travers nos églises et nos programmes d'action sociale.
              </p>
            </div>
            <div className="bg-neutral-100 aspect-video flex items-center justify-center border border-neutral-200">
              <span className="text-neutral-400 italic text-sm">[Photo: Fondateurs de la CMDG]</span>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-brand-50 py-32">
        <div className="container mx-auto px-6">
          <h2 className="font-display text-4xl font-bold text-brand-950 text-center mb-20">Nos Valeurs Fondamentales</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: "Excellence", desc: "Nous croyons que Dieu mérite le meilleur de nous-mêmes dans tout ce que nous entreprenons." },
              { title: "Intégrité", desc: "La transparence et l'honnêteté sont au cœur de notre marche avec Dieu et avec les hommes." },
              { title: "Compassion", desc: "L'amour de Dieu se manifeste par des actions concrètes envers ceux qui souffrent." }
            ].map((value, idx) => (
              <div key={idx} className="bg-white p-10 border border-brand-100">
                <h3 className="font-display text-2xl font-bold text-brand-600 mb-4">{value.title}</h3>
                <p className="font-sans text-neutral-500 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;