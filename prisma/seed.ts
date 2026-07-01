import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { ensureDemoSeed } from "../src/lib/demoSeed";

const prisma = new PrismaClient();

ensureDemoSeed(prisma)
  .then((result) => {
    console.log("Seed completo:", result);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
