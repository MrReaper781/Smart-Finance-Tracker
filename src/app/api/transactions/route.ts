import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import Budget from '@/models/Budget';
import { sendErrorEmail } from '@/lib/mailer';
import { sendBudgetExceededEmail } from '@/lib/mailer';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const query: any = { userId: session.user.id };

    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('userId', 'name email');

    const total = await Transaction.countDocuments(query);

    return NextResponse.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    await sendErrorEmail({ route: '/api/transactions', method: 'GET', error });
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
    const { type, category, subcategory, amount, description, date, tags, recurring, location } = body;

    // Validate required fields
    if (!type || !category || !amount || !description) {
      return NextResponse.json(
        { error: 'Type, category, amount, and description are required' },
        { status: 400 }
      );
    }

    if (!['income', 'expense'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either income or expense' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    await connectDB();

    const transaction = new Transaction({
      userId: session.user.id,
      type,
      category,
      subcategory,
      amount,
      description,
      date: date ? new Date(date) : new Date(),
      tags,
      recurring,
      location,
    });

    await transaction.save();

    // If this is an expense, update relevant budgets and maybe send alerts
    if (type === 'expense') {
      const txnDate = date ? new Date(date) : new Date();
      const budgets = await Budget.find({
        userId: session.user.id,
        isActive: true,
        category,
        ...(subcategory ? { subcategory } : {}),
        'period.start': { $lte: txnDate },
        'period.end': { $gte: txnDate },
      });

      for (const budget of budgets) {
        budget.spent = (budget.spent || 0) + amount;
        await budget.save();

        const percentage = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
        const wantsEmail = budget.alerts?.enabled && (budget.alerts?.notifications || []).includes('email');
        if (wantsEmail && percentage >= (budget.alerts?.threshold ?? 80)) {
          void sendBudgetExceededEmail({
            to: session.user.email as string,
            budgetName: budget.name,
            category: budget.category,
            spent: budget.spent,
            amount: budget.amount,
            percentage,
            threshold: budget.alerts?.threshold ?? 80,
          }).catch(() => {});
        }
      }
    }

    return NextResponse.json(
      { message: 'Transaction created successfully', transaction },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create transaction error:', error);
    await sendErrorEmail({ route: '/api/transactions', method: 'POST', error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

