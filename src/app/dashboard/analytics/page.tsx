'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  PiggyBank
} from 'lucide-react';

interface AnalyticsData {
  monthlyIncome: number;
  monthlyExpenses: number;
  netIncome: number;
  topCategories: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  spendingTrend: {
    month: string;
    income: number;
    expenses: number;
  }[];
  budgetPerformance: {
    category: string;
    budgeted: number;
    spent: number;
    percentage: number;
  }[];
  goalProgress: {
    title: string;
    current: number;
    target: number;
    percentage: number;
  }[];
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const getRangeDates = () => {
    const end = new Date();
    const start = new Date();
    if (timeRange === 'week') start.setDate(end.getDate() - 7);
    else if (timeRange === 'month') start.setMonth(end.getMonth() - 1);
    else if (timeRange === 'quarter') start.setMonth(end.getMonth() - 3);
    else if (timeRange === 'year') start.setFullYear(end.getFullYear() - 1);
    return {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    };
  };

  const monthLabelsBetween = (start: Date, end: Date) => {
    const labels: string[] = [];
    const cur = new Date(start.getFullYear(), start.getMonth(), 1);
    const stop = new Date(end.getFullYear(), end.getMonth(), 1);
    while (cur <= stop) {
      labels.push(cur.toLocaleString('default', { month: 'short' }));
      cur.setMonth(cur.getMonth() + 1);
    }
    return labels;
  };

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const { start, end } = getRangeDates();

      const [txRes, budgetsRes, goalsRes] = await Promise.all([
        fetch(`/api/transactions?startDate=${start}&endDate=${end}&limit=1000`),
        fetch('/api/budgets'),
        fetch('/api/goals'),
      ]);

      if (!txRes.ok || !budgetsRes.ok || !goalsRes.ok) throw new Error('Failed to load analytics');

      const txData = await txRes.json();
      const budgetsData = await budgetsRes.json();
      const goalsData = await goalsRes.json();

      const transactions = (txData.transactions || []) as any[];
      const budgets = (budgetsData.budgets || []) as any[];
      const goals = (goalsData.goals || []) as any[];

      const incomeTx = transactions.filter(t => t.type === 'income');
      const expenseTx = transactions.filter(t => t.type === 'expense');

      const monthlyIncome = incomeTx.reduce((s, t) => s + t.amount, 0);
      const monthlyExpenses = expenseTx.reduce((s, t) => s + t.amount, 0);
      const netIncome = monthlyIncome - monthlyExpenses;

      const categoryTotals: Record<string, number> = {};
      for (const t of expenseTx) {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      }
      const totalExpenses = Object.values(categoryTotals).reduce((s, v) => s + v, 0) || 1;
      const topCategories = Object.entries(categoryTotals)
        .map(([category, amount]) => ({ category, amount, percentage: (amount / totalExpenses) * 100 }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      const startDateObj = new Date(start);
      const endDateObj = new Date(end);
      const months = monthLabelsBetween(startDateObj, endDateObj);
      const spendingTrend = months.map((label) => {
        // Group per month label
        const monthIndex = new Date(`${label} 1, ${new Date().getFullYear()}`).getMonth();
        const income = transactions.filter(t => new Date(t.date).getMonth() === monthIndex && t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const expenses = transactions.filter(t => new Date(t.date).getMonth() === monthIndex && t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        return { month: label, income, expenses };
      });

      const budgetPerformance = budgets.map(b => {
        const percentage = b.amount > 0 ? (b.spent / b.amount) * 100 : 0;
        return {
          category: b.category,
          budgeted: Number(b.amount || 0),
          spent: Number(b.spent || 0),
          percentage,
        };
      });

      const goalProgress = goals.map(g => ({
        title: g.title,
        current: Number(g.currentAmount || 0),
        target: Number(g.targetAmount || 0),
        percentage: g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0,
      }));

      setAnalyticsData({
        monthlyIncome,
        monthlyExpenses,
        netIncome,
        topCategories,
        spendingTrend,
        budgetPerformance,
        goalProgress,
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setAnalyticsData(null);
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

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Insights into your financial patterns</p>
        </div>
        <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${analyticsData.monthlyIncome.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              In selected range
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
              ${analyticsData.monthlyExpenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              In selected range
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${analyticsData.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${analyticsData.netIncome.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Income - Expenses
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Spending Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Top Spending Categories</CardTitle>
            <CardDescription>
              Where your money goes in this range
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topCategories.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-primary" style={{
                      backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                    }} />
                    <div>
                      <p className="font-medium">{category.category}</p>
                      <p className="text-sm text-gray-500">{category.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${category.amount.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Budget Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Performance</CardTitle>
            <CardDescription>
              How you're doing against your budgets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.budgetPerformance.map((budget) => (
                <div key={budget.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{budget.category}</span>
                    <Badge variant={budget.percentage >= 90 ? 'destructive' : budget.percentage >= 80 ? 'secondary' : 'default'}>
                      {budget.percentage.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${budget.percentage >= 90 ? 'bg-red-500' : budget.percentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>${budget.spent.toFixed(2)} spent</span>
                    <span>${budget.budgeted.toFixed(2)} budgeted</span>
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
            Track your progress towards financial goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {analyticsData.goalProgress.map((goal) => (
              <div key={goal.title} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <PiggyBank className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">{goal.title}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {goal.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full bg-purple-500"
                    style={{ width: `${Math.min(goal.percentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>${goal.current.toLocaleString()}</span>
                  <span>${goal.target.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Spending Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Spending Trend</CardTitle>
          <CardDescription>
            Income vs expenses in range
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.spendingTrend.map((month) => (
              <div key={month.month} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 text-center">
                    <p className="font-medium">{month.month}</p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-sm">Income: ${month.income.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-sm">Expenses: ${month.expenses.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${month.income - month.expenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${(month.income - month.expenses).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">Net</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}





