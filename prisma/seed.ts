import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding...')

  // Organisation
  const org = await prisma.organisation.upsert({
    where: { id: 'org-cmdg' },
    update: {},
    create: { id: 'org-cmdg', name: 'CMDG — Communauté des Messagers de Dieu', description: 'Ministère Mondial d\'Évangélisation et d\'Action Sociale', website: 'https://cmdg.org' }
  })

  // Église principale
  const church = await prisma.church.upsert({
    where: { id: 'church-main' },
    update: {},
    create: { id: 'church-main', name: 'CMDG Siège Central', city: 'Pointe-Noire', country: 'CG', organisationId: org.id, email: 'contact@cmdg.org' }
  })

  const hash = (p: string) => bcrypt.hashSync(p, 12)

  // Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@cmdg.org' },
    update: {},
    create: { email: 'admin@cmdg.org', password: hash('Admin@2024!'), firstName: 'Samuel', lastName: 'Kabongo', role: 'SUPER_ADMIN', organisationId: org.id }
  })

  // Pasteur
  const pastor = await prisma.user.upsert({
    where: { email: 'pasteur@cmdg.org' },
    update: {},
    create: { email: 'pasteur@cmdg.org', password: hash('Pasteur@2024!'), firstName: 'Jean', lastName: 'Mukendi', role: 'PASTOR', organisationId: org.id }
  })

  // Gestionnaire media
  await prisma.user.upsert({
    where: { email: 'media@cmdg.org' },
    update: {},
    create: { email: 'media@cmdg.org', password: hash('Media@2024!'), firstName: 'Marie', lastName: 'Ntumba', role: 'MEDIA_MANAGER', organisationId: org.id }
  })

  // Enseignant baptême
  await prisma.user.upsert({
    where: { email: 'bapteme@cmdg.org' },
    update: {},
    create: { email: 'bapteme@cmdg.org', password: hash('Bapteme@2024!'), firstName: 'Pierre', lastName: 'Mwamba', role: 'BAPTISM_TEACHER', organisationId: org.id }
  })

  // Lier pasteur à l'église
  await prisma.church.update({ where: { id: church.id }, data: { pastorId: pastor.id } })

  // UserChurch
  await prisma.userChurch.upsert({ where: { userId_churchId: { userId: superAdmin.id, churchId: church.id } }, update: {}, create: { userId: superAdmin.id, churchId: church.id, role: 'SUPER_ADMIN' } })
  await prisma.userChurch.upsert({ where: { userId_churchId: { userId: pastor.id, churchId: church.id } }, update: {}, create: { userId: pastor.id, churchId: church.id, role: 'PASTOR' } })

  // Départements
  const depts = ['Louange & Adoration', 'Jeunesse', 'Femmes', 'Évangélisation', 'Diacres']
  for (const name of depts) {
    await prisma.department.upsert({
      where: { id: `dept-${name.toLowerCase().replace(/\s+/g, '-').slice(0, 10)}` },
      update: {},
      create: { id: `dept-${name.toLowerCase().replace(/\s+/g, '-').slice(0, 10)}`, name, churchId: church.id }
    })
  }

  // Membres
  const membres = [
    { firstName: 'Ange', lastName: 'Lusamba' }, { firstName: 'Grace', lastName: 'Kabila' },
    { firstName: 'David', lastName: 'Tshimanga' }, { firstName: 'Esther', lastName: 'Nzuzi' },
  ]
  for (const m of membres) {
    await prisma.member.upsert({
      where: { id: `member-${m.firstName.toLowerCase()}` },
      update: {},
      create: { id: `member-${m.firstName.toLowerCase()}`, ...m, churchId: church.id }
    })
  }

  console.log('✅ Seed terminé')
  console.log('')
  console.log('Comptes créés :')
  console.log('  Super Admin : admin@cmdg.org / Admin@2024!')
  console.log('  Pasteur     : pasteur@cmdg.org / Pasteur@2024!')
  console.log('  Média       : media@cmdg.org / Media@2024!')
  console.log('  Baptême     : bapteme@cmdg.org / Bapteme@2024!')
  console.log('')
  console.log(`ID de l'église principale : ${church.id}`)
  console.log('→ Copiez cet ID dans NEXT_PUBLIC_DEFAULT_CHURCH_ID dans votre .env')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
