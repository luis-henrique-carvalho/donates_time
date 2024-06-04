import prisma from "@/lib/prisma";

export const GET = async (request: any) => {
  try {
    const users = await prisma;

    return new Response(JSON.stringify(users), { status: 200 });
  } catch (error) {
    return new Response("Failed to fetch users", { status: 500 });
  }
};
