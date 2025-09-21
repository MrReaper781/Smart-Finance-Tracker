import mongoose, { Document, Schema } from 'mongoose';

export interface IBudget extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  category: string;
  subcategory?: string;
  amount: number;
  spent: number;
  period: {
    start: Date;
    end: Date;
    type: 'monthly' | 'weekly' | 'yearly' | 'custom';
  };
  isActive: boolean;
  alerts: {
    enabled: boolean;
    threshold: number; // percentage (0-100)
    notifications: string[]; // ['email', 'push', 'sms']
  };
  rollover: boolean; // whether unused amount rolls over to next period
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema = new Schema<IBudget>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  subcategory: {
    type: String,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  spent: {
    type: Number,
    default: 0,
    min: 0,
  },
  period: {
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['monthly', 'weekly', 'yearly', 'custom'],
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  alerts: {
    enabled: {
      type: Boolean,
      default: true,
    },
    threshold: {
      type: Number,
      default: 80,
      min: 0,
      max: 100,
    },
    notifications: [{
      type: String,
      enum: ['email', 'push', 'sms'],
    }],
  },
  rollover: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
BudgetSchema.index({ userId: 1, isActive: 1 });
BudgetSchema.index({ userId: 1, 'period.start': 1, 'period.end': 1 });
BudgetSchema.index({ userId: 1, category: 1 });

// Virtual for remaining budget amount
BudgetSchema.virtual('remaining').get(function() {
  return Math.max(0, this.amount - this.spent);
});

// Virtual for spending percentage
BudgetSchema.virtual('spendingPercentage').get(function() {
  return this.amount > 0 ? (this.spent / this.amount) * 100 : 0;
});

export default mongoose.models.Budget || mongoose.model<IBudget>('Budget', BudgetSchema);
