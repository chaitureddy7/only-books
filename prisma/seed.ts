import "dotenv/config";
import { faker } from "@faker-js/faker";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Gender, type Intent } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const CITIES = [
  { city: "Bangalore", pincodes: ["560001", "560034", "560066", "560103"] },
  { city: "Mumbai", pincodes: ["400001", "400050", "400076", "400097"] },
];

const GENDERS: Gender[] = ["MALE", "FEMALE"];
const USERS_PER_CITY_GENDER = 15;

// Three overlapping "taste clusters" so seeded users have meaningful, non-random overlap.
const CLUSTERS: Record<string, { author: string; title: string }[]> = {
  "sci-fi": [
    { author: "Frank Herbert", title: "Dune" },
    { author: "Liu Cixin", title: "The Three-Body Problem" },
    { author: "Ursula K. Le Guin", title: "The Left Hand of Darkness" },
    { author: "Andy Weir", title: "Project Hail Mary" },
    { author: "N.K. Jemisin", title: "The Fifth Season" },
    { author: "William Gibson", title: "Neuromancer" },
    { author: "Ted Chiang", title: "Exhalation" },
    { author: "Becky Chambers", title: "A Long Way to a Small, Angry Planet" },
  ],
  romance: [
    { author: "Emily Henry", title: "Beach Read" },
    { author: "Talia Hibbert", title: "Get a Life, Chloe Brown" },
    { author: "Casey McQuiston", title: "Red, White & Royal Blue" },
    { author: "Ali Hazelwood", title: "The Love Hypothesis" },
    { author: "Helen Hoang", title: "The Kiss Quotient" },
    { author: "Sally Thorne", title: "The Hating Game" },
    { author: "Tessa Bailey", title: "It Happened One Summer" },
    { author: "Christina Lauren", title: "The Unhoneymooners" },
  ],
  classics: [
    { author: "Leo Tolstoy", title: "Anna Karenina" },
    { author: "Gabriel García Márquez", title: "One Hundred Years of Solitude" },
    { author: "Virginia Woolf", title: "Mrs Dalloway" },
    { author: "Fyodor Dostoevsky", title: "Crime and Punishment" },
    { author: "Toni Morrison", title: "Beloved" },
    { author: "Jane Austen", title: "Persuasion" },
    { author: "Albert Camus", title: "The Stranger" },
    { author: "Italo Calvino", title: "Invisible Cities" },
  ],
};

const CLUSTER_NAMES = Object.keys(CLUSTERS);

function randomIntent(): Intent {
  return faker.helpers.weightedArrayElement([
    { value: "BOOK_BUDDY", weight: 7 },
    { value: "DATING", weight: 3 },
  ]);
}

async function upsertBook(title: string, author: string) {
  const normalizedKey = `${title.toLowerCase()}|${author.toLowerCase()}`;
  return prisma.book.upsert({
    where: { normalizedKey },
    create: { title, author, normalizedKey, avgRating: faker.number.float({ min: 3.5, max: 4.6, fractionDigits: 2 }) },
    update: {},
  });
}

async function main() {
  console.log("Seeding books...");
  const bookIdsByCluster = new Map<string, string[]>();
  for (const [cluster, books] of Object.entries(CLUSTERS)) {
    const ids: string[] = [];
    for (const b of books) {
      const book = await upsertBook(b.title, b.author);
      ids.push(book.id);
    }
    bookIdsByCluster.set(cluster, ids);
  }

  console.log("Seeding users...");
  for (const { city, pincodes } of CITIES) {
    for (const gender of GENDERS) {
      for (let i = 0; i < USERS_PER_CITY_GENDER; i++) {
        const intent = randomIntent();
        const cluster = faker.helpers.arrayElement(CLUSTER_NAMES);
        const otherClusters = CLUSTER_NAMES.filter((c) => c !== cluster);

        const user = await prisma.user.create({
          data: {
            email: faker.internet.email().toLowerCase(),
            name: faker.person.fullName(),
            gender,
            dob: faker.date.birthdate({ min: 18, max: 45, mode: "age" }),
            intent,
            preferredGenders: intent === "DATING" ? faker.helpers.arrayElements(GENDERS, { min: 1, max: 2 }) : [],
            city,
            pincode: faker.helpers.arrayElement(pincodes),
            consentGivenAt: new Date(),
            profileCompletedAt: new Date(),
            csvUploadedAt: new Date(),
          },
        });

        const ownBooks = faker.helpers.arrayElements(bookIdsByCluster.get(cluster)!, { min: 4, max: 8 });
        const noiseCluster = faker.helpers.arrayElement(otherClusters);
        const noiseBooks = faker.helpers.arrayElements(bookIdsByCluster.get(noiseCluster)!, { min: 0, max: 2 });

        for (const bookId of [...ownBooks, ...noiseBooks]) {
          await prisma.userBook.create({
            data: {
              userId: user.id,
              bookId,
              myRating: faker.number.int({ min: 3, max: 5 }),
              dateRead: faker.date.past({ years: 3 }),
              dateAdded: faker.date.past({ years: 3 }),
              exclusiveShelf: "READ",
              bookshelves: ["read", cluster],
            },
          });
        }
      }
    }
  }

  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
