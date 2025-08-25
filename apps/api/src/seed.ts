import { PrismaClient } from "@prisma/client";
import { hash } from "argon2";

const prismaClient = new PrismaClient();

async function main() {
    const agent = await prismaClient.agent.findFirst({
        where: {
            email: 'agent@properview.com'
        }
    })

    if (!agent) {
        await prismaClient.agent.create({
            data: {
                name: 'Example Agent',
                email: 'agent@properview.com',
                password: await hash('test123'),
            }
        })
    }

    
}

main()
  .then(async () => {
    await prismaClient.$disconnect();
    console.log("Seed completed");
  })
  .catch(async (e) => {
    console.error(e);
    await prismaClient.$disconnect();
    process.exit(1);
  });
