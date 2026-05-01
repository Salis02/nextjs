// prisma/seed.ts
import { PrismaClient, RoleName, Permission } from '../src/generated/prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient({} as any)

async function main() {
    // 1. Create Roles + Permissions
    const adminRole = await prisma.role.upsert({
        where: { name: RoleName.ADMIN },
        update: {},
        create: {
            name: RoleName.ADMIN,
            description: 'Full system access',
            permissions: [
                Permission.POST_CREATE,
                Permission.POST_EDIT_ALL,
                Permission.POST_DELETE_ALL,
                Permission.USER_MANAGE,
            ],
        },
    })

    const authorRole = await prisma.role.upsert({
        where: { name: RoleName.AUTHOR },
        update: {},
        create: {
            name: RoleName.AUTHOR,
            description: 'Can manage own posts',
            permissions: [
                Permission.POST_CREATE,
                Permission.POST_EDIT_OWN,
                Permission.POST_DELETE_OWN,
            ],
        },
    })

    const viewerRole = await prisma.role.upsert({
        where: { name: RoleName.VIEWER },
        update: {},
        create: {
            name: RoleName.VIEWER,
            description: 'Read-only access',
            permissions: [],
        },
    })

    // 2. Create Demo Users
    const passwordHash = await hash('password123', 12)

    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@example.com',
            passwordHash,
            emailVerified: new Date(),
            roles: { connect: { id: adminRole.id } },
            profile: {
                create: {
                    firstName: 'Super',
                    lastName: 'Admin',
                },
            },
        },
    })

    console.log({ adminUser, adminRole, authorRole, viewerRole })
}

main()
    .catch((e) => { console.error(e); process.exit(1) })
    .finally(async () => { await prisma.$disconnect() })