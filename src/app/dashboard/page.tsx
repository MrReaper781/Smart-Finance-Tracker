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
} from 'lucide-react';
import { formatCurrency, formatDateISOToPreference } from '@/lib/format';

interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  netWorth: number;
  activeBudgets: number;
  activeGoals: number;
  recentTransactions: { id: string; description: string; amount: number; category: string; date: string }[];
  budgetAlerts: { id: string; name: string; spent: number; limit: number; percentage: number }[];
  goalProgress: { id: string; title: string; current: number; target: number; percentage: number }[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      const [txRes, budgetsRes, goalsRes] = await Promise.all([
        fetch('/api/transactions?limit=5'),
        fetch('/api/budgets'),
        fetch('/api/goals'),
      ]);

      if (!txRes.ok || !budgetsRes.ok || !goalsRes.ok) {
        throw new Error('Failed to load dashboard data');
      }

      const txData = await txRes.json();
      const budgetsData = await budgetsRes.json();
      const goalsData = await goalsRes.json();

      const transactions = (txData.transactions || []) as any[];
      const budgets = (budgetsData.budgets || []) as any[];
      const goals = (goalsData.goals || []) as any[];

      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      const netWorth = totalIncome - totalExpenses;

      const activeBudgets = budgets.filter(b => b.isActive).length;
      const activeGoals = goals.filter(g => !g.isCompleted).length;

      const recentTransactions = transactions.slice(0, 5).map(t => ({
        id: t._id,
        description: t.description,
        amount: t.type === 'income' ? t.amount : -t.amount,
        category: t.category,
        date: t.date,
      }));

      const budgetAlerts = budgets
        .map(b => {
          const percentage = b.amount > 0 ? (b.spent / b.amount) * 100 : 0;
          return {
            id: b._id,
            name: b.name,
            spent: Number(b.spent || 0),
            limit: Number(b.amount || 0),
            percentage: Number(percentage.toFixed(0)),
          };
        })
        .filter(b => b.percentage >= (b.limit ? 0 : 0) && b.percentage >= 80)
        .slice(0, 5);

      const goalProgress = goals.slice(0, 4).map(g => ({
        id: g._id,
        title: g.title,
        current: Number(g.currentAmount || 0),
        target: Number(g.targetAmount || 0),
        percentage: Number(((g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0)).toFixed(0)),
      }));

      const newStats: DashboardStats = {
        totalIncome,
        totalExpenses,
        netWorth,
        activeBudgets,
        activeGoals,
        recentTransactions,
        budgetAlerts,
        goalProgress,
      };

      setStats(newStats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setStats(null);
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
              {formatCurrency(stats.totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              This month (latest)
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
              {formatCurrency(stats.totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              This month (latest)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats.netWorth)}
            </div>
            <p className="text-xs text-muted-foreground">
              Income - Expenses
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
                      {transaction.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                    </p>
                    <p className="text-sm text-muted-foreground">{formatDateISOToPreference(transaction.date)}</p>
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
                    <span>{formatCurrency(budget.spent)} spent</span>
                    <span>{formatCurrency(budget.limit)} limit</span>
                  </div>
                </div>
              ))}
              {stats.budgetAlerts.length === 0 && (
                <div className="text-sm text-muted-foreground">No alerts right now.</div>
              )}
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
                  <span>{formatCurrency(goal.current)}</span>
                  <span>{formatCurrency(goal.target)}</span>
                </div>
              </div>
            ))}
            {stats.goalProgress.length === 0 && (
              <div className="text-sm text-muted-foreground">No goals yet.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}





