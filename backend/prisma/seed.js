const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with Indian entities (JavaScript)...');

  const hash = (pw) => bcrypt.hashSync(pw, 10);

  // 1 System Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@rolex.com' },
    update: {
      name: 'Rajesh Kumar Sharma Admin',
      address: 'Flat 402, Shanti Kunj, Civil Lines, New Delhi 110054',
    },
    create: {
      name: 'Rajesh Kumar Sharma Admin',
      email: 'admin@rolex.com',
      passwordHash: hash('Admin@123'),
      address: 'Flat 402, Shanti Kunj, Civil Lines, New Delhi 110054',
      role: 'SYSTEM_ADMIN',
    },
  });

  // 2 Store Owners
  const owner1 = await prisma.user.upsert({
    where: { email: 'owner1@example.com' },
    update: {
      name: 'Rameshwar Nath Agarwal',
      address: 'Shop 12, MG Road, Camp, Pune, Maharashtra 411001',
    },
    create: {
      name: 'Rameshwar Nath Agarwal',
      email: 'owner1@example.com',
      passwordHash: hash('Owner@123'),
      address: 'Shop 12, MG Road, Camp, Pune, Maharashtra 411001',
      role: 'STORE_OWNER',
    },
  });

  const owner2 = await prisma.user.upsert({
    where: { email: 'owner2@example.com' },
    update: {
      name: 'Priya Venkatesh Sundaram',
      address: '15 Indiranagar 100ft Road, Bengaluru, Karnataka 560038',
    },
    create: {
      name: 'Priya Venkatesh Sundaram',
      email: 'owner2@example.com',
      passwordHash: hash('Owner@123'),
      address: '15 Indiranagar 100ft Road, Bengaluru, Karnataka 560038',
      role: 'STORE_OWNER',
    },
  });

  // Normal Users (Customers & Reviewers)
  const user1 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {
      name: 'Aarav Rajesh Kulkarni',
      address: 'Flat 301, Ganga Heights, Kothrud, Pune, Maharashtra 411038',
    },
    create: {
      name: 'Aarav Rajesh Kulkarni',
      email: 'alice@example.com',
      passwordHash: hash('Password@123'),
      address: 'Flat 301, Ganga Heights, Kothrud, Pune, Maharashtra 411038',
      role: 'NORMAL_USER',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {
      name: 'Ananya Suresh Iyer Pune',
      address: '24 Temple Rock Road, Mylapore, Chennai, Tamil Nadu 600004',
    },
    create: {
      name: 'Ananya Suresh Iyer Pune',
      email: 'bob@example.com',
      passwordHash: hash('Password@123'),
      address: '24 Temple Rock Road, Mylapore, Chennai, Tamil Nadu 600004',
      role: 'NORMAL_USER',
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'carol@example.com' },
    update: {
      name: 'Rohan Deepak Deshmukh',
      address: 'Plot 18, Banjara Hills Road No 10, Hyderabad, Telangana 500034',
    },
    create: {
      name: 'Rohan Deepak Deshmukh',
      email: 'carol@example.com',
      passwordHash: hash('Password@123'),
      address: 'Plot 18, Banjara Hills Road No 10, Hyderabad, Telangana 500034',
      role: 'NORMAL_USER',
    },
  });

  const user4 = await prisma.user.upsert({
    where: { email: 'irfan@example.com' },
    update: {
      name: 'Mohammed Irfan Tamboli',
      address: 'Building 5, Shivaji Nagar, Pune, Maharashtra 411016',
    },
    create: {
      name: 'Mohammed Irfan Tamboli',
      email: 'irfan@example.com',
      passwordHash: hash('Password@123'),
      address: 'Building 5, Shivaji Nagar, Pune, Maharashtra 411016',
      role: 'NORMAL_USER',
    },
  });

  const user5 = await prisma.user.upsert({
    where: { email: 'pooja@example.com' },
    update: {
      name: 'Pooja Chandrashekhar Nair',
      address: 'B-702, Sea Breeze, Marine Lines, Mumbai, Maharashtra 400020',
    },
    create: {
      name: 'Pooja Chandrashekhar Nair',
      email: 'pooja@example.com',
      passwordHash: hash('Password@123'),
      address: 'B-702, Sea Breeze, Marine Lines, Mumbai, Maharashtra 400020',
      role: 'NORMAL_USER',
    },
  });

  // Stores
  const store1 = await prisma.store.upsert({
    where: { id: 'store-seed-1' },
    update: {
      name: 'Shree Ganesh Supermarket & Kirana',
      email: 'shreeganesh@kirana.in',
      address: 'Shop 12, MG Road, Camp, Pune, Maharashtra 411001',
      ownerId: owner1.id,
    },
    create: {
      id: 'store-seed-1',
      name: 'Shree Ganesh Supermarket & Kirana',
      email: 'shreeganesh@kirana.in',
      address: 'Shop 12, MG Road, Camp, Pune, Maharashtra 411001',
      ownerId: owner1.id,
    },
  });

  const store2 = await prisma.store.upsert({
    where: { id: 'store-seed-2' },
    update: {
      name: 'Suruchi Mithai & Farsan Sweets',
      email: 'suruchimithai@sweets.in',
      address: 'Plot 45, FC Road, Shivajinagar, Pune, Maharashtra 411005',
      ownerId: owner1.id,
    },
    create: {
      id: 'store-seed-2',
      name: 'Suruchi Mithai & Farsan Sweets',
      email: 'suruchimithai@sweets.in',
      address: 'Plot 45, FC Road, Shivajinagar, Pune, Maharashtra 411005',
      ownerId: owner1.id,
    },
  });

  const store3 = await prisma.store.upsert({
    where: { id: 'store-seed-3' },
    update: {
      name: 'FabIndia Ethnic Heritage Studio',
      email: 'heritagefabrics@stores.in',
      address: '18 Commercial Street, Bengaluru, Karnataka 560001',
      ownerId: owner2.id,
    },
    create: {
      id: 'store-seed-3',
      name: 'FabIndia Ethnic Heritage Studio',
      email: 'heritagefabrics@stores.in',
      address: '18 Commercial Street, Bengaluru, Karnataka 560001',
      ownerId: owner2.id,
    },
  });

  const store4 = await prisma.store.upsert({
    where: { id: 'store-seed-4' },
    update: {
      name: 'Royal Rajasthan Handicrafts Mart',
      email: 'royalrajasthan@crafts.in',
      address: 'B-14, MI Road, Mansarovar, Jaipur, Rajasthan 302001',
      ownerId: owner2.id,
    },
    create: {
      id: 'store-seed-4',
      name: 'Royal Rajasthan Handicrafts Mart',
      email: 'royalrajasthan@crafts.in',
      address: 'B-14, MI Road, Mansarovar, Jaipur, Rajasthan 302001',
      ownerId: owner2.id,
    },
  });

  const store5 = await prisma.store.upsert({
    where: { id: 'store-seed-5' },
    update: {
      name: 'Crossword & Chai Book Cafe Store',
      email: 'crosswordchai@books.in',
      address: 'Unit 204, Phoenix Marketcity, Kurla, Mumbai 400070',
      ownerId: owner1.id,
    },
    create: {
      id: 'store-seed-5',
      name: 'Crossword & Chai Book Cafe Store',
      email: 'crosswordchai@books.in',
      address: 'Unit 204, Phoenix Marketcity, Kurla, Mumbai 400070',
      ownerId: owner1.id,
    },
  });

  // Ratings
  const ratings = [
    { user: user1, store: store1, rating: 5 },
    { user: user2, store: store1, rating: 4 },
    { user: user3, store: store1, rating: 5 },
    { user: user4, store: store1, rating: 5 },
    { user: user5, store: store1, rating: 4 },

    { user: user1, store: store2, rating: 4 },
    { user: user2, store: store2, rating: 5 },
    { user: user4, store: store2, rating: 5 },

    { user: user1, store: store3, rating: 5 },
    { user: user3, store: store3, rating: 4 },
    { user: user5, store: store3, rating: 4 },

    { user: user2, store: store4, rating: 4 },
    { user: user3, store: store4, rating: 5 },
    { user: user4, store: store4, rating: 5 },

    { user: user1, store: store5, rating: 5 },
    { user: user2, store: store5, rating: 4 },
    { user: user3, store: store5, rating: 5 },
    { user: user5, store: store5, rating: 4 },
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

  console.log('✅ Seed completed successfully with JavaScript!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
