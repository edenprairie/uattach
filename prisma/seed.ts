import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // 1. Seed Users
    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            email: 'admin@uattach.com',
            password: 'Admin#987',
            role: 'admin',
        },
    });

    const demo = await prisma.user.upsert({
        where: { username: 'demo' },
        update: {},
        create: {
            username: 'demo',
            email: 'demo@uattach.com',
            password: 'Demo#123',
            role: 'user',
        },
    });

    console.log({ admin, demo });

    // 2. Seed Products (Mock Data)
    const products = [
        {
            name: 'Heavy Duty Excavator Bucket',
            category: 'Excavator Attachments',
            description: 'Reinforced bucket designed for severe digging conditions in rock and abrasive soils. Features high-strength steel construction.',
            weightKg: 1200,
            pdfUrl: '/specs/excavator-bucket.pdf',
            features: ['Hardox 450 wear plates', 'Tapered design for easier dumping', 'Reinforced cutting edge'],
        },
        {
            name: 'Hydraulic Breaker Hammer',
            category: 'Excavator Attachments',
            description: 'High-performance hydraulic breaker for demolition and mining. Delivers consistent impact energy.',
            weightKg: 850,
            pdfUrl: '/specs/hydraulic-breaker.pdf',
            features: ['Auto-greasing system', 'Blank firing protection', 'Noise reduction housing'],
        },
        {
            name: 'Skid Steer Pallet Fork',
            category: 'Skid Steer Attachments',
            description: 'Adjustable pallet fork frame for handling palletized loads. Fits universal skid steer mount.',
            weightKg: 180,
            pdfUrl: '/specs/pallet-fork.pdf',
            features: ['4000 lbs capacity', 'Adjustable tine width', 'See-through brick guard'],
        },
        {
            name: 'Forestry Mulcher',
            category: 'Land Clearing',
            description: 'High-flow drum mulcher for clearing brush and small trees. Fixed tooth design for maximum efficiency.',
            weightKg: 1400,
            pdfUrl: '/specs/forestry-mulcher.pdf',
            imageUrl: '/images/products/mulcher.jpg',
            features: ['Variable displacement motor', 'Spiral tooth arrangement', 'Push bar included'],
        },
        {
            name: 'Auger Drive Unit',
            category: 'Drilling',
            description: 'Planetary drive auger for drilling post holes and tree planting. High torque output.',
            weightKg: 120,
            pdfUrl: '/specs/auger-drive.pdf',
            features: ['2-inch hex shaft', '5-year gearbox warranty', 'Hose kit included'],
        },
        {
            name: 'Trenching Bucket',
            category: 'Excavator Attachments',
            description: 'Narrow bucket profile for utility trenching and cable laying.',
            weightKg: 450,
            pdfUrl: '/specs/trenching-bucket.pdf',
            features: ['12-inch width', 'Responsive geometry', 'Replaceable teeth'],
        },
        {
            name: 'Snow Pusher 10ft',
            category: 'Snow Removal',
            description: 'Large capacity snow pusher with rubber cutting edge for parking lot clearing.',
            weightKg: 600,
            pdfUrl: '/specs/snow-pusher.pdf',
            features: ['Rubber edge protects pavement', 'Box reinforcement', 'Universal coupler'],
        },
    ];

    for (const p of products) {
        await prisma.product.create({
            data: p,
        });
    }

    console.log('Seeded products');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
