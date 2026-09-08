'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { format, subDays, eachDayOfInterval, differenceInDays, isSameDay, startOfMonth, endOfMonth, startOfWeek } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  BookOpen,
  Briefcase,
  DollarSign,
  Calendar,
  Clock,
  GraduationCap,
  Target,
  Wallet,
  Building2,
  Activity,
  Sparkles,
  Flame,
  Brain,
  CheckCircle2,
  Plus,
  ArrowUpRight,
  Award,
  Zap,
  Trophy,
  Users,
  FileText,
  Timer,
  PieChart as PieChartIcon,
  BarChart3,
  Rocket,
  AlertCircle,
  Search,
  Bell,
  Sun,
  Moon,
  User,
  LogOut,
  Settings,
  HelpCircle,
  ChevronDown,
  Star,
  Medal,
  Crown,
  GitBranch,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  ListChecks,
  Notebook,
  Code2,
  BriefcaseBusiness,
  PiggyBank,
  Heart,
} from 'lucide-react'

// Import the Virtual Pet
import { VirtualPet } from '@/components/ProductivityPet/VirtualPet'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

// ---------- COMPACT STAT CARD ----------
function CompactStatCard({ title, value, icon: Icon, color, loading }: any) {
  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp}>
      <Card className="border-0 shadow-[0_4px_16px_rgba(0,0,0,0.05)] rounded-2xl overflow-hidden hover:shadow-[0_8px_32px_rgba(109,15,43,0.10)] transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</p>
              {loading ? (
                <Skeleton className="h-6 w-12 mt-1" />
              ) : (
                <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
              )}
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

// ---------- MODULE CARD ----------
function ModuleCard({ title, icon, stats, emptyMessage, actionLabel, actionHref, color, loading }: any) {
  const hasData = stats.some((s: any) => s.value > 0)

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp}>
      <Card className="border-0 shadow-[0_4px_20px_rgba(0,0,0,0.06)] rounded-2xl overflow-hidden hover:shadow-[0_8px_40px_rgba(109,15,43,0.12)] transition-all duration-300 group">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`rounded-xl bg-gradient-to-br ${color} p-2.5 shadow-lg shadow-[#6D0F2B]/20`}>
                <span className="text-lg">{icon}</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{title}</h3>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-[#6D0F2B] opacity-0 group-hover:opacity-100 transition-opacity" asChild>
              <a href={actionHref}>
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-2 mt-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-xl" />
              ))}
            </div>
          ) : hasData ? (
            <div className="grid grid-cols-2 gap-2 mt-4">
              {stats.map((stat: any, i: number) => (
                <div key={i} className="rounded-xl bg-gray-50 p-2.5">
                  <p className="text-xs text-gray-400">{stat.label}</p>
                  <p className="text-sm font-semibold text-gray-800">{stat.value}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 p-4 rounded-xl bg-[#F8EEF1] text-center">
              <p className="text-sm text-gray-600">{emptyMessage}</p>
              <Button variant="outline" size="sm" className="mt-2 text-[#6D0F2B] border-[#6D0F2B]/30 text-xs" asChild>
                <a href={actionHref}>
                  <Plus className="h-3 w-3 mr-1" /> {actionLabel}
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ---------- TASK ITEM ----------
function TaskItem({ task }: any) {
  const priorityColors = {
    high: 'bg-red-500',
    medium: 'bg-amber-500',
    low: 'bg-blue-500',
  }

  return (
    <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 hover:bg-gray-100 transition-colors">
      <div className={`h-2 w-2 rounded-full ${priorityColors[task.priority || 'medium']}`} />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800">{task.title}</p>
        <p className="text-xs text-gray-400">{task.duration || '30 min'} • {task.dueTime || 'Today'}</p>
      </div>
      <Badge variant="outline" className="text-[10px]">{task.priority || 'medium'}</Badge>
    </div>
  )
}

// ---------- DEADLINE ITEM ----------
function DeadlineItem({ deadline }: any) {
  const isUrgent = differenceInDays(new Date(deadline.date), new Date()) < 3

  return (
    <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 hover:bg-gray-100 transition-colors">
      <div className={`rounded-lg p-1.5 ${isUrgent ? 'bg-red-100' : 'bg-[#F8EEF1]'}`}>
        <Calendar className={`h-4 w-4 ${isUrgent ? 'text-red-500' : 'text-[#6D0F2B]'}`} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800">{deadline.title}</p>
        <p className="text-xs text-gray-400">{deadline.type} • {format(new Date(deadline.date), 'MMM d, yyyy')}</p>
      </div>
      {isUrgent && <Badge className="bg-red-100 text-red-700 border-0 text-[10px]">Urgent</Badge>}
    </div>
  )
}

// ---------- GOAL ITEM ----------
function GoalItem({ goal, progress }: any) {
  return (
    <div className="rounded-xl bg-gray-50 p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-800">{goal}</p>
        <span className="text-xs text-gray-500">{progress}%</span>
      </div>
      <Progress value={progress} className="h-1.5 mt-1.5" />
    </div>
  )
}

// ---------- ACHIEVEMENT BADGE ----------
function AchievementBadge({ icon, label, unlocked }: any) {
  return (
    <div className={`flex flex-col items-center gap-1 p-3 rounded-xl ${unlocked ? 'bg-[#F8EEF1]' : 'bg-gray-50'}`}>
      <div className={`text-2xl ${unlocked ? '' : 'opacity-30 grayscale'}`}>{icon}</div>
      <p className={`text-[10px] text-center ${unlocked ? 'text-gray-700' : 'text-gray-400'}`}>{label}</p>
      {unlocked && <div className="h-1 w-1 rounded-full bg-[#6D0F2B]" />}
    </div>
  )
}

// ---------- AI MESSAGE ----------
function AIMessage({ message, type }: any) {
  const icons = {
    study: '📚',
    task: '✅',
    finance: '💰',
    placement: '💼',
    internship: '🚀',
    general: '🧠',
  }

  return (
    <div className="rounded-xl bg-[#F8EEF1] p-3 flex items-start gap-3">
      <div className="p-1 rounded-full bg-[#6D0F2B]/10 mt-0.5">
        <span className="text-sm">{icons[type] || icons.general}</span>
      </div>
      <p className="text-sm text-gray-700">{message}</p>
    </div>
  )
}

// ---------- MAIN DASHBOARD ----------
export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const [loading, setLoading] = useState(true)
  const [greeting, setGreeting] = useState('Good Morning')
  const [isDark, setIsDark] = useState(false)

  // State for all data
  const [stats, setStats] = useState({
    productivityScore: 0,
    studyStreak: 0,
    studyHours: 0,
    focusTime: 0,
    subjects: { total: 0, lessons: 0, assignments: 0, hours: 0 },
    placements: { companies: 0, problems: 0, interviews: 0, resume: 'Not Started' },
    internships: { applications: 0, interviews: 0, offers: 0, certificates: 0 },
    finance: { balance: 0, spending: 0, savings: 0, budget: 0 },
  })

  const [subjects, setSubjects] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [codingProblems, setCodingProblems] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [internships, setInternships] = useState<any[]>([])
  const [studySessions, setStudySessions] = useState<any[]>([])
  const [todaysTasks, setTodaysTasks] = useState<any[]>([])
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([])
  const [weeklyGoals, setWeeklyGoals] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [heatmapData, setHeatmapData] = useState<any[]>([])
  const [achievements, setAchievements] = useState<any[]>([])
  const [aiMessages, setAiMessages] = useState<any[]>([])
  const [totalStudyHours, setTotalStudyHours] = useState(0)
  const [streak, setStreak] = useState(0)
  const [xpData, setXpData] = useState({ xp: 0, level: 1, nextLevelXp: 100 })

  // Smart Tip
  const [smartTip, setSmartTip] = useState('')
  const [smartTipAction, setSmartTipAction] = useState('')
  const [smartTipButton, setSmartTipButton] = useState('')

  // Pet State
  const [petLevel, setPetLevel] = useState(1)
  const [petXP, setPetXP] = useState(0)
  const [petHappiness, setPetHappiness] = useState(50)
  const [petEmoji, setPetEmoji] = useState('🐣')
  const [petMessage, setPetMessage] = useState('Your pet is sleeping...')
  const [petSubMessage, setPetSubMessage] = useState('Complete tasks to wake them up!')

  // Task counters for pet
  const [todayTasks, setTodayTasks] = useState(0)
  const [weeklyTasks, setWeeklyTasks] = useState(0)

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 17) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')
  }, [])

  useEffect(() => {
    if (user) fetchAllData()
  }, [user])

  // Update pet whenever data changes
  useEffect(() => {
    updatePet()
  }, [subjects, codingProblems, assignments, streak, todayTasks, weeklyTasks, totalStudyHours])

  const updatePet = () => {
    // Calculate XP from activities
    const totalXP =
      (subjects.length * 5) +
      (codingProblems.length * 2) +
      (assignments.filter((a: any) => a.completed).length * 10) +
      (studySessions?.length * 3) || 0

    // Calculate happiness
    const happiness = Math.min(100,
      50 +
      (streak * 2) +
      (todayTasks * 3) +
      (weeklyTasks * 1)
    )

    const level = Math.floor(totalXP / 100) + 1

    // Pet evolution
    const getPetEmoji = (lvl: number) => {
      if (lvl >= 10) return '🐉'
      if (lvl >= 8) return '🦄'
      if (lvl >= 6) return '🦊'
      if (lvl >= 4) return '🐱'
      if (lvl >= 2) return '🐶'
      return '🐣'
    }

    // Pet messages
    const getPetMessages = () => {
      if (todayTasks === 0 && weeklyTasks === 0 && totalStudyHours === 0) {
        return {
          message: '😴 Your pet is sleeping...',
          sub: 'Complete tasks to wake them up!'
        }
      }
      if (streak >= 7) {
        return {
          message: '🔥 Your pet is on fire! Amazing streak!',
          sub: `Level ${level} • ${totalXP} XP total`
        }
      }
      if (happiness >= 80) {
        return {
          message: '🥰 Your pet is super happy! Keep it up!',
          sub: `${todayTasks} tasks done today • ${totalStudyHours.toFixed(1)}h studied`
        }
      }
      if (happiness >= 50) {
        return {
          message: '😊 Your pet is happy and healthy!',
          sub: `${streak} day streak • Keep going!`
        }
      }
      return {
        message: '😐 Your pet is feeling a bit lonely...',
        sub: 'Complete some tasks to cheer them up!'
      }
    }

    setPetLevel(level)
    setPetXP(totalXP)
    setPetHappiness(Math.round(Math.min(100, happiness)))
    setPetEmoji(getPetEmoji(level))

    const messages = getPetMessages()
    setPetMessage(messages.message)
    setPetSubMessage(messages.sub)
  }

  const generateSmartTip = useCallback(() => {
    const tips = []
    
    const pendingAssignments = assignments?.filter((a: any) => !a.completed) || []
    if (pendingAssignments.length > 0) {
      tips.push({
        message: `📝 You have ${pendingAssignments.length} pending assignment${pendingAssignments.length > 1 ? 's' : ''}. Complete them to boost your progress!`,
        action: '/dashboard/academic',
        button: 'View Assignments →'
      })
    }
    
    if (totalStudyHours < 5) {
      tips.push({
        message: '💡 You\'ve studied less this month. A 25-minute session today would help you build consistency!',
        action: '/dashboard/today',
        button: 'Start Study Session →'
      })
    }
    
    const totalProblems = codingProblems?.length || 0
    if (totalProblems < 10) {
      tips.push({
        message: `💻 You've solved ${totalProblems} coding problems. Practice 2 problems today to improve your skills!`,
        action: '/dashboard/placement',
        button: 'Practice DSA →'
      })
    }
    
    const totalInternships = internships?.length || 0
    if (totalInternships === 0) {
      tips.push({
        message: '🚀 Start your career journey! Apply for internships to gain experience.',
        action: '/dashboard/internship',
        button: 'Apply Now →'
      })
    }
    
    const expenses = transactions?.filter((t: any) => t.type === 'expense').reduce((acc: number, t: any) => acc + t.amount, 0) || 0
    if (expenses === 0) {
      tips.push({
        message: '💰 Start tracking your expenses to build healthy financial habits.',
        action: '/dashboard/finance',
        button: 'Log Expense →'
      })
    }
    
    if (tips.length === 0) {
      tips.push({
        message: '🌟 You\'re doing great! Keep up the momentum and stay consistent.',
        action: '/dashboard/today',
        button: 'Plan Your Day →'
      })
    }
    
    const selected = tips[Math.floor(Math.random() * tips.length)]
    setSmartTipAction(selected.action)
    setSmartTipButton(selected.button)
    return selected.message
  }, [assignments, codingProblems, internships, transactions, totalStudyHours])

  const fetchAllData = async () => {
    if (!user) return

    try {
      setLoading(true)

      const [
        { data: subjectsData },
        { data: assignmentsData },
        { data: placementsData },
        { data: internshipsData },
        { data: transactionsData },
        { data: tasksData },
        { data: sessionsData },
        { data: dsaTopicsData },
        { data: lessonsData },
        { data: unitsData },
      ] = await Promise.all([
        supabase.from('subjects').select('*').eq('user_id', user.id),
        supabase.from('assignments').select('*').eq('user_id', user.id),
        supabase.from('companies').select('*').eq('user_id', user.id),
        supabase.from('internships_applications').select('*').eq('user_id', user.id),
        supabase.from('finance_transactions').select('*').eq('user_id', user.id),
        supabase.from('assignments').select('*').eq('user_id', user.id),
        supabase.from('study_sessions').select('*').eq('user_id', user.id),
        supabase.from('dsa_topics').select('*').eq('user_id', user.id),
        supabase.from('topics').select('*').eq('user_id', user.id),
        supabase.from('units').select('*').eq('user_id', user.id),
      ])

      setSubjects(subjectsData || [])
      setAssignments(assignmentsData || [])
      setCodingProblems(dsaTopicsData || [])
      setTransactions(transactionsData || [])
      setInternships(internshipsData || [])
      setStudySessions(sessionsData || [])

      // Calculate stats
      const totalSubjects = subjectsData?.length || 0
      const totalLessons = lessonsData?.length || 0
      const completedLessons = lessonsData?.filter((l: any) => l.completed).length || 0
      const totalUnits = unitsData?.length || 0
      const completedUnits = unitsData?.filter((u: any) => u.completed).length || 0

      const totalTasks = tasksData?.length || 0
      const completedTasks = tasksData?.filter((t: any) => t.completed).length || 0
      const pendingTasks = totalTasks - completedTasks

      const totalPlacements = placementsData?.length || 0
      const totalInternships = internshipsData?.length || 0

      const income = transactionsData?.filter((t: any) => t.type === 'income').reduce((acc: number, t: any) => acc + t.amount, 0) || 0
      const expenses = transactionsData?.filter((t: any) => t.type === 'expense').reduce((acc: number, t: any) => acc + t.amount, 0) || 0

      const totalStudyHoursCalc = sessionsData?.reduce((acc: number, s: any) => acc + (s.duration || 0) / 60, 0) || 0
      setTotalStudyHours(totalStudyHoursCalc)
      
      const totalFocusTime = sessionsData?.reduce((acc: number, s: any) => acc + (s.duration || 0), 0) || 0

      const totalProblems = dsaTopicsData?.reduce((acc: number, t: any) => acc + (t.problems_solved || 0), 0) || 0

      // Calculate productivity score
      const studyScore = Math.min(25, totalStudyHoursCalc * 2)
      const taskScore = Math.min(25, completedTasks * 5)
      const lessonScore = Math.min(25, completedLessons * 2)
      const dsaScore = Math.min(25, totalProblems * 0.5)
      const productivityScore = Math.round(studyScore + taskScore + lessonScore + dsaScore)

      // Calculate streak
      let streakCalc = 0
      if (sessionsData && sessionsData.length > 0) {
        const dates = sessionsData.map((s: any) => format(new Date(s.date), 'yyyy-MM-dd'))
        const uniqueDates = [...new Set(dates)].sort()
        const today = format(new Date(), 'yyyy-MM-dd')
        for (let i = uniqueDates.length - 1; i >= 0; i--) {
          if (uniqueDates[i] === today || differenceInDays(new Date(today), new Date(uniqueDates[i])) <= 1) {
            streakCalc++
          } else {
            break
          }
        }
      }
      setStreak(streakCalc)

      setStats({
        productivityScore,
        studyStreak: streakCalc,
        studyHours: Math.round(totalStudyHoursCalc),
        focusTime: Math.round(totalFocusTime / 60),
        subjects: {
          total: totalSubjects,
          lessons: completedLessons,
          assignments: pendingTasks,
          hours: Math.round(totalStudyHoursCalc),
        },
        placements: {
          companies: totalPlacements,
          problems: totalProblems,
          interviews: 0,
          resume: totalPlacements > 0 ? 'In Progress' : 'Not Started',
        },
        internships: {
          applications: totalInternships,
          interviews: 0,
          offers: 0,
          certificates: 0,
        },
        finance: {
          balance: income - expenses,
          spending: expenses,
          savings: income > 0 ? income - expenses : 0,
          budget: income > 0 ? Math.max(0, income - expenses) : 0,
        },
      })

      // XP Calculation
      const xp = (subjectsData?.length || 0) * 10 + (completedTasks || 0) * 15 + (completedLessons || 0) * 5 + (totalProblems || 0) * 2
      const level = Math.floor(xp / 100) + 1
      setXpData({ xp, level, nextLevelXp: level * 100 })

      // Today's tasks
      const today = format(new Date(), 'yyyy-MM-dd')
      const todayTasksList = tasksData?.filter((t: any) => {
        if (!t.due_date) return false
        return format(new Date(t.due_date), 'yyyy-MM-dd') === today && !t.completed
      }) || []
      setTodaysTasks(todayTasksList.map((t: any) => ({
        title: t.title,
        priority: t.priority || 'medium',
        duration: '30 min',
        dueTime: 'Today',
      })))
      
      // Count today's completed tasks
      const todayCompleted = tasksData?.filter((t: any) => {
        if (!t.completed_at) return false
        return format(new Date(t.completed_at), 'yyyy-MM-dd') === today
      }) || []
      setTodayTasks(todayCompleted.length)

      // Count this week's completed tasks
      const weekStart = format(startOfWeek(new Date()), 'yyyy-MM-dd')
      const weekCompleted = tasksData?.filter((t: any) => {
        if (!t.completed_at) return false
        return format(new Date(t.completed_at), 'yyyy-MM-dd') >= weekStart
      }) || []
      setWeeklyTasks(weekCompleted.length)

      // Upcoming deadlines
      const allDeadlines: any[] = []
      if (tasksData) {
        tasksData.filter((t: any) => !t.completed).forEach((t: any) => {
          if (t.due_date) {
            allDeadlines.push({
              title: t.title,
              type: 'Assignment',
              date: t.due_date,
            })
          }
        })
      }
      if (placementsData) {
        placementsData.forEach((p: any) => {
          if (p.application_deadline) {
            allDeadlines.push({
              title: `${p.company} Application`,
              type: 'Placement',
              date: p.application_deadline,
            })
          }
        })
      }
      if (internshipsData) {
        internshipsData.forEach((i: any) => {
          if (i.application_deadline) {
            allDeadlines.push({
              title: `${i.company_name} Internship`,
              type: 'Internship',
              date: i.application_deadline,
            })
          }
        })
      }
      allDeadlines.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      setUpcomingDeadlines(allDeadlines.slice(0, 5))

      // Weekly goals
      const goals = []
      if (totalSubjects > 0) {
        const remaining = totalSubjects - completedUnits
        if (remaining > 0) goals.push({ goal: `Complete ${remaining} remaining units`, progress: totalSubjects > 0 ? Math.round((completedUnits / totalSubjects) * 100) : 0 })
      }
      if (totalStudyHoursCalc < 10) goals.push({ goal: 'Study 10 hours this week', progress: Math.min(100, Math.round((totalStudyHoursCalc / 10) * 100)) })
      if (totalProblems < 10) goals.push({ goal: 'Solve 10 coding problems', progress: Math.min(100, Math.round((totalProblems / 10) * 100)) })
      if (totalSubjects === 0) goals.push({ goal: 'Add your first subject', progress: 0 })
      setWeeklyGoals(goals)

      // Recent activity
      const recent: any[] = []
      if (subjectsData && subjectsData.length > 0) {
        subjectsData.slice(0, 3).forEach((s: any) => {
          recent.push({
            description: `Added subject: ${s.name}`,
            time: format(new Date(s.created_at), 'MMM d, h:mm a'),
            icon: '📚',
          })
        })
      }
      if (transactionsData && transactionsData.length > 0) {
        transactionsData.slice(0, 2).forEach((t: any) => {
          recent.push({
            description: `Logged ${t.type}: ₹${t.amount} for ${t.category}`,
            time: format(new Date(t.date), 'MMM d, h:mm a'),
            icon: '💰',
          })
        })
      }
      if (sessionsData && sessionsData.length > 0) {
        sessionsData.slice(0, 2).forEach((s: any) => {
          recent.push({
            description: `Completed ${s.duration}min study session`,
            time: format(new Date(s.date), 'MMM d, h:mm a'),
            icon: '⏱️',
          })
        })
      }
      setRecentActivity(recent.slice(0, 6))

      // Heatmap
      const allActivities: any[] = []
      if (sessionsData) sessionsData.forEach((s: any) => allActivities.push({ date: s.date, type: 'study' }))
      if (tasksData) tasksData.filter((t: any) => t.completed).forEach((t: any) => allActivities.push({ date: t.completed_at || t.created_at, type: 'task' }))
      if (lessonsData) lessonsData.filter((l: any) => l.completed).forEach((l: any) => allActivities.push({ date: l.completed_at || l.created_at, type: 'lesson' }))

      const activityMap = new Map()
      allActivities.forEach((a: any) => {
        const dateKey = format(new Date(a.date), 'yyyy-MM-dd')
        activityMap.set(dateKey, (activityMap.get(dateKey) || 0) + 1)
      })
      const heatmap = Array.from(activityMap.entries()).map(([date, count]) => ({ date, count }))
      setHeatmapData(heatmap)

      // Achievements
      const achievementsList = [
        { icon: '📚', label: 'First Subject', unlocked: totalSubjects > 0 },
        { icon: '⏱️', label: 'First Study Session', unlocked: totalStudyHoursCalc > 0 },
        { icon: '🔥', label: '7-Day Streak', unlocked: streakCalc >= 7 },
        { icon: '💻', label: '10 Problems Solved', unlocked: totalProblems >= 10 },
        { icon: '🚀', label: 'First Internship', unlocked: totalInternships > 0 },
        { icon: '💰', label: 'Budget Tracker', unlocked: transactionsData && transactionsData.length > 5 },
      ]
      setAchievements(achievementsList)

      // AI Messages
      const messages: any[] = []
      if (totalSubjects === 0) {
        messages.push({ message: 'Add your first subject to begin tracking your semester.', type: 'study' })
      } else if (totalStudyHoursCalc === 0) {
        messages.push({ message: 'Create a study session to start measuring your study hours.', type: 'study' })
      } else if (pendingTasks > 0) {
        messages.push({ message: `You have ${pendingTasks} pending tasks. Focus on completing them today.`, type: 'task' })
      } else if (totalProblems > 0 && totalProblems < 10) {
        messages.push({ message: `You've solved ${totalProblems} problems. Aim for 10 to unlock your first coding achievement.`, type: 'placement' })
      } else if (totalInternships === 0) {
        messages.push({ message: 'Start applying for internships to build your professional experience.', type: 'internship' })
      } else if (expenses === 0) {
        messages.push({ message: 'Log an expense to begin tracking your finances.', type: 'finance' })
      } else {
        messages.push({ message: `You're on track! Keep up the momentum with daily study sessions.`, type: 'general' })
      }
      setAiMessages(messages)

      // Generate Smart Tip
      const tip = generateSmartTip()
      setSmartTip(tip)

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    if (!name) return 'S'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  // Next Achievement
  const nextAchievement = (() => {
    const locked = achievements.filter(a => !a.unlocked)
    if (locked.length === 0) return null
    const next = locked[0]
    let progress = 0
    if (next.label === 'First Subject') progress = Math.min(100, (subjects.length / 1) * 100)
    else if (next.label === 'First Study Session') progress = Math.min(100, (totalStudyHours / 1) * 100)
    else if (next.label === '7-Day Streak') progress = Math.min(100, (streak / 7) * 100)
    else if (next.label === '10 Problems Solved') progress = Math.min(100, (codingProblems.length / 10) * 100)
    else if (next.label === 'First Internship') progress = Math.min(100, (internships.length / 1) * 100)
    else if (next.label === 'Budget Tracker') progress = Math.min(100, (transactions.length / 6) * 100)
    return { ...next, progress: Math.round(progress) }
  })()

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* ----- HEADER ----- */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-[#6D0F2B] to-[#8A1538] shadow-lg shadow-[#6D0F2B]/20">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{greeting}, {user?.user_metadata?.name || 'Susan'} 👋</h1>
                <p className="text-sm text-gray-500">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
              </div>
            </div>
            {stats.productivityScore === 0 && (
              <p className="mt-1 text-sm text-amber-600">Welcome! Start building your productivity dashboard by adding your first subject.</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input placeholder="Search..." className="pl-9 w-48 bg-white/50 backdrop-blur-sm border-gray-200 rounded-xl h-9 text-sm" />
            </div>
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 relative">
              <Bell className="h-5 w-5 text-gray-500" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#6D0F2B]" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 rounded-full">
                  <Avatar className="h-8 w-8 border-2 border-[#6D0F2B]/20">
                    <AvatarFallback className="bg-[#6D0F2B] text-white text-xs">
                      {getInitials(user?.user_metadata?.name || 'Susan')}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2"><User className="h-4 w-4" /> Profile</DropdownMenuItem>
                <DropdownMenuItem className="gap-2"><Settings className="h-4 w-4" /> Settings</DropdownMenuItem>
                <DropdownMenuItem className="gap-2"><HelpCircle className="h-4 w-4" /> Help</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 text-red-500" onClick={signOut}><LogOut className="h-4 w-4" /> Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>

        {/* ----- QUICK ACTIONS ----- */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" className="bg-[#6D0F2B] hover:bg-[#8A1538] text-white rounded-xl gap-1.5" asChild>
              <a href="/dashboard/academic"><Plus className="h-4 w-4" /> Add Subject</a>
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl gap-1.5 border-gray-200" asChild>
              <a href="/dashboard/today"><Plus className="h-4 w-4" /> Add Task</a>
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl gap-1.5 border-gray-200" asChild>
              <a href="/dashboard/academic"><Timer className="h-4 w-4" /> Study Session</a>
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl gap-1.5 border-gray-200" asChild>
              <a href="/dashboard/finance"><Plus className="h-4 w-4" /> Log Expense</a>
            </Button>
          </div>
        </motion.div>

        {/* ----- COMPACT STATS ----- */}
        <motion.div initial="hidden" animate="visible" variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <CompactStatCard title="Productivity" value={`${stats.productivityScore}%`} icon={Zap} color="from-purple-500 to-pink-500" loading={loading} />
          <CompactStatCard title="Study Streak" value={`${stats.studyStreak} days`} icon={Flame} color="from-orange-500 to-red-500" loading={loading} />
          <CompactStatCard title="Study Hours" value={`${stats.studyHours}h`} icon={Clock} color="from-blue-500 to-blue-600" loading={loading} />
          <CompactStatCard title="Focus Time" value={`${stats.focusTime}h`} icon={Target} color="from-emerald-500 to-green-500" loading={loading} />
        </motion.div>

        {/* ----- MODULE CARDS ----- */}
        <motion.div initial="hidden" animate="visible" variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ModuleCard
            title="Subjects"
            icon="📚"
            stats={[
              { label: 'Total', value: stats.subjects.total },
              { label: 'Lessons', value: stats.subjects.lessons },
              { label: 'Assignments', value: stats.subjects.assignments },
              { label: 'Study Hours', value: `${stats.subjects.hours}h` },
            ]}
            emptyMessage="No subjects added yet."
            actionLabel="Add Subject"
            actionHref="/dashboard/academic"
            color="from-blue-500 to-blue-600"
            loading={loading}
          />
          <ModuleCard
            title="Placements"
            icon="💼"
            stats={[
              { label: 'Companies', value: stats.placements.companies },
              { label: 'Problems', value: stats.placements.problems },
              { label: 'Interviews', value: stats.placements.interviews },
              { label: 'Resume', value: stats.placements.resume },
            ]}
            emptyMessage="No placement preparation data."
            actionLabel="Start Placement Prep"
            actionHref="/dashboard/placement"
            color="from-purple-500 to-pink-500"
            loading={loading}
          />
          <ModuleCard
            title="Internships"
            icon="🚀"
            stats={[
              { label: 'Applications', value: stats.internships.applications },
              { label: 'Interviews', value: stats.internships.interviews },
              { label: 'Offers', value: stats.internships.offers },
              { label: 'Certificates', value: stats.internships.certificates },
            ]}
            emptyMessage="No internship applications yet."
            actionLabel="Add Internship"
            actionHref="/dashboard/internship"
            color="from-emerald-500 to-green-500"
            loading={loading}
          />
          <ModuleCard
            title="Finance"
            icon="💰"
            stats={[
              { label: 'Balance', value: `₹${stats.finance.balance}` },
              { label: 'Spending', value: `₹${stats.finance.spending}` },
              { label: 'Savings', value: `₹${stats.finance.savings}` },
              { label: 'Budget', value: `₹${stats.finance.budget}` },
            ]}
            emptyMessage="No financial records available."
            actionLabel="Log Expense"
            actionHref="/dashboard/finance"
            color="from-amber-500 to-orange-500"
            loading={loading}
          />
        </motion.div>

        {/* ----- MAIN CONTENT GRID ----- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Focus */}
            <Card className="border-0 shadow-[0_4px_24px_rgba(0,0,0,0.06)] rounded-2xl overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#F8EEF1]">
                      <Target className="h-5 w-5 text-[#6D0F2B]" />
                    </div>
                    <CardTitle className="text-gray-800">Today's Focus</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{todaysTasks.length} tasks</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {todaysTasks.length === 0 ? (
                  <div className="py-8 text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-[#F8EEF1] flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8 text-[#6D0F2B]" />
                    </div>
                    <p className="mt-3 text-sm text-gray-500">No tasks scheduled for today.</p>
                    <Button variant="outline" size="sm" className="mt-2 text-[#6D0F2B] border-[#6D0F2B]/30" asChild>
                      <a href="/dashboard/today"><Plus className="h-3 w-3 mr-1" /> Create Your First Task</a>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {todaysTasks.map((task, i) => (
                      <TaskItem key={i} task={task} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity Heatmap */}
            <Card className="border-0 shadow-[0_4px_24px_rgba(0,0,0,0.06)] rounded-2xl overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#F8EEF1]">
                    <Calendar className="h-5 w-5 text-[#6D0F2B]" />
                  </div>
                  <CardTitle className="text-gray-800">Activity Heatmap</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {heatmapData.length === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-sm text-gray-500">No activity yet</p>
                    <p className="text-xs text-gray-400">Complete activities to fill your heatmap</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-7 gap-1">
                    {heatmapData.slice(0, 28).map((day, i) => {
                      const count = day.count || 0
                      const intensity = count > 4 ? 'bg-[#6D0F2B]' :
                        count > 3 ? 'bg-[#8A1538]/70' :
                        count > 2 ? 'bg-[#C41E3A]/50' :
                        count > 1 ? 'bg-[#F8EEF1]' :
                        'bg-gray-100'
                      return (
                        <div
                          key={i}
                          className={`aspect-square rounded-sm ${intensity} transition-colors hover:scale-110 hover:ring-2 hover:ring-[#6D0F2B] cursor-pointer`}
                          title={`${format(new Date(day.date), 'MMM d')}: ${count} activities`}
                        />
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card className="border-0 shadow-[0_4px_24px_rgba(0,0,0,0.06)] rounded-2xl overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#F8EEF1]">
                    <CalendarDays className="h-5 w-5 text-[#6D0F2B]" />
                  </div>
                  <CardTitle className="text-gray-800">Upcoming Deadlines</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {upcomingDeadlines.length === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-sm text-gray-500">No upcoming deadlines.</p>
                    <p className="text-xs text-gray-400">Add assignments, placements, or internships to track deadlines.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {upcomingDeadlines.map((deadline, i) => (
                      <DeadlineItem key={i} deadline={deadline} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ----- PRODUCTIVITY PET ----- */}
            <Card className="border-0 shadow-[0_4px_16px_rgba(0,0,0,0.05)] rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#F8EEF1]">
                      <Heart className="h-4 w-4 text-[#6D0F2B]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Productivity Pet</p>
                      <p className="text-xs text-gray-400">Level {petLevel}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">❤️ {petHappiness}%</Badge>
                    <Badge variant="outline" className="text-[10px]">⭐ {petXP} XP</Badge>
                  </div>
                </div>

                {/* Virtual Pet */}
                <VirtualPet
                  level={petLevel}
                  xp={petXP}
                  happiness={petHappiness}
                  streak={streak}
                  studyHours={totalStudyHours}
                  tasksCompleted={todayTasks}
                />

                {/* Pet Message */}
                <div className="mt-3 text-center">
                  <p className="text-sm text-gray-700 font-medium">{petMessage}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{petSubMessage}</p>
                </div>

                {/* Progress to Next Level */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Level {petLevel} → Level {petLevel + 1}</span>
                    <span>{petXP % 100} / 100 XP</span>
                  </div>
                  <Progress value={petXP % 100} className="h-1.5" />
                </div>

                {/* Quick Stats */}
                <div className="mt-3 grid grid-cols-4 gap-2 pt-3 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-sm font-bold text-[#6D0F2B]">{todayTasks}</p>
                    <p className="text-[10px] text-gray-400">Today</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-[#6D0F2B]">{weeklyTasks}</p>
                    <p className="text-[10px] text-gray-400">This Week</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-[#6D0F2B]">{streak}</p>
                    <p className="text-[10px] text-gray-400">Streak</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-[#6D0F2B]">{totalStudyHours.toFixed(1)}h</p>
                    <p className="text-[10px] text-gray-400">Study</p>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-3 text-[#6D0F2B] border-[#6D0F2B]/30 text-xs"
                  asChild
                >
                  <a href="/dashboard/today">
                    <Heart className="h-3 w-3 mr-1" /> Play with Pet →
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* AI Assistant */}
            <Card className="border-0 shadow-[0_4px_24px_rgba(0,0,0,0.06)] rounded-2xl overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#F8EEF1]">
                    <Brain className="h-5 w-5 text-[#6D0F2B]" />
                  </div>
                  <CardTitle className="text-gray-800">AI Assistant</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {aiMessages.map((msg, i) => (
                  <AIMessage key={i} message={msg.message} type={msg.type} />
                ))}
              </CardContent>
            </Card>

            {/* Weekly Goals */}
            <Card className="border-0 shadow-[0_4px_24px_rgba(0,0,0,0.06)] rounded-2xl overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#F8EEF1]">
                    <ListChecks className="h-5 w-5 text-[#6D0F2B]" />
                  </div>
                  <CardTitle className="text-gray-800">Weekly Goals</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {weeklyGoals.length === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-sm text-gray-500">No weekly goals yet.</p>
                    <Button variant="outline" size="sm" className="mt-2 text-[#6D0F2B] border-[#6D0F2B]/30">
                      <Plus className="h-3 w-3 mr-1" /> Create Goal
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {weeklyGoals.map((goal, i) => (
                      <GoalItem key={i} goal={goal.goal} progress={goal.progress} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ----- ACHIEVEMENTS + AI SMART TIP COMBO ----- */}
            <Card className="border-0 shadow-[0_4px_16px_rgba(0,0,0,0.05)] rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#F8EEF1]">
                      <Trophy className="h-4 w-4 text-[#6D0F2B]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Achievements</p>
                      <p className="text-xs text-gray-400">{achievements.filter(a => a.unlocked).length} unlocked</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    Level {xpData.level}
                  </Badge>
                </div>

                {/* Achievement Badges */}
                <div className="flex gap-2 flex-wrap mb-4">
                  {achievements.slice(0, 6).map((ach: any, i: number) => (
                    <div
                      key={i}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 ${
                        ach.unlocked
                          ? 'bg-gradient-to-r from-[#F8EEF1] to-[#6D0F2B]/10 border border-[#6D0F2B]/20'
                          : 'bg-gray-100 border border-gray-200 opacity-50 grayscale'
                      }`}
                    >
                      <span className="text-sm">{ach.icon}</span>
                      <span className={`text-xs ${ach.unlocked ? 'text-gray-700' : 'text-gray-400'}`}>
                        {ach.label}
                      </span>
                      {ach.unlocked && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#6D0F2B]" />
                      )}
                    </div>
                  ))}
                </div>

                {/* XP Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>XP Progress</span>
                    <span>{xpData.xp} / {xpData.nextLevelXp} XP</span>
                  </div>
                  <Progress value={(xpData.xp / xpData.nextLevelXp) * 100} className="h-1.5" />
                </div>

                {/* AI Smart Tip */}
                <div className="rounded-xl bg-gradient-to-br from-[#6D0F2B]/5 to-[#F8EEF1] p-4 border border-[#6D0F2B]/10">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-[#6D0F2B]/10 flex-shrink-0">
                      <Brain className="h-4 w-4 text-[#6D0F2B]" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#6D0F2B] uppercase tracking-wider">AI Smart Tip</p>
                      <p className="text-sm text-gray-700 mt-0.5">
                        {smartTip || '🌟 You\'re doing great! Keep up the momentum and stay consistent.'}
                      </p>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-[#6D0F2B] p-0 h-auto mt-1 text-xs font-medium"
                        asChild
                      >
                        <a href={smartTipAction || '/dashboard/today'}>
                          {smartTipButton || 'Plan Your Day →'}
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Next Achievement */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{nextAchievement?.icon || '🎯'}</span>
                      <span className="text-xs text-gray-500">Next: {nextAchievement?.label || 'Keep going!'}</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {nextAchievement?.progress || 0}% complete
                    </span>
                  </div>
                  <Progress value={nextAchievement?.progress || 0} className="h-1 mt-1" />
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-0 shadow-[0_4px_24px_rgba(0,0,0,0.06)] rounded-2xl overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#F8EEF1]">
                    <Activity className="h-5 w-5 text-[#6D0F2B]" />
                  </div>
                  <CardTitle className="text-gray-800">Recent Activity</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-sm text-gray-500">No recent activity.</p>
                    <p className="text-xs text-gray-400">Start interacting with the app to see events here.</p>
                  </div>
                ) : (
                  <ScrollArea className="h-48 pr-2">
                    <div className="space-y-2">
                      {recentActivity.map((activity, i) => (
                        <div key={i} className="flex items-center gap-3 rounded-xl bg-gray-50 p-2.5">
                          <div className="p-1.5 rounded-lg bg-[#F8EEF1]">
                            <span className="text-sm">{activity.icon}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-700">{activity.description}</p>
                            <p className="text-xs text-gray-400">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}   