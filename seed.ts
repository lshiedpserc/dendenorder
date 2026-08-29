import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { storeSettings, menuItems, menuOptions, menuOptionChoices } from './src/lib/server/schema.js';
import * as dotenv from 'dotenv';
dotenv.config();

const sqlite = new Database(process.env.DATABASE_URL || 'sqlite.db');
const db = drizzle(sqlite);

async function seed() {
  console.log('Seeding...');

  // Settings
  await db.insert(storeSettings).values({
    id: 1,
    pin: '1234',
    leadTime: 15,
    isOpen: true,
  }).onConflictDoNothing();

  // Menu Items
  const items = await db.insert(menuItems).values([
    {
      name: 'マルゲリータピザ',
      price: 1400,
      description: 'クラシックなトマトソース、フレッシュモッツァレラ、バジル。',
      category: 'メイン',
      isAvailable: true,
      imageUrl: '/placeholder.jpg'
    },
    {
      name: 'アイス抹茶ラテ',
      price: 650,
      description: 'セレモニアルグレードの抹茶とオーツミルク。',
      category: 'ドリンク',
      isAvailable: true,
      isSoldOut: true,
      imageUrl: '/placeholder.jpg'
    },
    {
      name: 'ダブルスマッシュバーガー',
      price: 1200,
      description: 'パティ2枚、アメリカンチーズ、自家製ソース。',
      category: 'メイン',
      isAvailable: true,
      imageUrl: '/placeholder.jpg'
    }
  ]).returning();

  // Add an option to the first item just for testing
  if (items.length > 0) {
    const burgerId = items[2].id;
    const option = await db.insert(menuOptions).values({
      menuItemId: burgerId,
      name: 'トッピング追加',
      isRequired: false,
    }).returning();

    await db.insert(menuOptionChoices).values([
      { optionId: option[0].id, name: 'ベーコン', extraPrice: 200 },
      { optionId: option[0].id, name: 'チーズ増量', extraPrice: 100 },
    ]);
  }

  console.log('Seeding complete.');
}

seed().catch(console.error);
