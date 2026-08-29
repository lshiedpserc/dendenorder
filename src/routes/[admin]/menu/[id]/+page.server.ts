import { error, redirect, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { menuItems, menuOptions, menuOptionChoices } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export const load: PageServerLoad = async ({ params }) => {
    if (params.id === 'new') {
        return { item: null, options: [] };
    }

    const id = parseInt(params.id);
    if (isNaN(id)) error(404, 'Invalid ID');

    const item = await db.select().from(menuItems).where(eq(menuItems.id, id)).get();
    if (!item) error(404, 'Not found');

    const opts = await db.select().from(menuOptions).where(eq(menuOptions.menuItemId, id)).all();
    const optionsWithChoices = await Promise.all(opts.map(async (opt) => {
        const choices = await db.select().from(menuOptionChoices).where(eq(menuOptionChoices.optionId, opt.id)).all();
        return { ...opt, choices };
    }));

    return {
        item,
        options: optionsWithChoices
    };
};

export const actions: Actions = {
    default: async ({ request, params }) => {
        const data = await request.formData();

        const name = data.get('name') as string;
        const price = parseFloat(data.get('price') as string);
        const description = data.get('description') as string;
        const category = data.get('category') as string;
        const isAvailable = data.get('isAvailable') === 'on';
        const isSoldOut = data.get('isSoldOut') === 'on';
        const image = data.get('image') as File | null;

        if (!name || isNaN(price)) {
            return fail(400, { error: 'Name and valid price are required' });
        }

        let imageUrl = data.get('existingImageUrl') as string | null;

        if (image && image.size > 0) {
            const ext = path.extname(image.name);
            const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;
            const uploadDir = path.resolve('static', 'uploads');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            const filePath = path.join(uploadDir, fileName);

            const buffer = Buffer.from(await image.arrayBuffer());
            await sharp(buffer)
                .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 80 })
                .toFile(filePath);

            imageUrl = `/uploads/${fileName}`;
        }

        let itemId: number;

        if (params.id === 'new') {
            const inserted = await db.insert(menuItems).values({
                name, price, description, category, isAvailable, isSoldOut, imageUrl
            }).returning();
            itemId = inserted[0].id;
        } else {
            itemId = parseInt(params.id);
            await db.update(menuItems).set({
                name, price, description, category, isAvailable, isSoldOut, imageUrl
            }).where(eq(menuItems.id, itemId));
        }

        // Handle Options
        const optionsDataStr = data.get('optionsData') as string;
        if (optionsDataStr) {
            try {
                const optionsData = JSON.parse(optionsDataStr);

                // Clear existing options for simplicity (in a real app, you'd diff them)
                if (params.id !== 'new') {
                     await db.delete(menuOptions).where(eq(menuOptions.menuItemId, itemId));
                }

                for (const opt of optionsData) {
                    if (!opt.name) continue;
                    const insertedOpt = await db.insert(menuOptions).values({
                        menuItemId: itemId,
                        name: opt.name,
                        isRequired: opt.isRequired || false
                    }).returning();

                    if (opt.choices && Array.isArray(opt.choices)) {
                        for (const choice of opt.choices) {
                            if (!choice.name) continue;
                            await db.insert(menuOptionChoices).values({
                                optionId: insertedOpt[0].id,
                                name: choice.name,
                                extraPrice: parseFloat(choice.extraPrice) || 0
                            });
                        }
                    }
                }
            } catch (e) {
                console.error("Failed to parse options", e);
            }
        }

        throw redirect(303, `/${data.get('adminPath')}/menu`);
    }
};
