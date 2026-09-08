'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { format, isToday, isAfter, isBefore, addDays, differenceInDays, startOfDay, endOfDay } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
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
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  Target,
  Sparkles,
  Flame,
  Brain,
  TrendingUp,
  TrendingDown,
  BookOpen,
  Briefcase,
  Building2,
  DollarSign,
  Play,
  Pause,
  Square,
  Trash2,
  Edit,
  ChevronRight,
  ListChecks,
  Timer,
  Award,
  AlertCircle,
  Check,
  X,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Smile,
  Meh,
  Frown,
  Coffee,
  Sun,
  Moon,
  Star,
  Zap,
} from 'lucide-react'

// ---------- ANIMATIONS ----------
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

// ---------- QUOTES ----------
const QUOTES = [
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { quote: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { quote: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { quote: "The best time to start was yesterday. The next best time is now.", author: "Unknown" },
  { quote: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { quote: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { quote: "You don't have to be extreme, just consistent.", author: "Unknown" },
  { quote: "The key is not to prioritize what's on your schedule, but to schedule your priorities.", author: "Stephen Covey" },
]

// ---------- TASK ITEM ----------
function TaskItem({ task, onToggle, onDelete }: any) {
  const priorityColors = {
    high: 'bg-red-500',
    medium: 'bg-amber-500',
    low: 'bg-blue-500',
  }

  const categoryIcons: any = {
    subject: '📚',
    assignment: '📝',
    placement: '💼',
    internship: '🚀',
    finance: '💰',
    personal: '📌',
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(109,15,43,0.08)] transition-all duration-300"
    >
      <Checkbox
        checked={task.completed}
        onCheckedChange={() => onToggle(task.id, !task.completed)}
        className="data-[state=checked]:bg-[#6D0F2B] data-[state=checked]:border-[#6D0F2B]"
      />
      <div className="flex-1">
        <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>{categoryIcons[task.category] || '📌'}</span>
          <span>{task.category || 'personal'}</span>
          {task.due_time && <span>• {task.due_time}</span>}
          {task.duration && <span>• {task.duration}min</span>}
        </div>
      </div>
      <div className={`h-2 w-2 rounded-full ${priorityColors[task.priority || 'medium']}`} />
      <button
        onClick={() => onDelete(task.id)}
        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  )
}

// ---------- TIMELINE ITEM ----------
function TimelineItem({ event }: any) {
  const icons: any = {
    study: '📖',
    assignment: '📝',
    placement: '💼',
    internship: '🚀',
    finance: '💰',
    task: '✅',
    class: '🏫',
    exam: '📋',
  }

  return (
    <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
      <div className="text-lg">{icons[event.type] || '📌'}</div>
      <div className="flex-1">
        <p className="text-sm text-gray-700">{event.title}</p>
        <p className="text-xs text-gray-400">{event.time}</p>
      </div>
      <Badge variant="outline" className="text-[10px]">{event.category || 'general'}</Badge>
    </div>
  )
}

// ---------- MAIN COMPONENT ----------
export default function TodayPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [greeting, setGreeting] = useState('Good Morning')
  const [quote, setQuote] = useState(QUOTES[0])

  // Tasks
  const [tasks, setTasks] = useState<any[]>([])
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    category: 'personal',
    priority: 'medium',
    due_time: '',
    duration: '',
  })

  // Timer
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerDuration, setTimerDuration] = useState(25)
  const [timerMinutes, setTimerMinutes] = useState(25)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null)

  // Stats
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    studyMinutes: 0,
    focusSessions: 0,
    problemsSolved: 0,
    applicationsSubmitted: 0,
    expensesLogged: 0,
    productivityScore: 0,
  })

  // Data
  const [deadlines, setDeadlines] = useState<any[]>([])
  const [timeline, setTimeline] = useState<any[]>([])
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [mood, setMood] = useState<string>('')
  const [reflection, setReflection] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 17) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')

    // Random quote
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)])

    if (user) fetchAllData()
  }, [user])

  const fetchAllData = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Fetch from all modules
      const [
        { data: assignments },
        { data: subjects },
        { data: topics },
        { data: sessions },
        { data: companies },
        { data: internships },
        { data: transactions },
        { data: codingProblems },
      ] = await Promise.all([
        supabase.from('assignments').select('*').eq('user_id', user.id).eq('completed', false).order('due_date', { ascending: true }),
        supabase.from('subjects').select('*').eq('user_id', user.id),
        supabase.from('topics').select('*').eq('user_id', user.id).eq('completed', false),
        supabase.from('study_sessions').select('*').eq('user_id', user.id).order('date', { ascending: false }),
        supabase.from('companies').select('*').eq('user_id', user.id).order('application_deadline', { ascending: true }),
        supabase.from('internships_applications').select('*').eq('user_id', user.id).order('application_deadline', { ascending: true }),
        supabase.from('finance_transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }),
        supabase.from('coding_problems').select('*').eq('user_id', user.id).order('date_solved', { ascending: false }),
      ])

      // Build today's tasks
      const todayTasks: any[] = []

      // Assignments due today
      assignments?.forEach((a: any) => {
        if (a.due_date && isToday(new Date(a.due_date))) {
          todayTasks.push({
            id: `assign-${a.id}`,
            title: a.title,
            category: 'assignment',
            priority: a.priority || 'high',
            due_time: 'Today',
            duration: '30',
            completed: false,
            source: 'assignment',
            sourceId: a.id,
          })
        }
      })

      // Topics to study (from subjects)
      const pendingTopics = topics?.filter((t: any) => !t.completed) || []
      pendingTopics.slice(0, 3).forEach((t: any) => {
        const subject = subjects?.find((s: any) => s.id === t.unit_id)
        todayTasks.push({
          id: `topic-${t.id}`,
          title: t.name,
          category: 'subject',
          priority: 'medium',
          due_time: 'Today',
          duration: '25',
          completed: false,
          source: 'topic',
          sourceId: t.id,
          subjectName: subject?.name || 'Subject',
        })
      })

      // Placement tasks
      companies?.forEach((c: any) => {
        if (c.application_deadline && isToday(new Date(c.application_deadline))) {
          todayTasks.push({
            id: `placement-${c.id}`,
            title: `Apply to ${c.name}`,
            category: 'placement',
            priority: 'high',
            due_time: 'Today',
            duration: '30',
            completed: false,
            source: 'placement',
            sourceId: c.id,
          })
        }
      })

      // Internship tasks
      internships?.forEach((i: any) => {
        if (i.application_deadline && isToday(new Date(i.application_deadline))) {
          todayTasks.push({
            id: `internship-${i.id}`,
            title: `Apply to ${i.company_name}`,
            category: 'internship',
            priority: 'high',
            due_time: 'Today',
            duration: '30',
            completed: false,
            source: 'internship',
            sourceId: i.id,
          })
        }
      })

      // Finance tasks
      if (transactions?.length === 0) {
        todayTasks.push({
          id: 'finance-log',
          title: 'Log Today\'s Expenses',
          category: 'finance',
          priority: 'medium',
          due_time: 'Today',
          duration: '5',
          completed: false,
          source: 'finance',
          sourceId: 'log',
        })
      }

      // Sort by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      todayTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

      setTasks(todayTasks)

      // Calculate stats
      const completed = todayTasks.filter((t) => t.completed).length
      const totalStudyMinutes = sessions?.reduce((acc: number, s: any) => acc + (s.duration || 0), 0) || 0
      const focusSessions = sessions?.filter((s: any) => isToday(new Date(s.date))).length || 0
      const problemsSolved = codingProblems?.filter((p: any) => isToday(new Date(p.date_solved))).length || 0
      const applicationsSubmitted = internships?.filter((i: any) => i.status === 'applied').length || 0
      const expensesLogged = transactions?.filter((t: any) => isToday(new Date(t.date))).length || 0

      const productivityScore = Math.min(100, 
        (completed * 10) + 
        (totalStudyMinutes / 60 * 5) + 
        (problemsSolved * 5) +
        (applicationsSubmitted * 10) +
        (expensesLogged * 5)
      )

      setStats({
        tasksCompleted: completed,
        studyMinutes: totalStudyMinutes,
        focusSessions,
        problemsSolved,
        applicationsSubmitted,
        expensesLogged,
        productivityScore: Math.round(productivityScore),
      })

      // Generate deadlines
      const allDeadlines: any[] = []
      assignments?.forEach((a: any) => {
        if (a.due_date) {
          allDeadlines.push({
            title: a.title,
            type: 'Assignment',
            date: a.due_date,
            days: differenceInDays(new Date(a.due_date), new Date()),
          })
        }
      })
      companies?.forEach((c: any) => {
        if (c.application_deadline) {
          allDeadlines.push({
            title: `${c.name} Application`,
            type: 'Placement',
            date: c.application_deadline,
            days: differenceInDays(new Date(c.application_deadline), new Date()),
          })
        }
      })
      internships?.forEach((i: any) => {
        if (i.application_deadline) {
          allDeadlines.push({
            title: `${i.company_name} Internship`,
            type: 'Internship',
            date: i.application_deadline,
            days: differenceInDays(new Date(i.application_deadline), new Date()),
          })
        }
      })
      allDeadlines.sort((a, b) => a.days - b.days)
      setDeadlines(allDeadlines.filter((d) => d.days <= 7))

      // Generate timeline
      const todayEvents: any[] = []
      if (sessions) {
        sessions.filter((s: any) => isToday(new Date(s.date))).forEach((s: any) => {
          todayEvents.push({
            title: `Study Session (${s.duration}min)`,
            type: 'study',
            category: 'study',
            time: format(new Date(s.date), 'h:mm a'),
          })
        })
      }
      if (transactions) {
        transactions.filter((t: any) => isToday(new Date(t.date))).forEach((t: any) => {
          todayEvents.push({
            title: `${t.type === 'income' ? 'Income' : 'Expense'}: ₹${t.amount}`,
            type: 'finance',
            category: 'finance',
            time: format(new Date(t.date), 'h:mm a'),
          })
        })
      }
      if (codingProblems) {
        codingProblems.filter((p: any) => isToday(new Date(p.date_solved))).forEach((p: any) => {
          todayEvents.push({
            title: `Solved: ${p.name}`,
            type: 'task',
            category: 'coding',
            time: format(new Date(p.date_solved), 'h:mm a'),
          })
        })
      }
      todayEvents.sort((a, b) => a.time.localeCompare(b.time))
      setTimeline(todayEvents.slice(0, 5))

      // Generate recommendations
      const recs: string[] = []
      const pendingAssignments = assignments?.filter((a: any) => !a.completed) || []
      if (pendingAssignments.length > 0) {
        recs.push(`Complete your pending assignments (${pendingAssignments.length} remaining)`)
      }
      if (topics && topics.length > 0) {
        const pending = topics.filter((t: any) => !t.completed)
        if (pending.length > 0) {
          recs.push(`Study "${pending[0]?.name || 'your next topic'}" today`)
        }
      }
      if (internships && internships.length === 0) {
        recs.push('Start applying for internships to build your experience')
      }
      if (transactions && transactions.length === 0) {
        recs.push('Log your first expense to start tracking your finances')
      }
      if (recs.length === 0) {
        recs.push('You\'re all caught up! Keep up the great work! 🎉')
      }
      setRecommendations(recs)

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Task handlers
  const handleAddTask = async () => {
    if (!newTask.title) return

    const task = {
      id: `manual-${Date.now()}`,
      title: newTask.title,
      category: newTask.category,
      priority: newTask.priority,
      due_time: newTask.due_time || 'Today',
      duration: newTask.duration || '15',
      completed: false,
      source: 'manual',
    }

    setTasks([task, ...tasks])
    setShowAddTask(false)
    setNewTask({ title: '', category: 'personal', priority: 'medium', due_time: '', duration: '' })
  }

  const handleToggleTask = (id: string, completed: boolean) => {
    setTasks(tasks.map((t) => t.id === id ? { ...t, completed } : t))
    // Update stats
    const newCompleted = tasks.filter((t) => t.id === id ? completed : t.completed).filter((t) => t.completed).length
    setStats({ ...stats, tasksCompleted: newCompleted })
  }

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id))
  }

  // Timer handlers
  const startTimer = () => {
    if (timerRunning) return
    setTimerRunning(true)
    setTimerMinutes(timerDuration)
    setTimerSeconds(0)

    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev === 0) {
          if (timerMinutes === 0) {
            clearInterval(interval)
            setTimerRunning(false)
            // Log session
            logStudySession(timerDuration)
            return 0
          }
          setTimerMinutes((m) => m - 1)
          return 59
        }
        return prev - 1
      })
    }, 1000)
    setTimerInterval(interval)
  }

  const pauseTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval)
      setTimerInterval(null)
      setTimerRunning(false)
    }
  }

  const resetTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval)
      setTimerInterval(null)
    }
    setTimerRunning(false)
    setTimerMinutes(timerDuration)
    setTimerSeconds(0)
  }

  const logStudySession = async (duration: number) => {
    if (!user) return
    await supabase.from('study_sessions').insert({
      user_id: user.id,
      duration: duration,
      date: new Date().toISOString(),
    })
    fetchAllData()
  }

  const formatTime = (minutes: number, seconds: number) => {
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  // Mood check-in
  const handleMood = (moodValue: string) => {
    setMood(moodValue)
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* ----- HEADER ----- */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-[#6D0F2B] to-[#8A1538] shadow-lg shadow-[#6D0F2B]/20">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{greeting}, {user?.user_metadata?.name || 'Student'} 👋</h1>
                <p className="text-sm text-gray-500">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500 italic">
              “{quote.quote}” — {quote.author}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-gray-500">Today's Progress</p>
              <div className="flex items-center gap-2">
                <div className="w-32">
                  <Progress value={stats.productivityScore} className="h-2" />
                </div>
                <span className="text-sm font-medium text-[#6D0F2B]">{stats.productivityScore}%</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ----- STATS ----- */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
        >
          <Card className="border-0 shadow-[0_4px_16px_rgba(0,0,0,0.05)] rounded-2xl">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-[#6D0F2B]">{stats.tasksCompleted}</p>
              <p className="text-xs text-gray-400">Tasks Done</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-[0_4px_16px_rgba(0,0,0,0.05)] rounded-2xl">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-[#6D0F2B]">{Math.round(stats.studyMinutes / 60)}h</p>
              <p className="text-xs text-gray-400">Study Time</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-[0_4px_16px_rgba(0,0,0,0.05)] rounded-2xl">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-[#6D0F2B]">{stats.focusSessions}</p>
              <p className="text-xs text-gray-400">Focus Sessions</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-[0_4px_16px_rgba(0,0,0,0.05)] rounded-2xl">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-[#6D0F2B]">{stats.problemsSolved}</p>
              <p className="text-xs text-gray-400">Problems</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-[0_4px_16px_rgba(0,0,0,0.05)] rounded-2xl">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-[#6D0F2B]">{stats.applicationsSubmitted}</p>
              <p className="text-xs text-gray-400">Applications</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-[0_4px_16px_rgba(0,0,0,0.05)] rounded-2xl">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-[#6D0F2B]">{stats.expensesLogged}</p>
              <p className="text-xs text-gray-400">Expenses</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* ----- MAIN GRID ----- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN - Tasks */}
          <div className="lg:col-span-2 space-y-6">
            {/* Priority Tasks */}
            <Card className="border-0 shadow-[0_4px_24px_rgba(0,0,0,0.06)] rounded-2xl overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#F8EEF1]">
                      <Target className="h-5 w-5 text-[#6D0F2B]" />
                    </div>
                    <CardTitle className="text-gray-800">Today's Priority Tasks</CardTitle>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddTask(true)}
                    className="gap-1"
                  >
                    <Plus className="h-4 w-4" /> Add Task
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-[#F8EEF1] flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8 text-[#6D0F2B]" />
                    </div>
                    <p className="mt-3 text-gray-500">No tasks for today</p>
                    <p className="text-sm text-gray-400">Start by creating your first task</p>
                    <Button 
                      onClick={() => setShowAddTask(true)} 
                      className="mt-4 bg-[#6D0F2B] hover:bg-[#8A1538]"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Create Your First Task
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={handleToggleTask}
                        onDelete={handleDeleteTask}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="border-0 shadow-[0_4px_24px_rgba(0,0,0,0.06)] rounded-2xl overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#F8EEF1]">
                    <Clock className="h-5 w-5 text-[#6D0F2B]" />
                  </div>
                  <CardTitle className="text-gray-800">Today's Timeline</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {timeline.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-gray-500">No activity yet today</p>
                    <p className="text-sm text-gray-400">Start your day by completing tasks</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {timeline.map((event, i) => (
                      <TimelineItem key={i} event={event} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Focus Timer */}
            <Card className="border-0 shadow-[0_4px_24px_rgba(0,0,0,0.06)] rounded-2xl overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#F8EEF1]">
                    <Timer className="h-5 w-5 text-[#6D0F2B]" />
                  </div>
                  <CardTitle className="text-gray-800">Focus Session</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-5xl font-bold text-[#6D0F2B] font-mono">
                    {formatTime(timerMinutes, timerSeconds)}
                  </div>
                  <div className="flex gap-2 justify-center mt-2">
                    <Button
                      variant={timerDuration === 25 ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => { if (!timerRunning) { setTimerDuration(25); setTimerMinutes(25); setTimerSeconds(0) } }}
                      className={timerDuration === 25 ? 'bg-[#6D0F2B] hover:bg-[#8A1538]' : ''}
                    >
                      25m
                    </Button>
                    <Button
                      variant={timerDuration === 50 ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => { if (!timerRunning) { setTimerDuration(50); setTimerMinutes(50); setTimerSeconds(0) } }}
                      className={timerDuration === 50 ? 'bg-[#6D0F2B] hover:bg-[#8A1538]' : ''}
                    >
                      50m
                    </Button>
                    <Button
                      variant={timerDuration === 90 ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => { if (!timerRunning) { setTimerDuration(90); setTimerMinutes(90); setTimerSeconds(0) } }}
                      className={timerDuration === 90 ? 'bg-[#6D0F2B] hover:bg-[#8A1538]' : ''}
                    >
                      90m
                    </Button>
                  </div>
                  <div className="flex gap-2 justify-center mt-3">
                    {!timerRunning && timerMinutes === timerDuration && timerSeconds === 0 ? (
                      <Button onClick={startTimer} className="bg-[#6D0F2B] hover:bg-[#8A1538]">
                        <Play className="h-4 w-4 mr-2" /> Start
                      </Button>
                    ) : timerRunning ? (
                      <>
                        <Button onClick={pauseTimer} variant="outline">
                          <Pause className="h-4 w-4 mr-2" /> Pause
                        </Button>
                        <Button onClick={resetTimer} variant="outline">
                          <Square className="h-4 w-4 mr-2" /> Reset
                        </Button>
                      </>
                    ) : (
                      <Button onClick={startTimer} className="bg-[#6D0F2B] hover:bg-[#8A1538]">
                        <Play className="h-4 w-4 mr-2" /> Resume
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Smart Recommendations */}
            <Card className="border-0 shadow-[0_4px_24px_rgba(0,0,0,0.06)] rounded-2xl overflow-hidden bg-[#F8EEF1]">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#6D0F2B]/10">
                    <Brain className="h-5 w-5 text-[#6D0F2B]" />
                  </div>
                  <CardTitle className="text-gray-800">Smart Recommendations</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {recommendations.length === 0 ? (
                  <p className="text-sm text-gray-500">Add subjects, tasks, or goals to receive personalized recommendations.</p>
                ) : (
                  <ul className="space-y-2">
                    {recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-[#6D0F2B] mt-0.5">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card className="border-0 shadow-[0_4px_24px_rgba(0,0,0,0.06)] rounded-2xl overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#F8EEF1]">
                    <AlertCircle className="h-5 w-5 text-[#6D0F2B]" />
                  </div>
                  <CardTitle className="text-gray-800">Upcoming Deadlines</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {deadlines.length === 0 ? (
                  <p className="text-sm text-gray-500">No upcoming deadlines.</p>
                ) : (
                  <div className="space-y-2">
                    {deadlines.slice(0, 4).map((d, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-700">{d.title}</p>
                          <p className="text-xs text-gray-400">{d.type}</p>
                        </div>
                        <Badge
                          variant={d.days <= 1 ? 'destructive' : d.days <= 3 ? 'secondary' : 'outline'}
                          className="text-[10px]"
                        >
                          {d.days <= 0 ? 'Due Today' : `${d.days}d left`}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mood Check-in */}
            <Card className="border-0 shadow-[0_4px_24px_rgba(0,0,0,0.06)] rounded-2xl overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#F8EEF1]">
                    <Smile className="h-5 w-5 text-[#6D0F2B]" />
                  </div>
                  <CardTitle className="text-gray-800">How are you feeling?</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => handleMood('great')}
                    className={`text-3xl p-2 rounded-xl transition-all ${mood === 'great' ? 'bg-[#F8EEF1] scale-110' : 'hover:bg-gray-100'}`}
                  >
                    😊
                  </button>
                  <button
                    onClick={() => handleMood('good')}
                    className={`text-3xl p-2 rounded-xl transition-all ${mood === 'good' ? 'bg-[#F8EEF1] scale-110' : 'hover:bg-gray-100'}`}
                  >
                    🙂
                  </button>
                  <button
                    onClick={() => handleMood('okay')}
                    className={`text-3xl p-2 rounded-xl transition-all ${mood === 'okay' ? 'bg-[#F8EEF1] scale-110' : 'hover:bg-gray-100'}`}
                  >
                    😐
                  </button>
                  <button
                    onClick={() => handleMood('stressed')}
                    className={`text-3xl p-2 rounded-xl transition-all ${mood === 'stressed' ? 'bg-[#F8EEF1] scale-110' : 'hover:bg-gray-100'}`}
                  >
                    😟
                  </button>
                  <button
                    onClick={() => handleMood('tired')}
                    className={`text-3xl p-2 rounded-xl transition-all ${mood === 'tired' ? 'bg-[#F8EEF1] scale-110' : 'hover:bg-gray-100'}`}
                  >
                    😴
                  </button>
                </div>
                {mood && (
                  <p className="text-center text-sm text-gray-500 mt-2">
                    Checked in at {format(new Date(), 'h:mm a')}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* ----- ADD TASK MODAL ----- */}
      <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-[#6D0F2B]" /> Add Task
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              placeholder="Task title *"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            <Select
              value={newTask.category}
              onValueChange={(v) => setNewTask({ ...newTask, category: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="subject">📚 Subject</SelectItem>
                <SelectItem value="assignment">📝 Assignment</SelectItem>
                <SelectItem value="placement">💼 Placement</SelectItem>
                <SelectItem value="internship">🚀 Internship</SelectItem>
                <SelectItem value="finance">💰 Finance</SelectItem>
                <SelectItem value="personal">📌 Personal</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={newTask.priority}
              onValueChange={(v) => setNewTask({ ...newTask, priority: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">🔴 High</SelectItem>
                <SelectItem value="medium">🟡 Medium</SelectItem>
                <SelectItem value="low">🟢 Low</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="time"
              placeholder="Due time"
              value={newTask.due_time}
              onChange={(e) => setNewTask({ ...newTask, due_time: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Duration (minutes)"
              value={newTask.duration}
              onChange={(e) => setNewTask({ ...newTask, duration: e.target.value })}
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddTask(false)}>Cancel</Button>
              <Button onClick={handleAddTask} className="bg-[#6D0F2B] hover:bg-[#8A1538]">
                <Plus className="h-4 w-4 mr-2" /> Add Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}