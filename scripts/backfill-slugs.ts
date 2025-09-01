// Backfill null slugs for existing blogs
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}+/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

async function ensureUniqueSlug(base: string, excludeId?: string): Promise<string> {
  const clean = slugify(base);
  const existing = await prisma.blog.findMany({
    where: { slug: { startsWith: clean }, id: excludeId ? { not: excludeId } : undefined },
    select: { slug: true },
  });
  if (!existing.length) return clean;
  const set = new Set(existing.map((e) => e.slug).filter(Boolean) as string[]);
  if (!set.has(clean)) return clean;
  let i = 2;
  while (set.has(`${clean}-${i}`)) i++;
  return `${clean}-${i}`;
}

async function main() {
  const blogs = await prisma.blog.findMany({ where: { slug: null } });
  for (const b of blogs) {
    const base = b.title || 'post';
    const unique = await ensureUniqueSlug(base, b.id);
    await prisma.blog.update({ where: { id: b.id }, data: { slug: unique } });
    console.log(`Updated blog ${b.id} -> slug=${unique}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

