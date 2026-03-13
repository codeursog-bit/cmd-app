import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const hash = (p: string) => bcrypt.hashSync(p, 12)

async function main() {
  console.log('🌱 Seeding...')

  // ── Organisation ──────────────────────────────────────────────────────────
  const org = await prisma.organisation.upsert({
    where:  { id: 'org-cmd' },
    update: {},
    create: { id: 'org-cmd', name: 'CMD — Communauté des Messagers de Dieu', description: 'Ministère d\'Évangélisation et d\'Action Sociale', website: 'https://cmd.cg' }
  })

  // ── Église principale ─────────────────────────────────────────────────────
  const church = await prisma.church.upsert({
    where:  { id: 'church-main' },
    update: {},
    create: { id: 'church-main', name: 'CMD Siège Central', city: 'Pointe-Noire', country: 'CG', organisationId: org.id, email: 'contact@cmd.cg', phone: '+242 06 000 0000' }
  })

  // ── Utilisateurs ──────────────────────────────────────────────────────────
  const superAdmin = await prisma.user.upsert({
    where:  { email: 'admin@cmd.cg' },
    update: {},
    create: { email: 'admin@cmd.cg', password: hash('Admin@2024!'), firstName: 'Samuel', lastName: 'Moussoki', role: 'SUPER_ADMIN', organisationId: org.id }
  })
  const pastor = await prisma.user.upsert({
    where:  { email: 'pasteur@cmd.cg' },
    update: {},
    create: { email: 'pasteur@cmd.cg', password: hash('Pasteur@2024!'), firstName: 'Jean', lastName: 'Nganga', role: 'PASTOR', organisationId: org.id }
  })
  await prisma.user.upsert({
    where:  { email: 'media@cmd.cg' },
    update: {},
    create: { email: 'media@cmd.cg', password: hash('Media@2024!'), firstName: 'Marie', lastName: 'Bouanga', role: 'MEDIA_MANAGER', organisationId: org.id }
  })
  await prisma.user.upsert({
    where:  { email: 'bapteme@cmd.cg' },
    update: {},
    create: { email: 'bapteme@cmd.cg', password: hash('Bapteme@2024!'), firstName: 'Pierre', lastName: 'Mbemba', role: 'BAPTISM_TEACHER', organisationId: org.id }
  })

  await prisma.church.update({ where: { id: church.id }, data: { pastorId: pastor.id } })
  await prisma.userChurch.upsert({ where: { userId_churchId: { userId: superAdmin.id, churchId: church.id } }, update: {}, create: { userId: superAdmin.id, churchId: church.id, role: 'SUPER_ADMIN' } })
  await prisma.userChurch.upsert({ where: { userId_churchId: { userId: pastor.id,     churchId: church.id } }, update: {}, create: { userId: pastor.id,     churchId: church.id, role: 'PASTOR' } })

  // ── Départements ──────────────────────────────────────────────────────────
  const depts = ['Louange & Adoration', 'Jeunesse', 'Femmes', 'Évangélisation', 'Diacres']
  for (const name of depts) {
    await prisma.department.upsert({
      where:  { id: `dept-${name.toLowerCase().replace(/\s+/g, '-').slice(0, 10)}` },
      update: {},
      create: { id: `dept-${name.toLowerCase().replace(/\s+/g, '-').slice(0, 10)}`, name, churchId: church.id }
    })
  }

  // ── Membres ───────────────────────────────────────────────────────────────
  const membres = [
    { firstName: 'Ange',   lastName: 'Nkounkou'  },
    { firstName: 'Grace',  lastName: 'Malonga'   },
    { firstName: 'David',  lastName: 'Tsieno'    },
    { firstName: 'Esther', lastName: 'Mabiala'   },
    { firstName: 'Paul',   lastName: 'Boukaka'   },
    { firstName: 'Rachel', lastName: 'Moutsinga' },
  ]
  for (const m of membres) {
    await prisma.member.upsert({
      where:  { id: `member-${m.firstName.toLowerCase()}` },
      update: {},
      create: { id: `member-${m.firstName.toLowerCase()}`, ...m, churchId: church.id }
    })
  }

  // ── Événements ────────────────────────────────────────────────────────────
  const now = new Date()
  const events = [
    {
      id: 'event-culte-1',
      title: 'Grand Culte du Dimanche',
      slug: 'grand-culte-dimanche',
      description: 'Rejoignez-nous pour notre culte hebdomadaire de louange et de prière. Un moment de communion, d\'adoration et de prédication de la Parole de Dieu.',
      content: 'Chaque dimanche, notre communauté se réunit pour adorer Dieu en esprit et en vérité.\n\nAu programme :\n- Louange et adoration (30 min)\n- Prédication de la Parole\n- Prières d\'intercession\n- Communion fraternelle\n\nTous sont les bienvenus !',
      status: 'UPCOMING' as const,
      startDate: new Date(now.getTime() + 3 * 86400000),
      endDate:   new Date(now.getTime() + 3 * 86400000 + 3 * 3600000),
      location: 'CMD Siège Central — Avenue de la Paix, Pointe-Noire',
      coverUrl: 'https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=1200&h=630&fit=crop',
      churchId: church.id,
    },
    {
      id: 'event-jeune-1',
      title: 'Nuit de Jeûne et Prière',
      slug: 'nuit-jeune-priere',
      description: 'Une nuit entière consacrée à la prière collective, au jeûne spirituel et à la recherche de la face de Dieu pour notre nation.',
      content: 'La prière est le souffle de l\'Église.\n\nCette nuit de jeûne sera divisée en plusieurs temps :\n- 20h00 : Ouverture et louange\n- 21h00 : Enseignement sur le jeûne biblique\n- 22h30 : Prières d\'intercession par groupes\n- 00h00 : Veillée de minuit\n- 03h00 : Prières de victoire\n- 05h30 : Clôture et petit déjeuner communautaire',
      status: 'UPCOMING' as const,
      startDate: new Date(now.getTime() + 7 * 86400000),
      endDate:   new Date(now.getTime() + 7 * 86400000 + 12 * 3600000),
      location: 'CMD Siège Central, Pointe-Noire',
      coverUrl: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1200&h=630&fit=crop',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      churchId: church.id,
    },
    {
      id: 'event-concert-1',
      title: 'Concert de Louange — Feu Sacré',
      slug: 'concert-louange-feu-sacre',
      description: 'Un concert exceptionnel de louange et d\'adoration avec nos équipes musicales et des artistes invités. Une soirée pour glorifier Dieu ensemble.',
      content: 'Le Concert de Louange "Feu Sacré" est un événement annuel qui rassemble des milliers de fidèles pour une soirée inoubliable.\n\nArtistes invités :\n- Chorale CMD Siège\n- Groupe de Jeunes "New Generation"\n- Artistes invités surprise\n\nEntrée libre. Venez en famille !',
      status: 'UPCOMING' as const,
      startDate: new Date(now.getTime() + 14 * 86400000),
      endDate:   new Date(now.getTime() + 14 * 86400000 + 4 * 3600000),
      location: 'Palais des Congrès de Pointe-Noire',
      coverUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&h=630&fit=crop',
      videoUrl: 'https://www.youtube.com/watch?v=Ke90Tje7VS0',
      churchId: church.id,
    },
    {
      id: 'event-bapteme-1',
      title: 'Journée des Baptêmes',
      slug: 'journee-baptemes',
      description: 'Célébrons ensemble les nouveaux convertis qui feront le pas du baptême par immersion. Venez témoigner de leur engagement pour Christ.',
      content: 'La journée des baptêmes est un moment solennel et joyeux dans la vie de notre communauté.\n\nLes candidats au baptême ont suivi un cours de préparation de 8 semaines.\n\nProgramme :\n- 9h00 : Culte d\'ouverture\n- 10h00 : Témoignages des candidats\n- 11h00 : Baptêmes par immersion\n- 13h00 : Repas communautaire',
      status: 'UPCOMING' as const,
      startDate: new Date(now.getTime() + 21 * 86400000),
      location: 'Plage de la Côte Sauvage, Pointe-Noire',
      coverUrl: 'https://images.unsplash.com/photo-1504275107627-0c2ba7a43dba?w=1200&h=630&fit=crop',
      churchId: church.id,
    },
    {
      id: 'event-passe-1',
      title: 'Culte de Rentrée Pastorale',
      slug: 'culte-rentree-pastorale',
      description: 'Le culte de rentrée qui a marqué le début d\'une nouvelle saison spirituelle pour toute la communauté.',
      content: 'Ce culte de rentrée a été un moment fort de notre année.\n\nPlus de 500 personnes étaient présentes pour ce culte historique.',
      status: 'COMPLETED' as const,
      startDate: new Date(now.getTime() - 7 * 86400000),
      location: 'CMD Siège Central, Pointe-Noire',
      coverUrl: 'https://images.unsplash.com/photo-1438232992991-995b671e4468?w=1200&h=630&fit=crop',
      videoUrl: 'https://www.youtube.com/watch?v=Ke90Tje7VS0',
      churchId: church.id,
    },
  ]
  for (const ev of events) {
    await prisma.event.upsert({ where: { id: ev.id }, update: ev, create: ev })
  }

  // ── Publications (posts) ──────────────────────────────────────────────────
  const posts = [
    {
      id: 'post-sermon-1',
      title: 'La Puissance de la Prière Persistante',
      slug: 'puissance-priere-persistante',
      excerpt: 'Découvrez comment la prière persistante transforme les situations impossibles et déplace les montagnes dans votre vie.',
      content: `## Introduction\n\nLa prière est la communion intime de l'âme avec Dieu. Elle n'est pas un rituel, mais une relation vivante.\n\n## Luc 18 : La parabole de la veuve\n\n> Priez toujours et ne vous découragez pas.\n\nJésus nous enseigne par cette parabole que la persévérance dans la prière est une clé fondamentale de la vie chrétienne.\n\n## Trois principes de la prière persistante\n\n**1. La foi active**\nLa prière sans foi est comme un oiseau sans ailes. Vous devez croire que Dieu entend et qu'Il répond.\n\n**2. La persévérance**\nDaniel a prié 21 jours avant de recevoir sa réponse. Ne lâchez pas !\n\n**3. La soumission à la volonté de Dieu**\nLa vraie prière commence par : "Que ta volonté soit faite."\n\n## Conclusion\n\nLa prière persistante n'est pas une manière de forcer la main de Dieu, mais d'aligner notre cœur avec Sa volonté parfaite.`,
      type: 'SERMON' as const,
      status: 'PUBLISHED' as const,
      coverUrl: 'https://images.unsplash.com/photo-1476231682828-37e571bc172f?w=1200&h=630&fit=crop',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      publishedAt: new Date(now.getTime() - 2 * 86400000),
      authorId: pastor.id,
      churchId: church.id,
    },
    {
      id: 'post-article-1',
      title: 'Comment Lire la Bible en 1 An',
      slug: 'comment-lire-bible-1-an',
      excerpt: 'Un plan de lecture pratique pour parcourir toute la Bible en une année et approfondir votre connaissance des Écritures.',
      content: `## Pourquoi lire toute la Bible ?\n\nLa Bible est la Parole vivante de Dieu. Chaque livre, chaque chapitre révèle un aspect de Son caractère et de Son plan de salut.\n\n## Le plan de lecture\n\n**Matin (15 min)**\n- 1 chapitre de l'Ancien Testament\n- 1 Psaume\n\n**Soir (10 min)**\n- 1 chapitre du Nouveau Testament\n- 1 Proverbe\n\n## Conseils pratiques\n\n**Choisissez une version adaptée**\nLa Bible en Français Courant est idéale pour les nouveaux lecteurs.\n\n**Tenez un journal**\nNotez les versets qui vous touchent et ce que Dieu vous dit à travers eux.\n\n## Conclusion\n\nEn une année, vous aurez parcouru 66 livres, 1 189 chapitres et 31 102 versets. Votre vie ne sera plus jamais la même.`,
      type: 'ARTICLE' as const,
      status: 'PUBLISHED' as const,
      coverUrl: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1200&h=630&fit=crop',
      publishedAt: new Date(now.getTime() - 5 * 86400000),
      authorId: superAdmin.id,
      churchId: church.id,
    },
    {
      id: 'post-sermon-2',
      title: 'Feu Sacré — Message du Concert',
      slug: 'feu-sacre-message-concert',
      excerpt: 'La prédication complète du concert de louange Feu Sacré. Un message puissant sur le renouveau spirituel et la présence de Dieu.',
      content: `## Actes 2 : Le jour de la Pentecôte\n\n> Ils furent tous remplis du Saint-Esprit.\n\nCe soir, nous voulons retrouver ce feu des origines.\n\n## Qu'est-ce que le feu sacré ?\n\n**1. Purifie** — Comme l'or dans la fournaise, le feu de Dieu brûle les impuretés.\n\n**2. Réchauffe** — Un cœur froid reprend vie au contact du feu divin.\n\n**3. Illumine** — Il chasse les ténèbres et révèle le chemin.\n\n## Appel\n\nCe soir, si votre feu s'est éteint, venez le rallumer.`,
      type: 'SERMON' as const,
      status: 'PUBLISHED' as const,
      coverUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=630&fit=crop',
      videoUrl: 'https://www.youtube.com/watch?v=Ke90Tje7VS0',
      publishedAt: new Date(now.getTime() - 1 * 86400000),
      authorId: pastor.id,
      churchId: church.id,
    },
    {
      id: 'post-testimony-1',
      title: 'Témoignage : Guérie d\'un Cancer en Phase Terminale',
      slug: 'temoignage-guerison-cancer',
      excerpt: 'Sœur Rachel partage son témoignage bouleversant : comment Dieu l\'a guérie d\'un cancer en phase terminale après des années de combat et de foi.',
      content: `## Mon histoire\n\nEn 2021, les médecins m'ont annoncé que j'avais un cancer du foie en phase terminale. J'avais 3 mois à vivre.\n\n## Le miracle\n\nTrois semaines plus tard, lors d'un nouveau scanner :\n\n> "Madame, il n'y a plus de trace du cancer."\n\n## Ma vie aujourd'hui\n\nAujourd'hui, je chante dans le chœur de CMD Pointe-Noire. **Ne lâchez pas !** Dieu tient encore des miracles.`,
      type: 'TESTIMONY' as const,
      status: 'PUBLISHED' as const,
      coverUrl: 'https://images.unsplash.com/photo-1519985176271-adb1088fa94c?w=1200&h=630&fit=crop',
      publishedAt: new Date(now.getTime() - 3 * 86400000),
      authorId: superAdmin.id,
      churchId: church.id,
    },
    {
      id: 'post-draft-1',
      title: 'Annonce : Camp de Jeunes 2025',
      slug: 'annonce-camp-jeunes-2025',
      excerpt: 'Inscriptions ouvertes pour le camp de jeunes annuel de la CMD à Pointe-Noire.',
      content: 'Contenu en cours de rédaction...',
      type: 'ANNOUNCEMENT' as const,
      status: 'DRAFT' as const,
      authorId: superAdmin.id,
      churchId: church.id,
    },
  ]
  for (const p of posts) {
    await prisma.post.upsert({ where: { id: p.id }, update: p, create: p })
  }

  // ── Baptêmes ──────────────────────────────────────────────────────────────
  const memberAnge  = await prisma.member.findUnique({ where: { id: 'member-ange'  } })
  const memberGrace = await prisma.member.findUnique({ where: { id: 'member-grace' } })
  if (memberAnge) {
    await prisma.baptism.upsert({
      where:  { id: 'baptism-ange' },
      update: {},
      create: { id: 'baptism-ange', baptismType: 'WATER', baptismDate: new Date('2024-03-15'), location: 'Plage de la Côte Sauvage, Pointe-Noire', officiant: 'Pasteur Jean Nganga', certificateNo: 'CMD-2024-001', memberId: memberAnge.id }
    })
  }
  if (memberGrace) {
    await prisma.baptism.upsert({
      where:  { id: 'baptism-grace' },
      update: {},
      create: { id: 'baptism-grace', baptismType: 'HOLY_SPIRIT', baptismDate: new Date('2024-06-08'), location: 'CMD Siège Central, Pointe-Noire', officiant: 'Pasteur Jean Nganga', certificateNo: 'CMD-2024-002', memberId: memberGrace.id }
    })
  }

  console.log('✅ Seed terminé')
  console.log('')
  console.log('Comptes créés :')
  console.log('  Super Admin : admin@cmd.cg / Admin@2024!')
  console.log('  Pasteur     : pasteur@cmd.cg / Pasteur@2024!')
  console.log('  Média       : media@cmd.cg / Media@2024!')
  console.log('  Baptême     : bapteme@cmd.cg / Bapteme@2024!')
  console.log('')
  console.log(`ID de l'église principale : ${church.id}`)
  console.log('→ Copiez cet ID dans MAIN_CHURCH_ID et NEXT_PUBLIC_DEFAULT_CHURCH_ID dans votre .env')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())