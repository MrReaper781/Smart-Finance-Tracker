import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Goal from '@/models/Goal';
import { sendErrorEmail } from '@/lib/mailer';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, source, description } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid contribution amount is required' },
        { status: 400 }
      );
    }

    if (!source) {
      return NextResponse.json(
        { error: 'Contribution source is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const goal = await Goal.findOne({
      _id: params.id,
      userId: session.user.id,
    });

    if (!goal) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }

    if (goal.isCompleted) {
      return NextResponse.json(
        { error: 'Cannot contribute to a completed goal' },
        { status: 400 }
      );
    }

    // Add contribution
    const contribution = {
      amount,
      date: new Date(),
      source,
      description: description || '',
    };

    goal.contributions.push(contribution);
    goal.currentAmount += amount;

    // Check if goal is completed
    if (goal.currentAmount >= goal.targetAmount) {
      goal.isCompleted = true;
    }

    // Check milestones
    if (goal.milestones && goal.milestones.length > 0) {
      goal.milestones.forEach((milestone) => {
        if (!milestone.achieved && goal.currentAmount >= milestone.amount) {
          milestone.achieved = true;
          milestone.achievedAt = new Date();
        }
      });
    }

    await goal.save();

    return NextResponse.json({
      message: 'Contribution added successfully',
      goal,
      contribution,
    });
  } catch (error) {
    console.error('Add contribution error:', error);
    await sendErrorEmail({ route: '/api/goals/[id]/contribute', method: 'POST', error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}







