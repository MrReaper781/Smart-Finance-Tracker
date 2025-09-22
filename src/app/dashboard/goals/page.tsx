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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, PiggyBank, Target, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { formatCurrency, formatDateISOToPreference } from '@/lib/format';

interface Goal {
  _id: string;
  title: string;
  description?: string;
  type: 'savings' | 'debt_payment' | 'investment' | 'purchase' | 'emergency_fund';
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  milestones?: {
    amount: number;
    description: string;
    achieved: boolean;
    achievedAt?: string;
  }[];
  contributions: {
    amount: number;
    date: string;
    source: string;
    description?: string;
  }[];
  autoContribution?: {
    enabled: boolean;
    amount: number;
    frequency: 'weekly' | 'monthly';
    source: string;
  };
}

const goalTypes = [
  { value: 'savings', label: 'Savings' },
  { value: 'debt_payment', label: 'Debt Payment' },
  { value: 'investment', label: 'Investment' },
  { value: 'purchase', label: 'Purchase' },
  { value: 'emergency_fund', label: 'Emergency Fund' },
];

const priorities = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' },
];

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isContributeDialogOpen, setIsContributeDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'savings' as 'savings' | 'debt_payment' | 'investment' | 'purchase' | 'emergency_fund',
    targetAmount: '',
    targetDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: '',
  });

  // Contribution form state
  const [contributionData, setContributionData] = useState({
    amount: '',
    source: '',
    description: '',
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/goals');
      if (!res.ok) throw new Error('Failed to load goals');
      const data = await res.json();
      setGoals(data.goals || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const goalData: any = {
        title: formData.title,
        description: formData.description || undefined,
        type: formData.type,
        targetAmount: parseFloat(formData.targetAmount),
        targetDate: formData.targetDate,
        priority: formData.priority,
        category: formData.category,
      };

      let res: Response;
      if (editingGoal) {
        res = await fetch(`/api/goals/${editingGoal._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(goalData),
        });
      } else {
        res = await fetch('/api/goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(goalData),
        });
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save goal');
      }

      // Reset form and close dialog
      setFormData({
        title: '',
        description: '',
        type: 'savings',
        targetAmount: '',
        targetDate: '',
        priority: 'medium',
        category: '',
      });
      setEditingGoal(null);
      setIsAddDialogOpen(false);
      fetchGoals();
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;

    try {
      const contribution = {
        amount: parseFloat(contributionData.amount),
        source: contributionData.source,
        description: contributionData.description || undefined,
      };

      const res = await fetch(`/api/goals/${selectedGoal._id}/contribute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contribution),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to add contribution');
      }

      // Reset form and close dialog
      setContributionData({ amount: '', source: '', description: '' });
      setSelectedGoal(null);
      setIsContributeDialogOpen(false);
      fetchGoals();
    } catch (error) {
      console.error('Error adding contribution:', error);
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description || '',
      type: goal.type,
      targetAmount: goal.targetAmount.toString(),
      targetDate: goal.targetDate.slice(0, 10),
      priority: goal.priority,
      category: goal.category,
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      try {
        const res = await fetch(`/api/goals/${id}`, { method: 'DELETE' });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to delete goal');
        }
        fetchGoals();
      } catch (error) {
        console.error('Error deleting goal:', error);
      }
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return target > 0 ? (current / target) * 100 : 0;
  };

  const getDaysRemaining = (targetDate: string) => {
    const days = differenceInDays(new Date(targetDate), new Date());
    return Math.max(0, days);
  };

  const getPriorityColor = (priority: string) => {
    const priorityObj = priorities.find(p => p.value === priority);
    return priorityObj?.color || 'bg-gray-100 text-gray-800';
  };

  const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const completedGoals = goals.filter(goal => goal.isCompleted).length;
  const activeGoals = goals.filter(goal => !goal.isCompleted).length;

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Goals</h1>
          <p className="text-gray-600 dark:text-gray-400">Set and track your financial objectives</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingGoal ? 'Edit Goal' : 'Create New Goal'}
              </DialogTitle>
              <DialogDescription>
                {editingGoal ? 'Update the goal details' : 'Set up a new financial goal to work towards'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Goal Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  placeholder="e.g., Emergency Fund"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your goal..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Goal Type</Label>
                  <Select value={formData.type} onValueChange={(value: 'savings' | 'debt_payment' | 'investment' | 'purchase' | 'emergency_fund') => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {goalTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setFormData({...formData, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetAmount">Target Amount</Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    step="0.01"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                    required
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetDate">Target Date</Label>
                  <Input
                    id="targetDate"
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({...formData, targetDate: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  required
                  placeholder="e.g., Emergency, Travel, Technology"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingGoal ? 'Update' : 'Create'} Goal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goals.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeGoals} active, {completedGoals} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Target</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalTargetAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all goals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
            <PiggyBank className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalCurrentAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalTargetAmount > 0 ? ((totalCurrentAmount / totalTargetAmount) * 100).toFixed(1) : 0}% of target
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalTargetAmount - totalCurrentAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              To reach all goals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {goals.map((goal) => {
          const progressPercentage = getProgressPercentage(goal.currentAmount, goal.targetAmount);
          const daysRemaining = getDaysRemaining(goal.targetDate);
          const priorityColor = getPriorityColor(goal.priority);
          
          return (
            <Card key={goal._id} className={`relative ${goal.isCompleted ? 'opacity-75' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${goal.isCompleted ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'}`}>
                      <PiggyBank className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      <CardDescription>{goal.category}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={priorityColor}>
                      {goal.priority}
                    </Badge>
                    {goal.isCompleted && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {goal.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {goal.description}
                    </p>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="text-sm font-medium">
                        {progressPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={Math.min(progressPercentage, 100)} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Current:</span>
                      <p className="font-medium">{formatCurrency(goal.currentAmount)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Target:</span>
                      <p className="font-medium">{formatCurrency(goal.targetAmount)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {daysRemaining} days left
                      </span>
                    </div>
                    <span className="text-gray-600 dark:text-gray-400">
                      {formatCurrency(goal.targetAmount - goal.currentAmount)} remaining
                    </span>
                  </div>

                  {goal.milestones && goal.milestones.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Milestones:</span>
                      <div className="space-y-1">
                        {goal.milestones.map((milestone, index) => (
                          <div key={index} className="flex items-center justify-between text-xs">
                            <span className={milestone.achieved ? 'line-through text-gray-500' : ''}>
                              {milestone.description}
                            </span>
                            <span className="font-medium">{formatCurrency(milestone.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedGoal(goal);
                        setIsContributeDialogOpen(true);
                      }}
                      disabled={goal.isCompleted}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Contribute
                    </Button>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(goal)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(goal._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {goals.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-500">
              <PiggyBank className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">No goals created yet</p>
              <p className="text-sm">Create your first financial goal to start tracking your progress</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contribution Dialog */}
      <Dialog open={isContributeDialogOpen} onOpenChange={setIsContributeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Contribution</DialogTitle>
            <DialogDescription>
              Add money to "{selectedGoal?.title}"
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleContribute} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contributionAmount">Amount</Label>
              <Input
                id="contributionAmount"
                type="number"
                step="0.01"
                value={contributionData.amount}
                onChange={(e) => setContributionData({...contributionData, amount: e.target.value})}
                required
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contributionSource">Source</Label>
              <Input
                id="contributionSource"
                value={contributionData.source}
                onChange={(e) => setContributionData({...contributionData, source: e.target.value})}
                required
                placeholder="e.g., Salary, Bonus, Savings"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contributionDescription">Description (optional)</Label>
              <Textarea
                id="contributionDescription"
                value={contributionData.description}
                onChange={(e) => setContributionData({...contributionData, description: e.target.value})}
                placeholder="Add a note about this contribution..."
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsContributeDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Add Contribution
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}





