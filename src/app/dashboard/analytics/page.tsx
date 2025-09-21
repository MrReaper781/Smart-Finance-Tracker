'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Calendar,
  DollarSign,
  Target,
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
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockData: AnalyticsData = {
        monthlyIncome: 5000,
        monthlyExpenses: 3200,
        netIncome: 1800,
        topCategories: [
          { category: 'Food', amount: 800, percentage: 25 },
          { category: 'Transportation', amount: 600, percentage: 18.75 },
          { category: 'Entertainment', amount: 400, percentage: 12.5 },
          { category: 'Bills', amount: 350, percentage: 10.94 },
          { category: 'Shopping', amount: 300, percentage: 9.38 },
        ],
        spendingTrend: [
          { month: 'Jan', income: 5000, expenses: 3200 },
          { month: 'Feb', income: 5200, expenses: 3100 },
          { month: 'Mar', income: 4800, expenses: 3400 },
          { month: 'Apr', income: 5100, expenses: 3000 },
          { month: 'May', income: 5300, expenses: 3300 },
          { month: 'Jun', income: 5000, expenses: 3200 },
        ],
        budgetPerformance: [
          { category: 'Food', budgeted: 500, spent: 450, percentage: 90 },
          { category: 'Transportation', budgeted: 300, spent: 280, percentage: 93.33 },
          { category: 'Entertainment', budgeted: 200, spent: 180, percentage: 90 },
          { category: 'Shopping', budgeted: 150, spent: 120, percentage: 80 },
        ],
        goalProgress: [
          { title: 'Emergency Fund', current: 3500, target: 10000, percentage: 35 },
          { title: 'Vacation Fund', current: 1200, target: 5000, percentage: 24 },
          { title: 'New Laptop', current: 2500, target: 2500, percentage: 100 },
        ],
      };
      
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
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
        <Select value={timeRange} onValueChange={setTimeRange}>
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
              +12% from last month
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
              -5% from last month
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
              Available for savings
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
              Where your money goes this month
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
            Monthly income vs expenses over time
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
