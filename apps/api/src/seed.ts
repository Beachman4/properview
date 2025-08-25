import { PrismaClient } from '@prisma/client';
import { hash } from 'argon2';

const prismaClient = new PrismaClient();

function getRandomDateBetweenNowAndTwoWeeksAgo(): Date {
  const now = new Date();
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const randomTime =
    twoWeeksAgo.getTime() +
    Math.random() * (now.getTime() - twoWeeksAgo.getTime());
  return new Date(randomTime);
}

async function main() {
  let agent = await prismaClient.agent.findFirst({
    where: {
      email: 'agent@properview.com',
    },
  });

  if (!agent) {
    agent = await prismaClient.agent.create({
      data: {
        name: 'Example Agent',
        email: 'agent@properview.com',
        password: await hash('test123'),
      },
    });

    const properties = [
      {
        title: 'Modern Family Home in Round Rock',
        price: 450000,
        address: '4111 Hidden View Ct, Round Rock, TX 78665',
        addressLongitude: -97.67622971690433,
        addressLatitude: 30.567665519264313,
        bedrooms: 3,
        bathrooms: 2.5,
        description:
          'Beautiful modern family home in Round Rock with stunning neighborhood views and luxury amenities. Features an open floor plan, updated kitchen, and spacious backyard perfect for family gatherings.',
      },
      {
        title: 'Luxury Family Estate in Round Rock',
        price: 1250000,
        address: '4501 Sansone Dr, Round Rock, TX 78665',
        addressLongitude: -97.66339223433697,
        addressLatitude: 30.578615607357325,
        bedrooms: 5,
        bathrooms: 4.5,
        description:
          'Spacious luxury family estate with large backyard, gourmet kitchen, and excellent school district. This stunning home offers premium finishes and plenty of space for growing families.',
      },
      {
        title: 'Charming South Austin Home',
        price: 750000,
        address: '2002 Paramount Ave, Austin, TX 78704',
        addressLongitude: -97.77714537713524,
        addressLatitude: 30.253053212088965,
        bedrooms: 4,
        bathrooms: 2,
        description:
          'Charming family home in South Austin with character and charm. Features a cozy fireplace, mature trees, and a welcoming neighborhood atmosphere perfect for families.',
      },
      {
        title: 'Updated Family Home in South Austin',
        price: 550000,
        address: '1800 Cresthaven Dr, Austin, TX 78704',
        addressLongitude: -97.78219089821839,
        addressLatitude: 30.260124872585134,
        bedrooms: 3,
        bathrooms: 2.5,
        description:
          'Perfect family home with modern updates, fenced yard, and convenient location near shopping and schools. Great starter home for growing families.',
      },
      {
        title: 'Spacious Family Home in South Austin',
        price: 880000,
        address: '2805 Horseshoe Bend Cove, Austin, TX 78704',
        addressLongitude: -97.79485461621356,
        addressLatitude: 30.248480044687703,
        bedrooms: 5,
        bathrooms: 4,
        description:
          "Large family home with plenty of space for everyone. Features multiple living areas, a chef's kitchen, and a beautiful backyard perfect for entertaining.",
      },
      {
        title: 'Well-Maintained Family Home in Southwest Austin',
        price: 590000,
        address: '7213 Teaberry Dr, Austin, TX 78745',
        addressLongitude: -97.78928167648078,
        addressLatitude: 30.19082714586145,
        bedrooms: 4,
        bathrooms: 3,
        description:
          'Beautifully maintained family home with original charm and modern amenities. Located in a quiet neighborhood with excellent schools and convenient access to shopping.',
      },
      {
        title: 'Affordable Family Home in Southeast Austin',
        price: 378000,
        address: '10537 Hendon St, Austin, TX 78748',
        addressLongitude: -97.83579351388389,
        addressLatitude: 30.167519851065283,
        bedrooms: 3,
        bathrooms: 2,
        description:
          'Affordable family home in a peaceful neighborhood with great potential. Features a cozy fireplace, fenced yard, and is close to parks and schools.',
      },
      {
        title: 'Charming Family Home in San Marcos',
        price: 326000,
        address: '921 Haynes St, San Marcos, TX 78666',
        addressLongitude: -97.9308146245768,
        addressLatitude: 29.88135042908565,
        bedrooms: 2,
        bathrooms: 2,
        description:
          'Charming family home in San Marcos with character and charm. Features a welcoming front porch, mature landscaping, and a peaceful neighborhood setting.',
      },
      {
        title: 'Cozy Family Home in San Marcos',
        price: 380000,
        address: '610 Dartmouth Ave, San Marcos, TX 78666',
        addressLongitude: -97.95929438602329,
        addressLatitude: 29.876771349697766,
        bedrooms: 2,
        bathrooms: 1,
        description:
          'Cozy family home with beautiful landscaping, private patio, and peaceful surroundings. Perfect for small families or first-time homebuyers.',
      },
      {
        title: 'Spacious Family Home in San Marcos',
        price: 380000,
        address: '2013 Nevada St, San Marcos, TX 78666',
        addressLongitude: -97.96738268853296,
        addressLatitude: 29.88777831201576,
        bedrooms: 4,
        bathrooms: 4,
        description:
          'Spacious family home with plenty of room for everyone. Features multiple bedrooms, updated bathrooms, and a large backyard perfect for family activities and entertaining.',
      },
    ];

    // Create properties for the agent
    for (const propertyData of properties) {
      await prismaClient.property.create({
        data: {
          ...propertyData,
          agentId: agent.id,
          createdAt: getRandomDateBetweenNowAndTwoWeeksAgo(),
        },
      });
    }

    console.log(
      `Created ${properties.length} properties for agent ${agent.name}`,
    );
  }
}

main()
  .then(async () => {
    await prismaClient.$disconnect();
    console.log('Seed completed');
  })
  .catch(async (e) => {
    console.error(e);
    await prismaClient.$disconnect();
    process.exit(1);
  });
