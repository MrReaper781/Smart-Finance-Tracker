'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';

interface Budget {
  _id: string;
  name: string;
  category: string;
  subcategory?: string;
  amount: number;
  spent: number;
  period: {
    start: string;
    end: string;
    type: 'monthly' | 'weekly' | 'yearly' | 'custom';
  };
  isActive: boolean;
  alerts: {
    enabled: boolean;
    threshold: number;
    notifications: string[];
  };
  rollover: boolean;
}

const categories = [
  'Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 
  'Healthcare', 'Education', 'Utilities', 'Rent/Mortgage', 'Other'
];

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    amount: '',
    periodType: 'monthly' as 'monthly' | 'weekly' | 'yearly' | 'custom',
    startDate: '',
    endDate: '',
    alertsEnabled: true,
    threshold: 80,
    rollover: false,
  });

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockBudgets: Budget[] = [
        {
          _id: '1',
          name: 'Monthly Food Budget',
          category: 'Food',
          subcategory: 'Groceries',
          amount: 500,
          spent: 450,
          period: {
            start: '2024-01-01',
            end: '2024-01-31',
            type: 'monthly',
          },
          isActive: true,
          alerts: {
            enabled: true,
            threshold: 80,
            notifications: ['email'],
          },
          rollover: false,
        },
        {
          _id: '2',
          name: 'Entertainment Budget',
          category: 'Entertainment',
          amount: 200,
          spent: 180,
          period: {
            start: '2024-01-01',
            end: '2024-01-31',
            type: 'monthly',
          },
          isActive: true,
          alerts: {
            enabled: true,
            threshold: 90,
            notifications: ['email'],
          },
          rollover: false,
        },
        {
          _id: '3',
          name: 'Transportation Budget',
          category: 'Transportation',
          amount: 300,
          spent: 120,
          period: {
            start: '2024-01-01',
            end: '2024-01-31',
            type: 'monthly',
          },
          isActive: true,
          alerts: {
            enabled: true,
            threshold: 80,
            notifications: ['email'],
          },
          rollover: false,
        },
      ];
      setBudgets(mockBudgets);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const budgetData = {
        ...formData,
        amount: parseFloat(formData.amount),
        threshold: parseInt(formData.threshold.toString()),
      };

      if (editingBudget) {
        // Update budget
        console.log('Updating budget:', budgetData);
      } else {
        // Add new budget
        console.log('Adding budget:', budgetData);
      }

      // Reset form and close dialog
      setFormData({
        name: '',
        category: '',
        subcategory: '',
        amount: '',
        periodType: 'monthly',
        startDate: '',
        endDate: '',
        alertsEnabled: true,
        threshold: 80,
        rollover: false,
      });
      setEditingBudget(null);
      setIsAddDialogOpen(false);
      fetchBudgets();
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      name: budget.name,
      category: budget.category,
      subcategory: budget.subcategory || '',
      amount: budget.amount.toString(),
      periodType: budget.period.type,
      startDate: budget.period.start,
      endDate: budget.period.end,
      alertsEnabled: budget.alerts.enabled,
      threshold: budget.alerts.threshold,
      rollover: budget.rollover,
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this budget?')) {
      try {
        console.log('Deleting budget:', id);
        fetchBudgets();
      } catch (error) {
        console.error('Error deleting budget:', error);
      }
    }
  };

  const getSpendingPercentage = (spent: number, amount: number) => {
    return amount > 0 ? (spent / amount) * 100 : 0;
  };

  const getBudgetStatus = (percentage: number, threshold: number) => {
    if (percentage >= 100) return { status: 'exceeded', color: 'text-red-600', bgColor: 'bg-red-100' };
    if (percentage >= threshold) return { status: 'warning', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { status: 'good', color: 'text-green-600', bgColor: 'bg-green-100' };
  };

  const totalBudgetAmount = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const activeBudgets = budgets.filter(budget => budget.isActive).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Budgets</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your spending against your budget limits</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Budget
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingBudget ? 'Edit Budget' : 'Create New Budget'}
              </DialogTitle>
              <DialogDescription>
                {editingBudget ? 'Update the budget details' : 'Set up a new budget to track your spending'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Budget Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="e.g., Monthly Food Budget"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    required
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="periodType">Period Type</Label>
                <Select value={formData.periodType} onValueChange={(value: 'monthly' | 'weekly' | 'yearly' | 'custom') => setFormData({...formData, periodType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.periodType === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="alertsEnabled">Enable Alerts</Label>
                  <Switch
                    id="alertsEnabled"
                    checked={formData.alertsEnabled}
                    onCheckedChange={(checked) => setFormData({...formData, alertsEnabled: checked})}
                  />
                </div>

                {formData.alertsEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="threshold">Alert Threshold (%)</Label>
                    <Input
                      id="threshold"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.threshold}
                      onChange={(e) => setFormData({...formData, threshold: parseInt(e.target.value)})}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Label htmlFor="rollover">Allow Rollover</Label>
                  <Switch
                    id="rollover"
                    checked={formData.rollover}
                    onCheckedChange={(checked) => setFormData({...formData, rollover: checked})}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingBudget ? 'Update' : 'Create'} Budget
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <div className="h-4 w-4 rounded-full bg-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalBudgetAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {activeBudgets} active budgets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <div className="h-4 w-4 rounded-full bg-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalSpent.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalBudgetAmount > 0 ? ((totalSpent / totalBudgetAmount) * 100).toFixed(1) : 0}% of total budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalBudgetAmount - totalSpent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${(totalBudgetAmount - totalSpent).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Available to spend
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budgets List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {budgets.map((budget) => {
          const percentage = getSpendingPercentage(budget.spent, budget.amount);
          const status = getBudgetStatus(percentage, budget.alerts.threshold);
          
          return (
            <Card key={budget._id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{budget.name}</CardTitle>
                    <CardDescription>
                      {budget.category} • {budget.period.type}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(budget)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(budget._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                    <div className="flex items-center space-x-2">
                      {percentage >= budget.alerts.threshold && (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                      <span className={`text-sm font-medium ${status.color}`}>
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <Progress value={Math.min(percentage, 100)} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span>${budget.spent.toFixed(2)} spent</span>
                    <span>${budget.amount.toFixed(2)} budget</span>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>${(budget.amount - budget.spent).toFixed(2)} remaining</span>
                    <Badge variant={status.status === 'exceeded' ? 'destructive' : status.status === 'warning' ? 'secondary' : 'default'}>
                      {status.status === 'exceeded' ? 'Exceeded' : status.status === 'warning' ? 'Warning' : 'On Track'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {budgets.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-500">
              <p className="text-lg font-medium mb-2">No budgets created yet</p>
              <p className="text-sm">Create your first budget to start tracking your spending</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
