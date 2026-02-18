import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const DEMO_SLUG = 'demo';
  const DEMO_PHONE = '+966500000000';

  console.log('🌱 Running seed...');

  /* =========================
     1) Create / Get Owner
  ========================= */

  let owner = await prisma.user.findUnique({
    where: { phoneE164: DEMO_PHONE },
  });

  if (!owner) {
    owner = await prisma.user.create({
      data: {
        phoneE164: DEMO_PHONE,
        password: 'demo123456', // غيّره لاحقًا
        name: 'Demo Owner',
        role: UserRole.OWNER,
        phoneVerifiedAt: new Date(),
      },
    });

    console.log('✅ Demo owner created');
  } else {
    console.log('ℹ️ Demo owner already exists');
  }

  /* =========================
     2) Create / Get Restaurant
  ========================= */

  const existingRestaurant = await prisma.restaurant.findUnique({
    where: { slug: DEMO_SLUG },
  });

  if (!existingRestaurant) {
    await prisma.restaurant.create({
      data: {
        name: 'Demo Restaurant',
        slug: DEMO_SLUG,
        description: 'Auto generated demo restaurant',
        ownerId: owner.id,
      },
    });

    console.log('✅ Demo restaurant created');
  } else {
    console.log('ℹ️ Demo restaurant already exists');
  }

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
