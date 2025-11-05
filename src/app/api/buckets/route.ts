import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bucketName, bucketNumber, works } = body;

    if (!bucketName || !bucketNumber || !works || !Array.isArray(works)) {
      return NextResponse.json(
        { error: 'Bucket name, number, and works array are required' },
        { status: 400 }
      );
    }

    // Check if bucket number already exists
    const existingBucket = await prisma.bucket.findUnique({
      where: { bucketNumber },
    });

    if (existingBucket) {
      return NextResponse.json(
        { error: `Bucket number ${bucketNumber} already exists` },
        { status: 400 }
      );
    }

    const bucket = await prisma.bucket.create({
      data: {
        name: bucketName,
        bucketNumber,
        works: {
          create: works.map((work: { title: string; type: string; author: string; text: string }) => ({
            title: work.title,
            type: work.type,
            author: work.author,
            text: work.text,
          })),
        },
      },
      include: {
        works: true,
      },
    });

    return NextResponse.json(bucket, { status: 201 });
  } catch (error) {
    console.error('Error creating bucket:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bucketId = searchParams.get('id');

    if (bucketId) {
      // Fetch specific bucket by ID
      const bucket = await prisma.bucket.findUnique({
        where: { id: bucketId },
        include: {
          works: {
            orderBy: { createdAt: 'asc' },
          },
          _count: {
            select: { works: true }
          }
        },
      });

      if (!bucket) {
        return NextResponse.json({ error: 'Bucket not found' }, { status: 404 });
      }

      console.log('Fetched specific bucket:', bucket);
      return NextResponse.json(bucket);
    } else {
      // Get buckets that have at least one work
      const bucketsWithWorks = await prisma.bucket.findMany({
        include: {
          works: {
            orderBy: { createdAt: 'asc' },
          },
          _count: {
            select: { works: true }
          }
        },
        where: {
          works: {
            some: {} // Has at least one work
          }
        },
        orderBy: { bucketNumber: 'asc' },
      });

      if (bucketsWithWorks.length === 0) {
        return NextResponse.json({ error: 'No buckets with works found' }, { status: 404 });
      }

      // Return a random bucket with works
      const randomIndex = Math.floor(Math.random() * bucketsWithWorks.length);
      const randomBucket = bucketsWithWorks[randomIndex];
      console.log('Randomly selected bucket:', randomBucket);
      return NextResponse.json(randomBucket);
    }
  } catch (error) {
    console.error('Error fetching bucket:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
