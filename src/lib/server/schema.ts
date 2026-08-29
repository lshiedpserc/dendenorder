import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const storeSettings = sqliteTable('store_settings', {
  id: integer('id').primaryKey(),
  pin: text('pin').notNull(),
  leadTime: integer('lead_time').notNull().default(15),
  isOpen: integer('is_open', { mode: 'boolean' }).notNull().default(true),
  autoUpdate: integer('auto_update', { mode: 'boolean' }).notNull().default(false)
});

export const menuItems = sqliteTable('menu_items', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  price: real('price').notNull(),
  description: text('description').notNull().default(''),
  imageUrl: text('image_url'),
  isAvailable: integer('is_available', { mode: 'boolean' }).notNull().default(true),
  isSoldOut: integer('is_sold_out', { mode: 'boolean' }).notNull().default(false),
  category: text('category').notNull().default('All')
});

export const menuOptions = sqliteTable('menu_options', {
  id: integer('id').primaryKey(),
  menuItemId: integer('menu_item_id').notNull().references(() => menuItems.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  isRequired: integer('is_required', { mode: 'boolean' }).notNull().default(false),
});

export const menuOptionChoices = sqliteTable('menu_option_choices', {
  id: integer('id').primaryKey(),
  optionId: integer('option_id').notNull().references(() => menuOptions.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  extraPrice: real('extra_price').notNull().default(0),
});

export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey(),
  orderNumber: text('order_number').notNull().unique(), // e.g. 1025-001
  totalPrice: real('total_price').notNull(),
  status: text('status', { enum: ['pending', 'cooked', 'served', 'canceled'] }).notNull().default('pending'),
  pickupTime: integer('pickup_time', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const orderItems = sqliteTable('order_items', {
  id: integer('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  menuItemId: integer('menu_item_id').notNull().references(() => menuItems.id), // No cascade on purpose, preserve history conceptually
  menuItemName: text('menu_item_name').notNull(), // Snapshot
  quantity: integer('quantity').notNull().default(1),
  priceAtTime: real('price_at_time').notNull(), // Snapshot
  notes: text('notes').default(''),
});

export const orderItemChoices = sqliteTable('order_item_choices', {
  id: integer('id').primaryKey(),
  orderItemId: integer('order_item_id').notNull().references(() => orderItems.id, { onDelete: 'cascade' }),
  optionName: text('option_name').notNull(),
  choiceName: text('choice_name').notNull(),
  extraPrice: real('extra_price').notNull().default(0),
});
