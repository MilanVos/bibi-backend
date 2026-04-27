import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { hashPassword } from "@better-auth/utils/password"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter } as any)

async function main() {
  console.log("🌱 Database seeden...")

  const existing = await db.user.findFirst({ where: { role: "SUPERADMIN" } })
  if (!existing) {
    const hashedPassword = await hashPassword("Admin@123!")

    const admin = await db.user.create({
      data: {
        name: "Beheerder",
        email: "admin@jongerenraadd.nl",
        role: "SUPERADMIN",
        status: "ACTIVE",
        twoFactorEnabled: false,
        emailVerified: true,
      },
    })

    await db.account.create({
      data: {
        userId: admin.id,
        accountId: admin.id,
        providerId: "credential",
        password: hashedPassword,
      },
    })

    console.log("✅ Admin account aangemaakt:")
    console.log("   E-mail: admin@jongerenraadd.nl")
    console.log("   Wachtwoord: Admin@123!")
  } else {
    console.log("ℹ️  Admin account bestaat al")
  }

  const catCount = await db.category.count()
  if (catCount === 0) {
    const algemeen = await db.category.create({ data: { name: "Algemeen", sortOrder: 0 } })
    const docs = await db.category.create({ data: { name: "Documenten", sortOrder: 1 } })
    const community = await db.category.create({ data: { name: "Community", sortOrder: 2 } })

    const nieuws = await db.module.create({
      data: { type: "nieuws", name: "Nieuws", icon: "nieuws", route: "/nieuws", enabled: true, sortOrder: 0 },
    })
    const documenten = await db.module.create({
      data: { type: "documenten", name: "Documenten", icon: "documenten", route: "/documenten", enabled: true, sortOrder: 1 },
    })
    const forum = await db.module.create({
      data: { type: "forum", name: "Forum", icon: "forum", route: "/forum", enabled: true, sortOrder: 0 },
    })

    await db.menuItem.createMany({
      data: [
        { categoryId: algemeen.id, label: "Nieuws", linkType: "MODULE", moduleId: nieuws.id, sortOrder: 0, icon: "nieuws" },
        { categoryId: docs.id, label: "Documenten", linkType: "MODULE", moduleId: documenten.id, sortOrder: 0, icon: "documenten" },
        { categoryId: community.id, label: "Forum", linkType: "MODULE", moduleId: forum.id, sortOrder: 0, icon: "forum" },
      ],
    })

    console.log("✅ Standaard categorieën en modules aangemaakt")
  }

  const settingCount = await db.siteSetting.count()
  if (settingCount === 0) {
    await db.siteSetting.createMany({
      data: [
        { key: "site_name", value: "Jongerenraad" },
        { key: "two_factor_required", value: "true" },
        { key: "allow_registration", value: "true" },
        { key: "admin_email", value: "admin@jongerenraadd.nl" },
      ],
    })
    console.log("✅ Site instellingen aangemaakt")
  }

  console.log("\n✅ Seed voltooid!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
