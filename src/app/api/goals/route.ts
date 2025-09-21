import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Goal from '@/models/Goal';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const isCompleted = searchParams.get('isCompleted');
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');

    const query: any = { userId: session.user.id };

    if (isCompleted !== null) {
      query.isCompleted = isCompleted === 'true';
    }
    if (type) {
      query.type = type;
    }
    if (priority) {
      query.priority = priority;
    }

    const goals = await Goal.find(query)
      .sort({ priority: 1, targetDate: 1 })
      .populate('userId', 'name email');

    return NextResponse.json({ goals });
  } catch (error) {
    console.error('Get goals error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      type,
      targetAmount,
      targetDate,
      priority,
      category,
      milestones,
      autoContribution,
    } = body;

    // Validate required fields
    if (!title || !type || !targetAmount || !targetDate || !category) {
      return NextResponse.json(
        { error: 'Title, type, target amount, target date, and category are required' },
        { status: 400 }
      );
    }

    if (targetAmount <= 0) {
      return NextResponse.json(
        { error: 'Target amount must be greater than 0' },
        { status: 400 }
      );
    }

    if (new Date(targetDate) <= new Date()) {
      return NextResponse.json(
        { error: 'Target date must be in the future' },
        { status: 400 }
      );
    }

    await connectDB();

    const goal = new Goal({
      userId: session.user.id,
      title,
      description,
      type,
      targetAmount,
      targetDate: new Date(targetDate),
      priority: priority || 'medium',
      category,
      milestones: milestones || [],
      autoContribution: autoContribution || {
        enabled: false,
        amount: 0,
        frequency: 'monthly',
        source: '',
      },
    });

    await goal.save();

    return NextResponse.json(
      { message: 'Goal created successfully', goal },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create goal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
