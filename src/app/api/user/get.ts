import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const GET = async (request: any) => {
  try {
    const users = await prisma.user.findMany();

    return new Response(JSON.stringify(users), { status: 200 });
  } catch (error) {
    return new Response("Failed to fetch users", { status: 500 });
  }
};
