'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Filter,
  Calendar,
  Receipt,
  Sparkles,
  PieChart as PieChartIcon,
  BarChart3,
  Target,
  PiggyBank,
  CreditCard,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Edit,
  Landmark,
  ShoppingBag,
  Coffee,
  BookOpen,
  Home,
  Car,
  Smartphone,
  Music,
  Film,
  Heart,
  Utensils,
  Briefcase,
  GraduationCap,
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
} from 'recharts'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const EXPENSE_CATEGORIES = [
  { name: 'Food', icon: '🍔', color: '#F59E0B' },
  { name: 'Transport', icon: '🚗', color: '#3B82F6' },
  { name: 'Hostel/Rent', icon: '🏠', color: '#8B5CF6' },
  { name: 'Tuition', icon: '📚', color: '#6D0F2B' },
  { name: 'Books', icon: '📖', color: '#059669' },
  { name: 'Stationery', icon: '✏️', color: '#D97706' },
  { name: 'Shopping', icon: '🛍️', color: '#EC4899' },
  { name: 'Entertainment', icon: '🎮', color: '#7C3AED' },
  { name: 'Medical', icon: '🏥', color: '#EF4444' },
  { name: 'Internet', icon: '🌐', color: '#0891B2' },
  { name: 'Mobile Recharge', icon: '📱', color: '#2563EB' },
  { name: 'Software & Subscriptions', icon: '💻', color: '#4F46E5' },
  { name: 'Miscellaneous', icon: '📌', color: '#6B7280' },
]

const INCOME_CATEGORIES = [
  'Parents/Guardian',
  'Scholarship',
  'Internship Stipend',
  'Freelancing',
  'Part-time Job',
  'Pocket Money',
  'Other',
]

// ---------- STAT CARD ----------
function StatCard({ title, value, icon: Icon, color, subtitle, loading }: any) {
  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp}>
      <Card className="border-0 shadow-[0_4px_16px_rgba(0,0,0,0.05)] rounded-2xl overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</p>
              {loading ? (
                <Skeleton className="h-6 w-12 mt-1" />
              ) : (
                <p className="text-xl font-bold text-gray-900 mt-1">₹{value}</p>
              )}
              {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
            </div>
            <div className={`rounded-xl bg-gradient-to-br ${color} p-2 shadow-lg shadow-[#6D0F2B]/15`}>
              <Icon className="h-4 w-4 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ---------- TRANSACTION ITEM ----------
function TransactionItem({ transaction, onDelete }: any) {
  const category = EXPENSE_CATEGORIES.find((c) => c.name === transaction.category) || { icon: '📌', color: '#6B7280' }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="flex items-center gap-4 rounded-xl bg-white p-3 shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(109,15,43,0.08)] transition-all duration-300"
    >
      <div className="rounded-xl p-2" style={{ background: `${category.color}15` }}>
        <span className="text-lg">{category.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-gray-800">{transaction.category}</p>
          <Badge variant="outline" className="text-[10px]">{transaction.type}</Badge>
        </div>
        <p className="text-sm text-gray-500">{transaction.description || 'No description'}</p>
        <p className="text-xs text-gray-400">{format(new Date(transaction.date), 'MMM d, yyyy')}</p>
      </div>
      <div className="text-right">
        <p className={`font-bold ${transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
          {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
        </p>
        {transaction.payment_method && (
          <p className="text-xs text-gray-400">{transaction.payment_method}</p>
        )}
      </div>
      <button
        onClick={() => onDelete(transaction.id)}
        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </motion.div>
  )
}

// ---------- GOAL CARD ----------
function GoalCard({ goal }: any) {
  const progress = Math.min(100, (goal.saved_amount / goal.target_amount) * 100)

  return (
    <div className="p-3 bg-gray-50 rounded-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-700">{goal.name}</p>
          <p className="text-xs text-gray-400">Target: ₹{goal.target_amount}</p>
        </div>
        <Badge variant={goal.priority === 'high' ? 'default' : 'secondary'} className="text-[10px]">
          {goal.priority || 'medium'}
        </Badge>
      </div>
      <div className="mt-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">₹{goal.saved_amount} saved</span>
          <span className="font-medium text-gray-700">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-1.5 mt-1" />
      </div>
      {goal.target_date && (
        <p className="text-xs text-gray-400 mt-1">Target: {format(new Date(goal.target_date), 'MMM d, yyyy')}</p>
      )}
    </div>
  )
}

// ---------- MAIN COMPONENT ----------
export default function FinancePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // State
  const [transactions, setTransactions] = useState<any[]>([])
  const [budgets, setBudgets] = useState<any[]>([])
  const [goals, setGoals] = useState<any[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])

  // Stats
  const [stats, setStats] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
    savings: 0,
    budgetRemaining: 0,
    goals: 0,
  })

  // Financial Health Score
  const [healthScore, setHealthScore] = useState(0)

  // Modal states
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [showAddBudget, setShowAddBudget] = useState(false)
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [showAddSubscription, setShowAddSubscription] = useState(false)
  const [showAddPayment, setShowAddPayment] = useState(false)

  // Form states
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    payment_method: '',
    description: '',
    tags: '',
  })

  const [newBudget, setNewBudget] = useState({
    category: '',
    amount: '',
    month: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
  })

  const [newGoal, setNewGoal] = useState({
    name: '',
    target_amount: '',
    saved_amount: '0',
    target_date: '',
    priority: 'medium',
    notes: '',
  })

  const [newSubscription, setNewSubscription] = useState({
    name: '',
    cost: '',
    billing_date: '',
    frequency: 'monthly',
    category: '',
    auto_renew: true,
  })

  const [newPayment, setNewPayment] = useState({
    name: '',
    amount: '',
    due_date: '',
    category: '',
    status: 'upcoming',
  })

  // Chart data
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [trendData, setTrendData] = useState<any[]>([])

  useEffect(() => {
    if (user) fetchAllData()
  }, [user])

  const fetchAllData = async () => {
    if (!user) return

    try {
      setLoading(true)

      const [
        { data: transactionsData },
        { data: budgetsData },
        { data: goalsData },
        { data: subscriptionsData },
        { data: paymentsData },
      ] = await Promise.all([
        supabase.from('finance_transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }),
        supabase.from('finance_budgets').select('*').eq('user_id', user.id),
        supabase.from('finance_goals').select('*').eq('user_id', user.id),
        supabase.from('finance_subscriptions').select('*').eq('user_id', user.id),
        supabase.from('finance_payments').select('*').eq('user_id', user.id),
      ])

      setTransactions(transactionsData || [])
      setBudgets(budgetsData || [])
      setGoals(goalsData || [])
      setSubscriptions(subscriptionsData || [])
      setPayments(paymentsData || [])

      // Calculate stats
      const totalIncome = transactionsData?.filter((t: any) => t.type === 'income').reduce((acc: number, t: any) => acc + t.amount, 0) || 0
      const totalExpenses = transactionsData?.filter((t: any) => t.type === 'expense').reduce((acc: number, t: any) => acc + t.amount, 0) || 0
      const balance = totalIncome - totalExpenses
      const totalSavings = goalsData?.reduce((acc: number, g: any) => acc + g.saved_amount, 0) || 0
      const totalBudget = budgetsData?.reduce((acc: number, b: any) => acc + b.amount, 0) || 0

      setStats({
        balance,
        income: totalIncome,
        expenses: totalExpenses,
        savings: totalSavings,
        budgetRemaining: totalBudget - totalExpenses,
        goals: goalsData?.length || 0,
      })

      // Calculate Financial Health Score
      const budgetScore = totalBudget > 0 ? Math.min(30, (1 - (totalExpenses / totalBudget)) * 30) : 0
      const savingsScore = totalIncome > 0 ? Math.min(20, (totalSavings / totalIncome) * 20) : 0
      const consistencyScore = transactionsData?.length > 0 ? Math.min(15, transactionsData.length * 2) : 0
      const goalScore = goalsData?.length > 0 ? Math.min(15, goalsData.length * 3) : 0
      const health = Math.min(100, Math.round(budgetScore + savingsScore + consistencyScore + goalScore))
      setHealthScore(health)

      // Generate chart data
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = subMonths(new Date(), i)
        return format(date, 'MMM')
      }).reverse()

      const monthData = last6Months.map((month) => {
        const monthTransactions = transactionsData?.filter((t: any) => {
          const transMonth = format(new Date(t.date), 'MMM')
          return transMonth === month && t.type === 'expense'
        }) || []
        const total = monthTransactions.reduce((acc: number, t: any) => acc + t.amount, 0)
        return { month, amount: total }
      })
      setMonthlyData(monthData)

      // Category data
      const catMap = new Map()
      transactionsData?.filter((t: any) => t.type === 'expense').forEach((t: any) => {
        catMap.set(t.category, (catMap.get(t.category) || 0) + t.amount)
      })
      const catData = Array.from(catMap.entries()).map(([name, value]) => ({ name, value }))
      setCategoryData(catData)

      // Trend data (last 30 days)
      const last30Days = eachDayOfInterval({
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date(),
      }).map((date) => ({
        date: format(date, 'MMM d'),
        day: format(date, 'd'),
      }))

      const trend = last30Days.map((day) => {
        const dayTransactions = transactionsData?.filter((t: any) => {
          const transDate = format(new Date(t.date), 'MMM d')
          return transDate === day.date && t.type === 'expense'
        }) || []
        const total = dayTransactions.reduce((acc: number, t: any) => acc + t.amount, 0)
        return { ...day, amount: total }
      })
      setTrendData(trend)

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Transaction handlers
  const handleAddTransaction = async () => {
    if (!newTransaction.amount || !newTransaction.category) {
      alert('Please fill in amount and category')
      return
    }

    const { data, error } = await supabase
      .from('finance_transactions')
      .insert({
        user_id: user?.id,
        type: newTransaction.type,
        amount: parseFloat(newTransaction.amount),
        category: newTransaction.category,
        date: newTransaction.date,
        payment_method: newTransaction.payment_method || null,
        description: newTransaction.description || null,
        tags: newTransaction.tags || null,
      })
      .select()

    if (!error && data) {
      setTransactions([data[0], ...transactions])
      setShowAddTransaction(false)
      setNewTransaction({
        type: 'expense',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        payment_method: '',
        description: '',
        tags: '',
      })
      fetchAllData()
    }
  }

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Delete this transaction?')) return
    const { error } = await supabase.from('finance_transactions').delete().eq('id', id)
    if (!error) {
      setTransactions(transactions.filter((t) => t.id !== id))
      fetchAllData()
    }
  }

  // Budget handlers
  const handleAddBudget = async () => {
    if (!newBudget.amount || !newBudget.category) {
      alert('Please fill in amount and category')
      return
    }

    const { data, error } = await supabase
      .from('finance_budgets')
      .insert({
        user_id: user?.id,
        category: newBudget.category,
        amount: parseFloat(newBudget.amount),
        month: newBudget.month || new Date().toISOString().split('T')[0],
        notes: newBudget.notes || null,
      })
      .select()

    if (!error && data) {
      setBudgets([data[0], ...budgets])
      setShowAddBudget(false)
      setNewBudget({ category: '', amount: '', month: format(new Date(), 'yyyy-MM-dd'), notes: '' })
      fetchAllData()
    }
  }

  // Goal handlers
  const handleAddGoal = async () => {
    if (!newGoal.name || !newGoal.target_amount) {
      alert('Please fill in goal name and target amount')
      return
    }

    const { data, error } = await supabase
      .from('finance_goals')
      .insert({
        user_id: user?.id,
        name: newGoal.name,
        target_amount: parseFloat(newGoal.target_amount),
        saved_amount: parseFloat(newGoal.saved_amount || '0'),
        target_date: newGoal.target_date || null,
        priority: newGoal.priority || 'medium',
        notes: newGoal.notes || null,
      })
      .select()

    if (!error && data) {
      setGoals([data[0], ...goals])
      setShowAddGoal(false)
      setNewGoal({ name: '', target_amount: '', saved_amount: '0', target_date: '', priority: 'medium', notes: '' })
      fetchAllData()
    }
  }

  // Subscription handlers
  const handleAddSubscription = async () => {
    if (!newSubscription.name || !newSubscription.cost) {
      alert('Please fill in subscription name and cost')
      return
    }

    const { data, error } = await supabase
      .from('finance_subscriptions')
      .insert({
        user_id: user?.id,
        name: newSubscription.name,
        cost: parseFloat(newSubscription.cost),
        billing_date: newSubscription.billing_date || null,
        frequency: newSubscription.frequency || 'monthly',
        category: newSubscription.category || null,
        auto_renew: newSubscription.auto_renew,
      })
      .select()

    if (!error && data) {
      setSubscriptions([data[0], ...subscriptions])
      setShowAddSubscription(false)
      setNewSubscription({ name: '', cost: '', billing_date: '', frequency: 'monthly', category: '', auto_renew: true })
      fetchAllData()
    }
  }

  const filteredTransactions = transactions.filter((t) =>
    t.category.toLowerCase().includes(search.toLowerCase()) ||
    (t.description || '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* ----- HERO HEADER ----- */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#6D0F2B] to-[#8A1538] p-6 md:p-8 shadow-xl shadow-[#6D0F2B]/20"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <Wallet className="h-6 w-6 text-white/70" />
                <span className="text-xs font-medium tracking-widest text-white/60 uppercase">
                  Personal Finance
                </span>
              </div>
              <h1 className="mt-2 text-2xl md:text-3xl font-bold text-white">
                💰 Finance Tracker
              </h1>
              <p className="mt-1 text-white/70 text-sm">
                Track income, expenses, budgets, and savings goals.
              </p>
            </div>
            <Button
              onClick={() => setShowAddTransaction(true)}
              className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </div>
        </motion.div>

        {/* ----- STATS ----- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            title="Balance"
            value={stats.balance}
            icon={Wallet}
            color="from-blue-500 to-blue-600"
            loading={loading}
          />
          <StatCard
            title="Income"
            value={stats.income}
            icon={TrendingUp}
            color="from-emerald-500 to-green-500"
            loading={loading}
          />
          <StatCard
            title="Expenses"
            value={stats.expenses}
            icon={TrendingDown}
            color="from-red-500 to-red-600"
            loading={loading}
          />
          <StatCard
            title="Savings"
            value={stats.savings}
            icon={PiggyBank}
            color="from-purple-500 to-pink-500"
            loading={loading}
          />
        </div>

        {/* ----- FINANCIAL HEALTH SCORE ----- */}
        <Card className="border-0 shadow-[0_4px_24px_rgba(0,0,0,0.06)] rounded-2xl overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#F8EEF1]">
                <Heart className="h-5 w-5 text-[#6D0F2B]" />
              </div>
              <CardTitle className="text-gray-800">Financial Health</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative">
                <svg className="h-24 w-24 -rotate-90 transform">
                  <circle className="text-gray-200" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="48" cy="48" />
                  <motion.circle
                    initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - healthScore / 100) }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className="text-[#6D0F2B]" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="48" cy="48"
                    strokeLinecap="round" strokeDasharray={2 * Math.PI * 40}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-xl font-bold">{healthScore}</p>
                    <p className="text-[10px] text-gray-400">/ 100</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-lg font-semibold">
                  {healthScore >= 80 ? '🌟 Excellent' :
                   healthScore >= 60 ? '💪 Healthy' :
                   healthScore >= 40 ? '📈 Improving' :
                   '⚠️ Needs Attention'}
                </p>
                <p className="text-sm text-gray-500">
                  {healthScore === 0 ? 'Start tracking your finances to build your score.' :
                   'Based on your financial activity'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ----- TABS ----- */}
        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl p-1 flex-wrap">
            <TabsTrigger value="transactions" className="rounded-lg">📋 Transactions</TabsTrigger>
            <TabsTrigger value="budgets" className="rounded-lg">📊 Budgets</TabsTrigger>
            <TabsTrigger value="goals" className="rounded-lg">🎯 Goals</TabsTrigger>
            <TabsTrigger value="subscriptions" className="rounded-lg">📱 Subscriptions</TabsTrigger>
          </TabsList>

          {/* ----- TRANSACTIONS TAB ----- */}
          <TabsContent value="transactions" className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search transactions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-white/50 backdrop-blur-sm border-gray-200 rounded-xl"
                />
              </div>
              <Button onClick={() => setShowAddTransaction(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </div>

            {transactions.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto w-20 h-20 rounded-full bg-[#F8EEF1] flex items-center justify-center">
                  <Receipt className="h-10 w-10 text-[#6D0F2B]" />
                </div>
                <p className="mt-4 text-lg font-medium text-gray-700">No transactions recorded</p>
                <p className="text-sm text-gray-400">Start tracking your finances by adding a transaction</p>
                <Button onClick={() => setShowAddTransaction(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" /> Add Transaction
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTransactions.slice(0, 10).map((t) => (
                  <TransactionItem key={t.id} transaction={t} onDelete={handleDeleteTransaction} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* ----- BUDGETS TAB ----- */}
          <TabsContent value="budgets" className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-500">Manage your monthly budgets</p>
              </div>
              <Button onClick={() => setShowAddBudget(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Budget
              </Button>
            </div>

            {budgets.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto w-20 h-20 rounded-full bg-[#F8EEF1] flex items-center justify-center">
                  <BarChart3 className="h-10 w-10 text-[#6D0F2B]" />
                </div>
                <p className="mt-4 text-lg font-medium text-gray-700">No budgets created</p>
                <p className="text-sm text-gray-400">Create a budget to track your spending</p>
                <Button onClick={() => setShowAddBudget(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" /> Create Budget
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {budgets.map((budget) => {
                  const spent = transactions
                    .filter((t) => t.category === budget.category && t.type === 'expense')
                    .reduce((acc, t) => acc + t.amount, 0)
                  const progress = Math.min(100, (spent / budget.amount) * 100)
                  const status = progress > 100 ? '🔴 Exceeded' : progress > 80 ? '🟡 Near Limit' : '🟢 Under Budget'

                  return (
                    <div key={budget.id} className="p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-700">{budget.category}</p>
                          <p className="text-xs text-gray-400">₹{budget.amount} budget</p>
                        </div>
                        <Badge
                          variant={progress > 100 ? 'destructive' : progress > 80 ? 'secondary' : 'default'}
                          className="text-[10px]"
                        >
                          {status}
                        </Badge>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">₹{spent.toFixed(2)} spent</span>
                          <span className="font-medium text-gray-700">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={Math.min(100, progress)} className="h-1.5 mt-1" />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* ----- GOALS TAB ----- */}
          <TabsContent value="goals" className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-500">Track your savings goals</p>
              </div>
              <Button onClick={() => setShowAddGoal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Goal
              </Button>
            </div>

            {goals.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto w-20 h-20 rounded-full bg-[#F8EEF1] flex items-center justify-center">
                  <Target className="h-10 w-10 text-[#6D0F2B]" />
                </div>
                <p className="mt-4 text-lg font-medium text-gray-700">No savings goals yet</p>
                <p className="text-sm text-gray-400">Create a goal to start saving</p>
                <Button onClick={() => setShowAddGoal(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" /> Create Goal
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {goals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* ----- SUBSCRIPTIONS TAB ----- */}
          <TabsContent value="subscriptions" className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-500">Manage your subscriptions</p>
              </div>
              <Button onClick={() => setShowAddSubscription(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Subscription
              </Button>
            </div>

            {subscriptions.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto w-20 h-20 rounded-full bg-[#F8EEF1] flex items-center justify-center">
                  <CreditCard className="h-10 w-10 text-[#6D0F2B]" />
                </div>
                <p className="mt-4 text-lg font-medium text-gray-700">No subscriptions added</p>
                <p className="text-sm text-gray-400">Track your recurring payments</p>
                <Button onClick={() => setShowAddSubscription(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" /> Add Subscription
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {subscriptions.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-700">{sub.name}</p>
                      <p className="text-xs text-gray-400">
                        ₹{sub.cost} • {sub.frequency} • {sub.billing_date && format(new Date(sub.billing_date), 'MMM d')}
                      </p>
                    </div>
                    <Badge variant={sub.auto_renew ? 'default' : 'outline'} className="text-[10px]">
                      {sub.auto_renew ? 'Auto-renew' : 'Manual'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* ----- ADD TRANSACTION MODAL ----- */}
      <Dialog open={showAddTransaction} onOpenChange={setShowAddTransaction}>
        <DialogContent className="max-w-2xl rounded-2xl p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-[#6D0F2B] to-[#8A1538] px-6 py-4">
            <DialogHeader>
              <DialogTitle className="text-white text-xl flex items-center gap-2">
                <Plus className="h-5 w-5" /> Add Transaction
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Type *</label>
                <Select
                  value={newTransaction.type}
                  onValueChange={(v) => setNewTransaction({ ...newTransaction, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">💰 Income</SelectItem>
                    <SelectItem value="expense">💸 Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Category *</label>
                <Select
                  value={newTransaction.category}
                  onValueChange={(v) => setNewTransaction({ ...newTransaction, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {newTransaction.type === 'income' ? (
                      INCOME_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))
                    ) : (
                      EXPENSE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.name} value={cat.name}>{cat.icon} {cat.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Amount *</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Date</label>
                <Input
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Payment Method</label>
                <Input
                  placeholder="e.g. UPI, Cash, Card"
                  value={newTransaction.payment_method}
                  onChange={(e) => setNewTransaction({ ...newTransaction, payment_method: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Tags</label>
                <Input
                  placeholder="e.g. college, food"
                  value={newTransaction.tags}
                  onChange={(e) => setNewTransaction({ ...newTransaction, tags: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Input
                  placeholder="Add description..."
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowAddTransaction(false)}>Cancel</Button>
              <Button onClick={handleAddTransaction} className="bg-[#6D0F2B] hover:bg-[#8A1538]">
                <Plus className="h-4 w-4 mr-2" /> Add Transaction
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ----- ADD BUDGET MODAL ----- */}
      <Dialog open={showAddBudget} onOpenChange={setShowAddBudget}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#6D0F2B]" /> Create Budget
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Select
              value={newBudget.category}
              onValueChange={(v) => setNewBudget({ ...newBudget, category: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.name} value={cat.name}>{cat.icon} {cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Budget amount *"
              value={newBudget.amount}
              onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
            />
            <Input
              type="month"
              value={newBudget.month}
              onChange={(e) => setNewBudget({ ...newBudget, month: e.target.value })}
            />
            <Input
              placeholder="Notes (optional)"
              value={newBudget.notes}
              onChange={(e) => setNewBudget({ ...newBudget, notes: e.target.value })}
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddBudget(false)}>Cancel</Button>
              <Button onClick={handleAddBudget} className="bg-[#6D0F2B] hover:bg-[#8A1538]">
                <Plus className="h-4 w-4 mr-2" /> Create Budget
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ----- ADD GOAL MODAL ----- */}
      <Dialog open={showAddGoal} onOpenChange={setShowAddGoal}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-[#6D0F2B]" /> Create Savings Goal
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              placeholder="Goal name *"
              value={newGoal.name}
              onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Target amount *"
              value={newGoal.target_amount}
              onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Amount saved"
              value={newGoal.saved_amount}
              onChange={(e) => setNewGoal({ ...newGoal, saved_amount: e.target.value })}
            />
            <Input
              type="date"
              placeholder="Target date"
              value={newGoal.target_date}
              onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
            />
            <Select
              value={newGoal.priority}
              onValueChange={(v) => setNewGoal({ ...newGoal, priority: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">🟢 Low</SelectItem>
                <SelectItem value="medium">🟡 Medium</SelectItem>
                <SelectItem value="high">🔴 High</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Notes (optional)"
              value={newGoal.notes}
              onChange={(e) => setNewGoal({ ...newGoal, notes: e.target.value })}
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddGoal(false)}>Cancel</Button>
              <Button onClick={handleAddGoal} className="bg-[#6D0F2B] hover:bg-[#8A1538]">
                <Plus className="h-4 w-4 mr-2" /> Create Goal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ----- ADD SUBSCRIPTION MODAL ----- */}
      <Dialog open={showAddSubscription} onOpenChange={setShowAddSubscription}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[#6D0F2B]" /> Add Subscription
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              placeholder="Subscription name *"
              value={newSubscription.name}
              onChange={(e) => setNewSubscription({ ...newSubscription, name: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Monthly cost *"
              value={newSubscription.cost}
              onChange={(e) => setNewSubscription({ ...newSubscription, cost: e.target.value })}
            />
            <Input
              type="date"
              placeholder="Billing date"
              value={newSubscription.billing_date}
              onChange={(e) => setNewSubscription({ ...newSubscription, billing_date: e.target.value })}
            />
            <Select
              value={newSubscription.frequency}
              onValueChange={(v) => setNewSubscription({ ...newSubscription, frequency: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Category"
              value={newSubscription.category}
              onChange={(e) => setNewSubscription({ ...newSubscription, category: e.target.value })}
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="auto_renew"
                checked={newSubscription.auto_renew}
                onChange={(e) => setNewSubscription({ ...newSubscription, auto_renew: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-[#6D0F2B] focus:ring-[#6D0F2B]"
              />
              <label htmlFor="auto_renew" className="text-sm text-gray-600">Auto-renew</label>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddSubscription(false)}>Cancel</Button>
              <Button onClick={handleAddSubscription} className="bg-[#6D0F2B] hover:bg-[#8A1538]">
                <Plus className="h-4 w-4 mr-2" /> Add Subscription
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}