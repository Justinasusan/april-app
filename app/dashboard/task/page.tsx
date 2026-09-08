'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
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
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Trash2,
  Edit,
  Sparkles,
  Target,
} from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

// ---------- STAT CARD ----------
function StatCard({ title, value, icon: Icon, color, subtitle }: any) {
  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp}>
      <Card className="border-0 shadow-[0_4px_24px_rgba(0,0,0,0.06)] rounded-2xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
            </div>
            <div className={`rounded-xl bg-gradient-to-br ${color} p-3 shadow-lg shadow-[#6D0F2B]/20`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ---------- TASK CARD ----------
function TaskCard({ task, onComplete, onDelete }: any) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="rounded-xl bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(109,15,43,0.08)] transition-all duration-300"
    >
      <div className="flex items-start gap-4">
        <Checkbox
          checked={task.status === 'done'}
          onCheckedChange={() => onComplete(task.id)}
          className="mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={`font-medium ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
              {task.title}
            </h4>
            <Badge
              variant={
                task.priority === 'high'
                  ? 'destructive'
                  : task.priority === 'medium'
                  ? 'secondary'
                  : 'outline'
              }
              className="text-[10px]"
            >
              {task.priority || 'medium'}
            </Badge>
          </div>
          {task.description && <p className="text-sm text-gray-500 truncate">{task.description}</p>}
          <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
            {task.deadline && <span>📅 {new Date(task.deadline).toLocaleDateString()}</span>}
            <span>📝 0 subtasks</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="rounded-lg p-1.5 text-gray-400 hover:text-[#6D0F2B] transition-colors">
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="rounded-lg p-1.5 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ---------- MAIN COMPONENT ----------
export default function TasksPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [view, setView] = useState('list')

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    deadline: '',
  })

  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    today: 0,
    completionRate: 0,
  })

  useEffect(() => {
    if (user) fetchData()
  }, [user])

  const fetchData = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('internship_tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setTasks(data)
      const completed = data.filter((t) => t.status === 'done').length
      setStats({
        total: data.length,
        completed,
        pending: data.filter((t) => t.status !== 'done').length,
        overdue: data.filter((t) => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done').length,
        today: data.filter((t) => t.deadline && new Date(t.deadline).toDateString() === new Date().toDateString()).length,
        completionRate: data.length > 0 ? Math.round((completed / data.length) * 100) : 0,
      })
    }
    setLoading(false)
  }

  const addTask = async () => {
    console.log('🔵 Add task clicked')
    console.log('🔵 Data:', newTask)

    if (!newTask.title) {
      console.log('⚠️ No task title')
      return
    }

    try {
      const { data, error } = await supabase
        .from('internship_tasks')
        .insert({
          user_id: user?.id,
          title: newTask.title,
          description: newTask.description || null,
          priority: newTask.priority || 'medium',
          deadline: newTask.deadline || null,
          status: 'todo',
        })
        .select()

      if (error) {
        console.error('🔴 Error:', error)
        return
      }

      if (data) {
        console.log('🟢 Task added:', data)
        setTasks([data[0], ...tasks])
        setShowAddModal(false)
        setNewTask({ title: '', description: '', priority: 'medium', deadline: '' })
        fetchData()
      }
    } catch (err) {
      console.error('🔴 Unexpected error:', err)
    }
  }

  const completeTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id)
    const newStatus = task?.status === 'done' ? 'todo' : 'done'
    const { error } = await supabase.from('internship_tasks').update({ status: newStatus }).eq('id', id)
    if (!error) {
      setTasks(tasks.map((t) => (t.id === id ? { ...t, status: newStatus } : t)))
      fetchData()
    }
  }

  const deleteTask = async (id: string) => {
    if (!confirm('Delete this task?')) return
    const { error } = await supabase.from('internship_tasks').delete().eq('id', id)
    if (!error) {
      setTasks(tasks.filter((t) => t.id !== id))
      fetchData()
    }
  }

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
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
                <CheckSquare className="h-6 w-6 text-white/70" />
                <span className="text-xs font-medium tracking-widest text-white/60 uppercase">
                  Productivity
                </span>
              </div>
              <h1 className="mt-2 text-2xl md:text-3xl font-bold text-white">
                ✅ Task Manager
              </h1>
              <p className="mt-1 text-white/70 text-sm">Organize everything efficiently</p>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
            >
              <Plus className="h-4 w-4 mr-2" /> New Task
            </Button>
          </div>
        </motion.div>

        {/* ----- STATISTICS ----- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Tasks"
            value={stats.total}
            icon={CheckSquare}
            color="from-blue-500 to-blue-600"
            subtitle="All tasks"
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={Target}
            color="from-emerald-500 to-green-500"
            subtitle={`${stats.completionRate}% completion`}
          />
          <StatCard
            title="Pending"
            value={stats.pending}
            icon={Clock}
            color="from-amber-500 to-orange-500"
            subtitle={`${stats.overdue} overdue`}
          />
          <StatCard
            title="Today's Tasks"
            value={stats.today}
            icon={Calendar}
            color="from-purple-500 to-pink-500"
            subtitle="Due today"
          />
        </div>

        {/* ----- VIEWS ----- */}
        <Tabs value={view} onValueChange={setView} className="w-full">
          <div className="flex items-center justify-between">
            <TabsList className="bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl p-1">
              <TabsTrigger value="list" className="rounded-lg">📋 List</TabsTrigger>
              <TabsTrigger value="board" className="rounded-lg">📊 Board</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" /> Filters
              </Button>
            </div>
          </div>

          <TabsContent value="list" className="mt-6 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white/50 backdrop-blur-sm border-gray-200 rounded-xl"
              />
            </div>

            {tasks.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto w-20 h-20 rounded-full bg-[#F8EEF1] flex items-center justify-center">
                  <CheckSquare className="h-10 w-10 text-[#6D0F2B]" />
                </div>
                <p className="mt-4 text-lg font-medium text-gray-700">No tasks yet</p>
                <p className="text-sm text-gray-400">Start by creating your first task</p>
                <Button onClick={() => setShowAddModal(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" /> Create Task
                </Button>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={completeTask}
                  onDelete={deleteTask}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="board" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-0 shadow-[0_4px_24px_rgba(0,0,0,0.06)] rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-sm text-gray-500">📋 To Do</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tasks.filter((t) => t.status === 'todo').length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">No tasks</p>
                  ) : (
                    tasks.filter((t) => t.status === 'todo').map((task) => (
                      <div key={task.id} className="rounded-xl bg-gray-50 p-3">
                        <p className="font-medium text-sm">{task.title}</p>
                        <p className="text-xs text-gray-400 mt-1">{task.priority}</p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
              <Card className="border-0 shadow-[0_4px_24px_rgba(0,0,0,0.06)] rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-sm text-gray-500">⚡ In Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tasks.filter((t) => t.status === 'in_progress').length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">No tasks</p>
                  ) : (
                    tasks.filter((t) => t.status === 'in_progress').map((task) => (
                      <div key={task.id} className="rounded-xl bg-gray-50 p-3">
                        <p className="font-medium text-sm">{task.title}</p>
                        <p className="text-xs text-gray-400 mt-1">{task.priority}</p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
              <Card className="border-0 shadow-[0_4px_24px_rgba(0,0,0,0.06)] rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-sm text-gray-500">✅ Done</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tasks.filter((t) => t.status === 'done').length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">No tasks</p>
                  ) : (
                    tasks.filter((t) => t.status === 'done').map((task) => (
                      <div key={task.id} className="rounded-xl bg-gray-50 p-3">
                        <p className="font-medium text-sm line-through text-gray-400">{task.title}</p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* ----- ADD TASK MODAL ----- */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="max-w-lg rounded-2xl p-0 overflow-hidden">
            <div className="bg-gradient-to-r from-[#6D0F2B] to-[#8A1538] px-6 py-4">
              <DialogHeader>
                <DialogTitle className="text-white text-xl flex items-center gap-2">
                  <Plus className="h-5 w-5" /> Create New Task
                </DialogTitle>
              </DialogHeader>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Task Name *</label>
                <Input
                  placeholder="What do you need to do?"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Input
                  placeholder="Add details (optional)"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Priority</label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(v) => setNewTask({ ...newTask, priority: v })}
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
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Deadline</label>
                  <Input
                    type="date"
                    value={newTask.deadline}
                    onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button onClick={addTask} className="bg-[#6D0F2B] hover:bg-[#8A1538]">
                  <Plus className="h-4 w-4 mr-2" /> Create Task
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}