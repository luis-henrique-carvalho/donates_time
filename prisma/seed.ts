// users.seed.js

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: [
      {
        email: "user1@example.com",
        name: "User 1",
        password: "password1",
      },
      {
        email: "user2@example.com",
        name: "User 2",
        password: "password2",
      },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
