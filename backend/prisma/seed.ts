import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Hash helper
  const hash = (pw: string) => bcrypt.hashSync(pw, 10);

  // 1 System Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@rolex.com' },
    update: {},
    create: {
      name: 'System Administrator Account',
      email: 'admin@rolex.com',
      passwordHash: hash('Admin@123'),
      address: '1 Admin Street, Admin City, 10001',
      role: Role.SYSTEM_ADMIN,
    },
  });

  // 3 Normal Users
  const user1 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      name: 'Alice Johnson a normal user here',
      email: 'alice@example.com',
      passwordHash: hash('Password@123'),
      address: '10 Maple Avenue, Springfield, 62701',
      role: Role.NORMAL_USER,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      name: 'Robert Smith a normal user member',
      email: 'bob@example.com',
      passwordHash: hash('Password@123'),
      address: '25 Oak Street, Rivertown, 52401',
      role: Role.NORMAL_USER,
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'carol@example.com' },
    update: {},
    create: {
      name: 'Carol Davis a normal user person',
      email: 'carol@example.com',
      passwordHash: hash('Password@123'),
      address: '7 Pine Lane, Hill Valley, 91203',
      role: Role.NORMAL_USER,
    },
  });

  // 2 Store owners
  const owner1 = await prisma.user.upsert({
    where: { email: 'owner1@example.com' },
    update: {},
    create: {
      name: 'David Wilson a store owner member',
      email: 'owner1@example.com',
      passwordHash: hash('Owner@123'),
      address: '100 Market Street, Commerce City, 30301',
      role: Role.STORE_OWNER,
    },
  });

  const owner2 = await prisma.user.upsert({
    where: { email: 'owner2@example.com' },
    update: {},
    create: {
      name: 'Emma Brown a store owner person',
      email: 'owner2@example.com',
      passwordHash: hash('Owner@123'),
      address: '200 Trade Road, Merchantville, 19102',
      role: Role.STORE_OWNER,
    },
  });

  // 5 Stores
  const store1 = await prisma.store.upsert({
    where: { id: 'store-seed-1' },
    update: {},
    create: {
      id: 'store-seed-1',
      name: 'Tech Haven Electronics Store',
      email: 'techhaven@stores.com',
      address: '12 Gadget Lane, Tech District, 20001',
      ownerId: owner1.id,
    },
  });

  const store2 = await prisma.store.upsert({
    where: { id: 'store-seed-2' },
    update: {},
    create: {
      id: 'store-seed-2',
      name: 'Fresh Mart Grocery Outlet',
      email: 'freshmart@stores.com',
      address: '45 Market Place, Fresh District, 33201',
      ownerId: owner1.id,
    },
  });

  const store3 = await prisma.store.upsert({
    where: { id: 'store-seed-3' },
    update: {},
    create: {
      id: 'store-seed-3',
      name: 'Urban Threads Clothing Boutique',
      email: 'urbanthreads@stores.com',
      address: '78 Fashion Boulevard, Style City, 75201',
      ownerId: owner2.id,
    },
  });

  const store4 = await prisma.store.upsert({
    where: { id: 'store-seed-4' },
    update: {},
    create: {
      id: 'store-seed-4',
      name: 'Home Comfort Furniture Gallery',
      email: 'homecomfort@stores.com',
      address: '33 Cozy Corner, Living Quarter, 60601',
      ownerId: owner2.id,
    },
  });

  const store5 = await prisma.store.upsert({
    where: { id: 'store-seed-5' },
    update: {},
    create: {
      id: 'store-seed-5',
      name: 'Page Turner Bookshop and Cafe',
      email: 'pageturner@stores.com',
      address: '90 Literary Lane, Booktown, 14401',
      ownerId: owner1.id,
    },
  });

  // Several Ratings (unique per user-store pair)
  const ratings = [
    { user: user1, store: store1, rating: 5 },
    { user: user2, store: store1, rating: 4 },
    { user: user3, store: store1, rating: 5 },
    { user: user1, store: store2, rating: 3 },
    { user: user2, store: store2, rating: 4 },
    { user: user1, store: store3, rating: 5 },
    { user: user3, store: store3, rating: 2 },
    { user: user2, store: store4, rating: 4 },
    { user: user3, store: store4, rating: 5 },
    { user: user1, store: store5, rating: 4 },
    { user: user2, store: store5, rating: 3 },
    { user: user3, store: store5, rating: 5 },
  ];

  for (const r of ratings) {
    await prisma.rating.upsert({
      where: {
        userId_storeId: { userId: r.user.id, storeId: r.store.id },
      },
      update: { rating: r.rating },
      create: {
        userId: r.user.id,
        storeId: r.store.id,
        rating: r.rating,
      },
    });
  }

  console.log('✅ Seed complete!');
  console.log('---');
  console.log('Admin:    admin@rolex.com / Admin@123');
  console.log('Users:    alice@example.com, bob@example.com, carol@example.com / Password@123');
  console.log('Owners:   owner1@example.com, owner2@example.com / Owner@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
