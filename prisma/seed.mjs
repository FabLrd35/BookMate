import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.book.deleteMany()
  await prisma.author.deleteMany()
  await prisma.genre.deleteMany()

  // Create genres
  const fiction = await prisma.genre.create({
    data: { name: 'Fiction' },
  })

  const sciFi = await prisma.genre.create({
    data: { name: 'Science Fiction' },
  })

  const fantasy = await prisma.genre.create({
    data: { name: 'Fantasy' },
  })

  const mystery = await prisma.genre.create({
    data: { name: 'Mystery' },
  })

  // Create authors
  const jkRowling = await prisma.author.create({
    data: { name: 'J.K. Rowling' },
  })

  const georgeOrwell = await prisma.author.create({
    data: { name: 'George Orwell' },
  })

  const frankHerbert = await prisma.author.create({
    data: { name: 'Frank Herbert' },
  })

  const agathaChristi = await prisma.author.create({
    data: { name: 'Agatha Christie' },
  })

  const tolkien = await prisma.author.create({
    data: { name: 'J.R.R. Tolkien' },
  })

  // Create books
  await prisma.book.createMany({
    data: [
      // To Read
      {
        title: "Harry Potter and the Philosopher's Stone",
        authorId: jkRowling.id,
        genreId: fantasy.id,
        status: 'TO_READ',
        rating: null,
        comment: null,
      },
      {
        title: 'Dune',
        authorId: frankHerbert.id,
        genreId: sciFi.id,
        status: 'TO_READ',
        rating: null,
        comment: null,
      },
      {
        title: 'Murder on the Orient Express',
        authorId: agathaChristi.id,
        genreId: mystery.id,
        status: 'TO_READ',
        rating: null,
        comment: null,
      },
      // Reading
      {
        title: '1984',
        authorId: georgeOrwell.id,
        genreId: fiction.id,
        status: 'READING',
        startDate: new Date('2025-01-10'),
        rating: null,
        comment: null,
      },
      {
        title: 'The Hobbit',
        authorId: tolkien.id,
        genreId: fantasy.id,
        status: 'READING',
        startDate: new Date('2025-01-15'),
        rating: null,
        comment: null,
      },
      // Read
      {
        title: 'Animal Farm',
        authorId: georgeOrwell.id,
        genreId: fiction.id,
        status: 'READ',
        startDate: new Date('2024-12-01'),
        finishDate: new Date('2024-12-15'),
        rating: 5,
        comment: 'A masterpiece! Powerful allegory about totalitarianism.',
      },
      {
        title: 'The Lord of the Rings',
        authorId: tolkien.id,
        genreId: fantasy.id,
        status: 'READ',
        startDate: new Date('2024-11-01'),
        finishDate: new Date('2024-12-20'),
        rating: 5,
        comment: 'Epic fantasy at its finest. Incredible world-building.',
      },
      {
        title: 'And Then There Were None',
        authorId: agathaChristi.id,
        genreId: mystery.id,
        status: 'READ',
        startDate: new Date('2024-12-20'),
        finishDate: new Date('2025-01-05'),
        rating: 4,
        comment: 'Gripping mystery with a brilliant twist ending.',
      },
    ],
  })

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
