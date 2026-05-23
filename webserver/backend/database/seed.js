import prisma from './prisma.js';

/**
 * Make sure that the db has the default group always.
 */
async function main() {
  const defaultGroup = await prisma.group.upsert({
    where: { id: 1 },
    update: {}, // Leave empty to not change existing data.
    create: {
      id: 1,
      name: 'default',
    },
  })
}

main().catch(async (e) => {
    console.error(e)
    process.exit(1)
})