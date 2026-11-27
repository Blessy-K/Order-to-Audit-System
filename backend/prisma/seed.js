require("dotenv").config();

const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });

const seedUsers = async () => {
    try {
        const password = process.env.SEED_USER_PASSWORD;

        if (!password) {
            throw new Error("SEED_USER_PASSWORD is missing in .env");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const users = [
            {
                name: "Admin User",
                email: "admin@orderaudit.com",
                role: "ADMIN"
            },
            {
                name: "Salesman A",
                email: "salesman.a@orderaudit.com",
                role: "SALESMAN"
            },
            {
                name: "Salesman B",
                email: "salesman.b@orderaudit.com",
                role: "SALESMAN"
            },
            {
                name: "Production Supervisor",
                email: "production@orderaudit.com",
                role: "PRODUCTION_SUPERVISOR"
            }
        ];

        for (const user of users) {
            await prisma.user.upsert({
                where: { email: user.email },
                update: {
                    name: user.name,
                    role: user.role,
                    isActive: true
                },
                create: {
                    ...user,
                    password: hashedPassword
                }
            });

            console.log(`Created/verified: ${user.email}`);
        }

        console.log("User seeding completed successfully!");

    } catch (error) {
        console.error("Seeding error:", error);
        process.exitCode = 1;
    } finally {
        await prisma.$disconnect();
    }
};

seedUsers();