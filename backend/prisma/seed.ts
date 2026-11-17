import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
<<<<<<< HEAD
  console.log('🌱 Seeding database with Indian entities...');
=======
  console.log('🌱 Seeding database...');
>>>>>>> 493f6a0f891c9d61fe14c29614d9746d9441a9ef

  // Hash helper
  const hash = (pw: string) => bcrypt.hashSync(pw, 10);

  // 1 System Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@rolex.com' },
<<<<<<< HEAD
    update: {
      name: 'Rajesh Kumar Sharma Admin',
      address: 'Flat 402, Shanti Kunj, Civil Lines, New Delhi 110054',
    },
    create: {
      name: 'Rajesh Kumar Sharma Admin',
      email: 'admin@rolex.com',
      passwordHash: hash('Admin@123'),
      address: 'Flat 402, Shanti Kunj, Civil Lines, New Delhi 110054',
=======
    update: {},
    create: {
      name: 'System Administrator Account',
      email: 'admin@rolex.com',
      passwordHash: hash('Admin@123'),
      address: '1 Admin Street, Admin City, 10001',
>>>>>>> 493f6a0f891c9d61fe14c29614d9746d9441a9ef
      role: Role.SYSTEM_ADMIN,
    },
  });

<<<<<<< HEAD
  // 2 Store owners
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
      role: Role.STORE_OWNER,
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
      role: Role.STORE_OWNER,
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
=======
  // 3 Normal Users
  const user1 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      name: 'Alice Johnson a normal user here',
      email: 'alice@example.com',
      passwordHash: hash('Password@123'),
      address: '10 Maple Avenue, Springfield, 62701',
>>>>>>> 493f6a0f891c9d61fe14c29614d9746d9441a9ef
      role: Role.NORMAL_USER,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
<<<<<<< HEAD
    update: {
      name: 'Ananya Suresh Iyer Pune',
      address: '24 Temple Rock Road, Mylapore, Chennai, Tamil Nadu 600004',
    },
    create: {
      name: 'Ananya Suresh Iyer Pune',
      email: 'bob@example.com',
      passwordHash: hash('Password@123'),
      address: '24 Temple Rock Road, Mylapore, Chennai, Tamil Nadu 600004',
=======
    update: {},
    create: {
      name: 'Robert Smith a normal user member',
      email: 'bob@example.com',
      passwordHash: hash('Password@123'),
      address: '25 Oak Street, Rivertown, 52401',
>>>>>>> 493f6a0f891c9d61fe14c29614d9746d9441a9ef
      role: Role.NORMAL_USER,
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'carol@example.com' },
<<<<<<< HEAD
    update: {
      name: 'Rohan Deepak Deshmukh',
      address: 'Plot 18, Banjara Hills Road No 10, Hyderabad, Telangana 500034',
    },
    create: {
      name: 'Rohan Deepak Deshmukh',
      email: 'carol@example.com',
      passwordHash: hash('Password@123'),
      address: 'Plot 18, Banjara Hills Road No 10, Hyderabad, Telangana 500034',
=======
    update: {},
    create: {
      name: 'Carol Davis a normal user person',
      email: 'carol@example.com',
      passwordHash: hash('Password@123'),
      address: '7 Pine Lane, Hill Valley, 91203',
>>>>>>> 493f6a0f891c9d61fe14c29614d9746d9441a9ef
      role: Role.NORMAL_USER,
    },
  });

<<<<<<< HEAD
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
      role: Role.NORMAL_USER,
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
      role: Role.NORMAL_USER,
    },
  });

  // 5 Indian Stores
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
=======
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
>>>>>>> 493f6a0f891c9d61fe14c29614d9746d9441a9ef
      ownerId: owner1.id,
    },
  });

  const store2 = await prisma.store.upsert({
    where: { id: 'store-seed-2' },
<<<<<<< HEAD
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
=======
    update: {},
    create: {
      id: 'store-seed-2',
      name: 'Fresh Mart Grocery Outlet',
      email: 'freshmart@stores.com',
      address: '45 Market Place, Fresh District, 33201',
>>>>>>> 493f6a0f891c9d61fe14c29614d9746d9441a9ef
      ownerId: owner1.id,
    },
  });

  const store3 = await prisma.store.upsert({
    where: { id: 'store-seed-3' },
<<<<<<< HEAD
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
=======
    update: {},
    create: {
      id: 'store-seed-3',
      name: 'Urban Threads Clothing Boutique',
      email: 'urbanthreads@stores.com',
      address: '78 Fashion Boulevard, Style City, 75201',
>>>>>>> 493f6a0f891c9d61fe14c29614d9746d9441a9ef
      ownerId: owner2.id,
    },
  });

  const store4 = await prisma.store.upsert({
    where: { id: 'store-seed-4' },
<<<<<<< HEAD
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
=======
    update: {},
    create: {
      id: 'store-seed-4',
      name: 'Home Comfort Furniture Gallery',
      email: 'homecomfort@stores.com',
      address: '33 Cozy Corner, Living Quarter, 60601',
>>>>>>> 493f6a0f891c9d61fe14c29614d9746d9441a9ef
      ownerId: owner2.id,
    },
  });

  const store5 = await prisma.store.upsert({
    where: { id: 'store-seed-5' },
<<<<<<< HEAD
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
=======
    update: {},
    create: {
      id: 'store-seed-5',
      name: 'Page Turner Bookshop and Cafe',
      email: 'pageturner@stores.com',
      address: '90 Literary Lane, Booktown, 14401',
>>>>>>> 493f6a0f891c9d61fe14c29614d9746d9441a9ef
      ownerId: owner1.id,
    },
  });

<<<<<<< HEAD
  // Ratings
=======
  // Several Ratings (unique per user-store pair)
>>>>>>> 493f6a0f891c9d61fe14c29614d9746d9441a9ef
  const ratings = [
    { user: user1, store: store1, rating: 5 },
    { user: user2, store: store1, rating: 4 },
    { user: user3, store: store1, rating: 5 },
<<<<<<< HEAD
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
=======
    { user: user1, store: store2, rating: 3 },
    { user: user2, store: store2, rating: 4 },
    { user: user1, store: store3, rating: 5 },
    { user: user3, store: store3, rating: 2 },
    { user: user2, store: store4, rating: 4 },
    { user: user3, store: store4, rating: 5 },
    { user: user1, store: store5, rating: 4 },
    { user: user2, store: store5, rating: 3 },
    { user: user3, store: store5, rating: 5 },
>>>>>>> 493f6a0f891c9d61fe14c29614d9746d9441a9ef
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

<<<<<<< HEAD
  // Also clean up or update any test accounts
  await prisma.user.updateMany({
    where: { email: 'newtest@example.com' },
    data: {
      name: 'Amitabh Harishchandra Joshi',
      address: 'Flat 102, Deccan Gymkhana, Pune, Maharashtra 411004',
    },
  });

  console.log('✅ Indian entities seeded successfully!');
  console.log('---');
  console.log('Admin:       admin@rolex.com / Admin@123 (Rajesh Kumar Sharma Admin)');
  console.log('Store Owner: owner1@example.com / Owner@123 (Rameshwar Nath Agarwal)');
  console.log('Store Owner: owner2@example.com / Owner@123 (Priya Venkatesh Sundaram)');
  console.log('Users:       alice@example.com (Aarav Kulkarni), bob@example.com (Ananya Iyer), etc. / Password@123');
  console.log('User:        irfan@example.com / Password@123 (Mohammed Irfan Tamboli)');
=======
  console.log('✅ Seed complete!');
  console.log('---');
  console.log('Admin:    admin@rolex.com / Admin@123');
  console.log('Users:    alice@example.com, bob@example.com, carol@example.com / Password@123');
  console.log('Owners:   owner1@example.com, owner2@example.com / Owner@123');
>>>>>>> 493f6a0f891c9d61fe14c29614d9746d9441a9ef
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
