import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Budget from '@/models/Budget';
import { sendErrorEmail } from '@/lib/mailer';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const category = searchParams.get('category');

    const query: any = { userId: session.user.id };

    if (isActive !== null) {
      query.isActive = isActive === 'true';
    }
    if (category) {
      query.category = category;
    }

    const budgets = await Budget.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');

    return NextResponse.json({ budgets });
  } catch (error) {
    console.error('Get budgets error:', error);
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
      name,
      category,
      subcategory,
      amount,
      period,
      alerts,
      rollover,
    } = body;

    // Validate required fields
    if (!name || !category || !amount || !period) {
      return NextResponse.json(
        { error: 'Name, category, amount, and period are required' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    if (!period.start || !period.end || !period.type) {
      return NextResponse.json(
        { error: 'Period must include start, end, and type' },
        { status: 400 }
      );
    }

    await connectDB();

    const budget = new Budget({
      userId: session.user.id,
      name,
      category,
      subcategory,
      amount,
      period: {
        start: new Date(period.start),
        end: new Date(period.end),
        type: period.type,
      },
      alerts: alerts || {
        enabled: true,
        threshold: 80,
        notifications: ['email'],
      },
      rollover: rollover || false,
    });

    await budget.save();

    return NextResponse.json(
      { message: 'Budget created successfully', budget },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create budget error:', error);
    await sendErrorEmail({ route: '/api/budgets', method: 'POST', error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

