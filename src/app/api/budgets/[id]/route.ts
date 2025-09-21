import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Budget from '@/models/Budget';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const budget = await Budget.findOne({
      _id: params.id,
      userId: session.user.id,
    });

    if (!budget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ budget });
  } catch (error) {
    console.error('Get budget error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      isActive,
      alerts,
      rollover,
    } = body;

    await connectDB();

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (subcategory !== undefined) updateData.subcategory = subcategory;
    if (amount !== undefined) updateData.amount = amount;
    if (period !== undefined) {
      updateData.period = {
        start: new Date(period.start),
        end: new Date(period.end),
        type: period.type,
      };
    }
    if (isActive !== undefined) updateData.isActive = isActive;
    if (alerts !== undefined) updateData.alerts = alerts;
    if (rollover !== undefined) updateData.rollover = rollover;

    const budget = await Budget.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!budget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Budget updated successfully',
      budget,
    });
  } catch (error) {
    console.error('Update budget error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const budget = await Budget.findOneAndDelete({
      _id: params.id,
      userId: session.user.id,
    });

    if (!budget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Budget deleted successfully',
    });
  } catch (error) {
    console.error('Delete budget error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
