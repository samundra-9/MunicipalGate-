import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // -----------------
  // 1. ROLES
  // -----------------
  const roles = await prisma.role.createMany({
    data: [
      { name: "USER" },
      { name: "MUNICIPAL_ADMIN" },
      { name: "CENTRAL_ADMIN" }
    ],
    skipDuplicates: true
  });

  const userRole = await prisma.role.findUnique({ where: { name: "USER" } });
  const municipalAdminRole = await prisma.role.findUnique({ where: { name: "MUNICIPAL_ADMIN" } });
  const centralAdminRole = await prisma.role.findUnique({ where: { name: "CENTRAL_ADMIN" } });

  // -----------------
  // 2. GEOGRAPHY
  // -----------------
  const province = await prisma.province.create({
    data: { name: "Bagmati Province" }
  });

  const district = await prisma.district.create({
    data: {
      name: "Kathmandu",
      provinceId: province.id
    }
  });

  const municipality = await prisma.municipality.create({
    data: {
      name: "Kathmandu Metropolitan City",
      districtId: district.id
    }
  });

  // -----------------
  // 3. USERS
  // -----------------
  const password = await bcrypt.hash("password123", 10);

  const centralAdmin = await prisma.user.create({
    data: {
      name: "Central Admin",
      email: "central@admin.com",
      passwordHash: password,
      roleId: centralAdminRole.id
    }
  });

  const municipalAdmin = await prisma.user.create({
    data: {
      name: "Municipal Admin",
      email: "municipal@admin.com",
      passwordHash: password,
      roleId: municipalAdminRole.id,
      municipalityId: municipality.id
    }
  });

  const normalUser = await prisma.user.create({
    data: {
      name: "Normal User",
      email: "user@test.com",
      passwordHash: password,
      roleId: userRole.id
    }
  });

  console.log("✅ Seed completed");
  console.log({
    centralAdmin: centralAdmin.email,
    municipalAdmin: municipalAdmin.email,
    normalUser: normalUser.email
  });
}

main()
  .catch((e) => {
    console.error("❌ Seed failed", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
