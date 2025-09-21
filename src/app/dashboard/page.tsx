'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  PiggyBank,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  netWorth: number;
  activeBudgets: number;
  activeGoals: number;
  recentTransactions: any[];
  budgetAlerts: any[];
  goalProgress: any[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // This would typically fetch from your API
      // For now, we'll use mock data
      const mockStats: DashboardStats = {
        totalIncome: 5000,
        totalExpenses: 3200,
        netWorth: 1800,
        activeBudgets: 5,
        activeGoals: 3,
        recentTransactions: [
          { id: 1, description: 'Grocery Shopping', amount: -85.50, category: 'Food', date: '2024-01-15' },
          { id: 2, description: 'Salary', amount: 3000, category: 'Income', date: '2024-01-14' },
          { id: 3, description: 'Gas Station', amount: -45.20, category: 'Transportation', date: '2024-01-13' },
        ],
        budgetAlerts: [
          { id: 1, name: 'Food Budget', spent: 450, limit: 500, percentage: 90 },
          { id: 2, name: 'Entertainment', spent: 180, limit: 200, percentage: 90 },
        ],
        goalProgress: [
          { id: 1, title: 'Emergency Fund', current: 2500, target: 5000, percentage: 50 },
          { id: 2, title: 'Vacation Fund', current: 800, target: 2000, percentage: 40 },
        ],
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load dashboard data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
        <p className="text-primary-foreground/80">
          Here's an overview of your financial health
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${stats.totalIncome.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${stats.totalExpenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${stats.netWorth.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Current balance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.activeGoals}
            </div>
            <p className="text-xs text-muted-foreground">
              In progress
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Your latest financial activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      transaction.amount > 0 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.amount > 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">{transaction.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">{transaction.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Budget Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Alerts</CardTitle>
            <CardDescription>
              Budgets approaching their limits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.budgetAlerts.map((budget) => (
                <div key={budget.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{budget.name}</span>
                    <Badge variant={budget.percentage >= 90 ? 'destructive' : 'secondary'}>
                      {budget.percentage}%
                    </Badge>
                  </div>
                  <Progress value={budget.percentage} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>${budget.spent} spent</span>
                    <span>${budget.limit} limit</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goal Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Goal Progress</CardTitle>
          <CardDescription>
            Track your financial goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.goalProgress.map((goal) => (
              <div key={goal.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <PiggyBank className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">{goal.title}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {goal.percentage}%
                  </span>
                </div>
                <Progress value={goal.percentage} className="h-3" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>${goal.current.toLocaleString()}</span>
                  <span>${goal.target.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
