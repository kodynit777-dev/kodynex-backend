import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const DEMO_SLUG = 'demo';
  const DEMO_PHONE = '+966500000000';

  console.log('🌱 Running seed...');

  /* =========================
     1) Upsert Owner
  ========================= */

  const owner = await prisma.user.upsert({
    where: {
      phoneE164: DEMO_PHONE,
    },
    update: {},

    create: {
      phoneE164: DEMO_PHONE,
      password: 'demo123456', // غيّره لاحقًا
      name: 'Demo Owner',
      role: UserRole.OWNER,
      phoneVerifiedAt: new Date(),
    },
  });

  console.log('✅ Demo owner ready');

  /* =========================
     2) Upsert Restaurant
  ========================= */

  await prisma.restaurant.upsert({
    where: {
      slug: DEMO_SLUG, // ⭐ مفتاح النظام
    },
    update: {},

    create: {
      name: 'Demo Restaurant',
      slug: DEMO_SLUG, // ⭐ لازم يطابق URL
      description: 'Auto generated demo restaurant',
      ownerId: owner.id,
    },
  });

  console.log('✅ Demo restaurant ready');

  console.log('🎉 Seed finished');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
