import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const twoWeeksFromNow = new Date();
  twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);

  await prisma.signalQuestion.upsert({
    where: { signalNumber: 1 },
    update: {},
    create: {
      signalNumber: 1,
      question:
        "AI가 당신의 업무의 몇 %를 대체할 수 있다고 생각하십니까?",
      optionA: "10% 미만",
      optionB: "10-30%",
      optionC: "30-50%",
      optionD: "50-70%",
      optionE: "70% 이상",
      category: "AI_STRATEGY",
      status: "LIVE",
      voteDeadline: twoWeeksFromNow,
    },
  });

  console.log("Seed signal #1 created (LIVE, AI_STRATEGY)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
