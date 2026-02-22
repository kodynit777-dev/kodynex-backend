import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const DEMO_SLUG = 'demo';

  const OWNER_PHONE = '+966500000000';
  const CUSTOMER_PHONE = '+966511111111';

  console.log('🌱 Running enterprise seed...');

  /* =========================
     1) Owner
  ========================= */

  const owner = await prisma.user.upsert({
    where: { phoneE164: OWNER_PHONE },
    update: {},
    create: {
      phoneE164: OWNER_PHONE,
      password: 'demo123456',
      name: 'Demo Owner',
      role: UserRole.OWNER,
      phoneVerifiedAt: new Date(),
    },
  });

  console.log('✅ Owner ready');

  /* =========================
     2) Customer
  ========================= */

  const customer = await prisma.user.upsert({
    where: { phoneE164: CUSTOMER_PHONE },
    update: {},
    create: {
      phoneE164: CUSTOMER_PHONE,
      password: 'demo123456',
      name: 'Demo Customer',
      role: UserRole.CUSTOMER,
      phoneVerifiedAt: new Date(),
    },
  });

  console.log('✅ Customer ready');

  /* =========================
     3) Restaurant
  ========================= */

  const restaurant = await prisma.restaurant.upsert({
    where: { slug: DEMO_SLUG },
    update: {},
    create: {
      name: 'Demo Restaurant',
      slug: DEMO_SLUG,
      description: 'Auto generated demo restaurant',
      ownerId: owner.id,
    },
  });

  console.log('✅ Restaurant ready');

  /* =========================
     4) Tenant Settings
  ========================= */

  await prisma.tenantSetting.upsert({
    where: { restaurantId: restaurant.id },
    update: {},
    create: {
      restaurantId: restaurant.id,
      flags: {
        payments: { enabled: false },
        loyalty: { enabled: false },
      },
      theme: {
        primary: '#0ea5e9',
        secondary: '#22c55e',
      },
    },
  });

  console.log('✅ Tenant settings ready');

  /* =========================
     5) Branch
  ========================= */

  const branch = await prisma.branch.upsert({
    where: {
      id: 'demo-branch', // fixed id for repeatable seed
    },
    update: {},
    create: {
      id: 'demo-branch',
      name: 'Main Branch',
      restaurantId: restaurant.id,
      address: 'Riyadh',
      phone: '+966500000000',
      isActive: true,
    },
  });

  console.log('✅ Branch ready');

  /* =========================
     6) Products
  ========================= */

  const products = [
    {
      name: 'Classic Burger',
      price: 25.0,
      description: 'Beef burger with cheese',
    },
    {
      name: 'Chicken Wrap',
      price: 18.0,
      description: 'Grilled chicken wrap',
    },
    {
      name: 'French Fries',
      price: 7.5,
      description: 'Crispy fries',
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: {
        name_restaurantId: {
          name: p.name,
          restaurantId: restaurant.id,
        },
      },
      update: {
        price: p.price,
        description: p.description,
      },
      create: {
        ...p,
        restaurantId: restaurant.id,
      },
    });
  }

  console.log('✅ Products ready');

  console.log('🎉 Enterprise seed finished successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
