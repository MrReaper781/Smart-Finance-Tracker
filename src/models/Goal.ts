import mongoose, { Document, Schema } from 'mongoose';

export interface IGoal extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  type: 'savings' | 'debt_payment' | 'investment' | 'purchase' | 'emergency_fund';
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  milestones?: {
    amount: number;
    description: string;
    achieved: boolean;
    achievedAt?: Date;
  }[];
  contributions: {
    amount: number;
    date: Date;
    source: string; // 'manual', 'automatic', 'bonus', etc.
    description?: string;
  }[];
  autoContribution?: {
    enabled: boolean;
    amount: number;
    frequency: 'weekly' | 'monthly';
    source: string; // account or category to transfer from
  };
  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema = new Schema<IGoal>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  type: {
    type: String,
    required: true,
    enum: ['savings', 'debt_payment', 'investment', 'purchase', 'emergency_fund'],
  },
  targetAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  targetDate: {
    type: Date,
    required: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  priority: {
    type: String,
    default: 'medium',
    enum: ['low', 'medium', 'high'],
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  milestones: [{
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    achieved: {
      type: Boolean,
      default: false,
    },
    achievedAt: Date,
  }],
  contributions: [{
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    source: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  }],
  autoContribution: {
    enabled: {
      type: Boolean,
      default: false,
    },
    amount: {
      type: Number,
      min: 0,
    },
    frequency: {
      type: String,
      enum: ['weekly', 'monthly'],
    },
    source: {
      type: String,
      trim: true,
    },
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
GoalSchema.index({ userId: 1, isCompleted: 1 });
GoalSchema.index({ userId: 1, targetDate: 1 });
GoalSchema.index({ userId: 1, type: 1 });
GoalSchema.index({ userId: 1, priority: 1 });

// Virtual for progress percentage
GoalSchema.virtual('progressPercentage').get(function() {
  return this.targetAmount > 0 ? (this.currentAmount / this.targetAmount) * 100 : 0;
});

// Virtual for days remaining
GoalSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const diffTime = this.targetDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for amount remaining
GoalSchema.virtual('amountRemaining').get(function() {
  return Math.max(0, this.targetAmount - this.currentAmount);
});

export default mongoose.models.Goal || mongoose.model<IGoal>('Goal', GoalSchema);
