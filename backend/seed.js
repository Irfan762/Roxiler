// Database Seeder using pure standard SQL (mysql2)
const bcrypt = require('bcryptjs');
const db = require('./src/config/db');

async function main() {
  console.log('🌱 Seeding database using standard SQL...');

  const hash = (pw) => bcrypt.hashSync(pw, 10);

  // Helper for upserting user with standard SQL
  async function upsertUser(id, name, email, password, address, role) {
    const passwordHash = hash(password);
    await db.query(
      `INSERT INTO user (id, name, email, passwordHash, address, role, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE 
         name = VALUES(name),
         passwordHash = VALUES(passwordHash),
         address = VALUES(address),
         role = VALUES(role),
         updatedAt = NOW()`,
      [id, name, email, passwordHash, address, role]
    );
  }

  // 1 System Admin
  await upsertUser(
    'user-admin-1',
    'Rajesh Kumar Sharma Admin',
    'admin@rolex.com',
    'Admin@123',
    'Flat 402, Shanti Kunj, Civil Lines, New Delhi 110054',
    'SYSTEM_ADMIN'
  );

  // 2 Store Owners
  await upsertUser(
    'user-owner-1',
    'Rameshwar Nath Agarwal',
    'owner1@example.com',
    'Owner@123',
    'Shop 12, MG Road, Camp, Pune, Maharashtra 411001',
    'STORE_OWNER'
  );

  await upsertUser(
    'user-owner-2',
    'Priya Venkatesh Sundaram',
    'owner2@example.com',
    'Owner@123',
    '15 Indiranagar 100ft Road, Bengaluru, Karnataka 560038',
    'STORE_OWNER'
  );

  // Normal Users (Customers)
  const customers = [
    {
      id: 'user-cust-1',
      name: 'Aarav Rajesh Kulkarni',
      email: 'alice@example.com',
      address: 'Flat 301, Ganga Heights, Kothrud, Pune, Maharashtra 411038',
    },
    {
      id: 'user-cust-2',
      name: 'Ananya Suresh Iyer Pune',
      email: 'bob@example.com',
      address: '24 Temple Rock Road, Mylapore, Chennai, Tamil Nadu 600004',
    },
    {
      id: 'user-cust-3',
      name: 'Rohan Deepak Deshmukh',
      email: 'carol@example.com',
      address: 'Plot 18, Banjara Hills Road No 10, Hyderabad, Telangana 500034',
    },
    {
      id: 'user-cust-4',
      name: 'Mohammed Irfan Tamboli',
      email: 'irfan@example.com',
      address: 'Building 5, Shivaji Nagar, Pune, Maharashtra 411016',
    },
    {
      id: 'user-cust-5',
      name: 'Pooja Chandrashekhar Nair',
      email: 'pooja@example.com',
      address: 'B-702, Sea Breeze, Marine Lines, Mumbai, Maharashtra 400020',
    },
  ];

  for (const c of customers) {
    await upsertUser(c.id, c.name, c.email, 'Password@123', c.address, 'NORMAL_USER');
  }

  // Helper for upserting store with standard SQL
  async function upsertStore(id, name, email, address, ownerId) {
    await db.query(
      `INSERT INTO store (id, name, email, address, ownerId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         email = VALUES(email),
         address = VALUES(address),
         ownerId = VALUES(ownerId),
         updatedAt = NOW()`,
      [id, name, email, address, ownerId]
    );
  }

  // 5 Stores
  await upsertStore(
    'store-seed-1',
    'Shree Ganesh Supermarket & Kirana',
    'shreeganesh@kirana.in',
    'Shop 12, MG Road, Camp, Pune, Maharashtra 411001',
    'user-owner-1'
  );

  await upsertStore(
    'store-seed-2',
    'Suruchi Mithai & Farsan Sweets',
    'suruchimithai@sweets.in',
    'Plot 45, FC Road, Shivajinagar, Pune, Maharashtra 411005',
    'user-owner-1'
  );

  await upsertStore(
    'store-seed-3',
    'FabIndia Ethnic Heritage Studio',
    'heritagefabrics@stores.in',
    '18 Commercial Street, Bengaluru, Karnataka 560001',
    'user-owner-2'
  );

  await upsertStore(
    'store-seed-4',
    'Royal Rajasthan Handicrafts Mart',
    'royalrajasthan@crafts.in',
    'B-14, MI Road, Mansarovar, Jaipur, Rajasthan 302001',
    'user-owner-2'
  );

  await upsertStore(
    'store-seed-5',
    'Crossword & Chai Book Cafe Store',
    'crosswordchai@books.in',
    'Unit 204, Phoenix Marketcity, Kurla, Mumbai 400070',
    'user-owner-1'
  );

  // Ratings
  const ratings = [
    { userId: 'user-cust-1', storeId: 'store-seed-1', rating: 5 },
    { userId: 'user-cust-2', storeId: 'store-seed-1', rating: 4 },
    { userId: 'user-cust-3', storeId: 'store-seed-1', rating: 5 },
    { userId: 'user-cust-4', storeId: 'store-seed-1', rating: 5 },
    { userId: 'user-cust-5', storeId: 'store-seed-1', rating: 4 },

    { userId: 'user-cust-1', storeId: 'store-seed-2', rating: 4 },
    { userId: 'user-cust-2', storeId: 'store-seed-2', rating: 5 },
    { userId: 'user-cust-4', storeId: 'store-seed-2', rating: 5 },

    { userId: 'user-cust-1', storeId: 'store-seed-3', rating: 5 },
    { userId: 'user-cust-3', storeId: 'store-seed-3', rating: 4 },
    { userId: 'user-cust-5', storeId: 'store-seed-3', rating: 4 },

    { userId: 'user-cust-2', storeId: 'store-seed-4', rating: 4 },
    { userId: 'user-cust-3', storeId: 'store-seed-4', rating: 5 },
    { userId: 'user-cust-4', storeId: 'store-seed-4', rating: 5 },

    { userId: 'user-cust-1', storeId: 'store-seed-5', rating: 5 },
    { userId: 'user-cust-2', storeId: 'store-seed-5', rating: 4 },
    { userId: 'user-cust-3', storeId: 'store-seed-5', rating: 5 },
    { userId: 'user-cust-5', storeId: 'store-seed-5', rating: 4 },
  ];

  for (let i = 0; i < ratings.length; i++) {
    const r = ratings[i];
    await db.query(
      `INSERT INTO rating (id, userId, storeId, rating, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE rating = VALUES(rating), updatedAt = NOW()`,
      [`rating-seed-${i + 1}`, r.userId, r.storeId, r.rating]
    );
  }

  console.log('✅ Seed completed successfully with standard SQL!');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
