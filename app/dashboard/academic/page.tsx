'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { format, differenceInDays, addDays, subDays, eachDayOfInterval, startOfWeek, endOfWeek, isAfter } from 'date-fns'
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
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronRight,
  Sparkles,
  GraduationCap,
  Award,
  Clock,
  CheckCircle2,
  Circle,
  ChevronDown,
  FolderOpen,
  Brain,
  Target,
  Flame,
  Calendar,
  Heart,
  GitBranch,
  Save,
  X,
  Play,
  Pause,
  Square,
} from 'lucide-react'

// ---------- ANIMATION VARIANTS ----------
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

// ---------- SUBJECT COLORS ----------
const SUBJECT_COLORS = [
  '#6D0F2B', '#8A1538', '#C41E3A', '#9B2D3D', '#7A1F35',
  '#2563EB', '#7C3AED', '#059669', '#D97706', '#DC2626',
  '#0891B2', '#4F46E5', '#0D9488', '#CA8A04', '#9333EA',
]

const SUBJECT_ICONS = ['📚', '📖', '📐', '🔬', '💻', '📊', '🧪', '📈', '🎨', '🏛️']

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
                <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
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

// ---------- SUBJECT CARD ----------
function SubjectCard({ subject, onSelect, onDelete, onEdit }: any) {
  const progress = subject.progress || 0
  const color = subject.color || SUBJECT_COLORS[0]

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      whileHover={{ y: -4 }}
      className="cursor-pointer"
      onClick={() => onSelect(subject)}
    >
      <Card className="border-0 shadow-[0_4px_20px_rgba(0,0,0,0.06)] rounded-2xl overflow-hidden hover:shadow-[0_8px_40px_rgba(109,15,43,0.12)] transition-all duration-300">
        <div className="h-1 w-full" style={{ background: color }} />
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{subject.icon || '📚'}</div>
              <div>
                <h3 className="font-semibold text-gray-800">{subject.name}</h3>
                <p className="text-sm text-gray-500">{subject.faculty || 'No faculty'}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(subject) }}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-[#6D0F2B] transition-colors"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(subject.id) }}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Progress</span>
              <span className="font-medium text-gray-700">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5 mt-1" style={{ background: `${color}20` }} />
          </div>

          <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
            <span>📚 {subject.credits || 3} Credits</span>
            <span>📅 {subject.semester || 'Sem 1'}</span>
            <Badge variant="outline" className="text-[10px]">{subject.code || 'CS101'}</Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ---------- TOPIC ITEM ----------
function TopicItem({ topic, onToggle, onEdit, onDelete }: any) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(topic.name)

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="flex items-center gap-3 rounded-xl bg-gray-50 p-2.5 hover:bg-gray-100 transition-colors group"
    >
      <Checkbox
        checked={topic.completed}
        onCheckedChange={() => onToggle(topic.id, !topic.completed)}
        className="data-[state=checked]:bg-[#6D0F2B] data-[state=checked]:border-[#6D0F2B]"
      />
      {isEditing ? (
        <div className="flex-1 flex items-center gap-2">
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="h-7 text-sm"
            autoFocus
          />
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => {
            onEdit(topic.id, editName)
            setIsEditing(false)
          }}>
            <Save className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setIsEditing(false)}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <>
          <span className={`text-sm flex-1 ${topic.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
            {topic.name}
          </span>
          {topic.completed && topic.completed_at && (
            <span className="text-xs text-gray-400">
              {format(new Date(topic.completed_at), 'MMM d')}
            </span>
          )}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => setIsEditing(true)} className="p-1 text-gray-400 hover:text-[#6D0F2B]">
              <Edit className="h-3 w-3" />
            </button>
            <button onClick={() => onDelete(topic.id)} className="p-1 text-gray-400 hover:text-red-500">
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </>
      )}
    </motion.div>
  )
}

// ---------- UNIT SECTION ----------
function UnitSection({ unit, topics, onAddTopic, onToggleTopic, onEditTopic, onDeleteTopic, onEditUnit, onDeleteUnit }: any) {
  const [expanded, setExpanded] = useState(true)
  const [newTopic, setNewTopic] = useState('')
  const [showAddTopic, setShowAddTopic] = useState(false)

  const completed = topics.filter((t: any) => t.completed).length
  const total = topics.length
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0

  const handleAddTopic = () => {
    if (newTopic.trim()) {
      onAddTopic(unit.id, newTopic.trim())
      setNewTopic('')
      setShowAddTopic(false)
    }
  }

  const getStatus = () => {
    if (progress === 100) return 'Completed'
    if (progress > 0) return 'In Progress'
    return 'Not Started'
  }

  const statusColor = progress === 100 ? 'text-emerald-600' : progress > 0 ? 'text-amber-600' : 'text-gray-400'

  return (
    <div className="rounded-xl bg-white border border-gray-100 overflow-hidden">
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          {expanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
          <span className="font-medium text-gray-800">{unit.name}</span>
          <Badge variant="outline" className="text-[10px]">
            {completed}/{total} topics
          </Badge>
          <span className={`text-xs ${statusColor}`}>{getStatus()}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-20">
            <Progress value={progress} className="h-1.5" />
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onEditUnit(unit) }}
              className="p-1 text-gray-400 hover:text-[#6D0F2B]"
            >
              <Edit className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteUnit(unit.id) }}
              className="p-1 text-gray-400 hover:text-red-500"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
      {expanded && (
        <div className="px-3 pb-3 space-y-2">
          {topics.map((topic: any) => (
            <TopicItem
              key={topic.id}
              topic={topic}
              onToggle={onToggleTopic}
              onEdit={onEditTopic}
              onDelete={onDeleteTopic}
            />
          ))}
          {showAddTopic ? (
            <div className="flex items-center gap-2 mt-2">
              <Input
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="Enter topic name..."
                className="h-8 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleAddTopic()}
                autoFocus
              />
              <Button size="sm" onClick={handleAddTopic} className="h-8 px-3 bg-[#6D0F2B] hover:bg-[#8A1538]">
                Add
              </Button>
              <Button size="sm" variant="ghost" className="h-8 px-3" onClick={() => setShowAddTopic(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddTopic(true)}
              className="text-sm text-[#6D0F2B] hover:underline flex items-center gap-1 mt-1"
            >
              <Plus className="h-3.5 w-3.5" /> Add Topic
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ---------- STUDY TAB ----------
function StudyTab({ subject, studySessions, onAddSession, onDeleteSession }: any) {
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerDuration, setTimerDuration] = useState(25)
  const [timerMinutes, setTimerMinutes] = useState(25)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null)
  const [sessionNote, setSessionNote] = useState('')

  const totalStudyHours = studySessions?.reduce((acc: number, s: any) => acc + (s.duration || 0) / 60, 0) || 0
  const sessionsCount = studySessions?.length || 0

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
            onAddSession(timerDuration, sessionNote)
            setSessionNote('')
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

  const formatTime = (minutes: number, seconds: number) => {
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-[0_4px_16px_rgba(0,0,0,0.05)] rounded-2xl">
        <CardHeader>
          <CardTitle className="text-gray-800 flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#6D0F2B]" />
            Study Timer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center">
            <div className="text-6xl font-bold text-[#6D0F2B] font-mono">
              {formatTime(timerMinutes, timerSeconds)}
            </div>
            <div className="flex gap-2 mt-4">
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
            <div className="flex gap-2 mt-4">
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
            <div className="w-full max-w-md mt-4">
              <Input
                placeholder="What are you studying?"
                value={sessionNote}
                onChange={(e) => setSessionNote(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-[0_4px_16px_rgba(0,0,0,0.05)] rounded-2xl">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[#6D0F2B]">{totalStudyHours.toFixed(1)}h</p>
            <p className="text-xs text-gray-400">Total Study Hours</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-[0_4px_16px_rgba(0,0,0,0.05)] rounded-2xl">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[#6D0F2B]">{sessionsCount}</p>
            <p className="text-xs text-gray-400">Sessions Completed</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-[0_4px_16px_rgba(0,0,0,0.05)] rounded-2xl">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[#6D0F2B]">
              {sessionsCount > 0 ? Math.round(totalStudyHours / sessionsCount * 10) / 10 : 0}m
            </p>
            <p className="text-xs text-gray-400">Avg Session Length</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-[0_4px_16px_rgba(0,0,0,0.05)] rounded-2xl">
        <CardHeader>
          <CardTitle className="text-gray-800">Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {studySessions && studySessions.length > 0 ? (
            <div className="space-y-2">
              {studySessions.slice(0, 5).map((session: any) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {session.duration} min session
                    </p>
                    {session.note && (
                      <p className="text-xs text-gray-400">{session.note}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {format(new Date(session.date), 'MMM d, h:mm a')}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteSession(session.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-500">No study sessions recorded</p>
              <p className="text-sm text-gray-400">Start your first session to track your progress</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ---------- ASSIGNMENTS TAB ----------
function AssignmentsTab({ assignments, onAddAssignment, onToggleAssignment, onDeleteAssignment }: any) {
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium',
  })
  const [showAddForm, setShowAddForm] = useState(false)

  const handleSubmit = () => {
    if (!newAssignment.title) return
    onAddAssignment(newAssignment)
    setNewAssignment({ title: '', description: '', due_date: '', priority: 'medium' })
    setShowAddForm(false)
  }

  const completed = assignments?.filter((a: any) => a.completed).length || 0
  const total = assignments?.length || 0
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Progress value={progress} className="h-2" />
        </div>
        <span className="text-sm font-medium text-gray-600">{progress}%</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-gray-50 text-center">
          <p className="text-lg font-bold">{total}</p>
          <p className="text-xs text-gray-400">Total</p>
        </div>
        <div className="p-3 rounded-xl bg-emerald-50 text-center">
          <p className="text-lg font-bold text-emerald-600">{completed}</p>
          <p className="text-xs text-gray-400">Completed</p>
        </div>
        <div className="p-3 rounded-xl bg-amber-50 text-center">
          <p className="text-lg font-bold text-amber-600">{total - completed}</p>
          <p className="text-xs text-gray-400">Pending</p>
        </div>
        <div className="p-3 rounded-xl bg-red-50 text-center">
          <p className="text-lg font-bold text-red-600">
            {assignments?.filter((a: any) => !a.completed && a.due_date && new Date(a.due_date) < new Date()).length || 0}
          </p>
          <p className="text-xs text-gray-400">Overdue</p>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={() => setShowAddForm(!showAddForm)}
        className="gap-1 border-dashed w-full"
      >
        <Plus className="h-4 w-4" /> {showAddForm ? 'Cancel' : 'Add Assignment'}
      </Button>

      {showAddForm && (
        <Card className="border border-gray-200 rounded-xl">
          <CardContent className="p-4 space-y-3">
            <Input
              placeholder="Assignment title *"
              value={newAssignment.title}
              onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
            />
            <Input
              placeholder="Description (optional)"
              value={newAssignment.description}
              onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="date"
                value={newAssignment.due_date}
                onChange={(e) => setNewAssignment({ ...newAssignment, due_date: e.target.value })}
              />
              <Select
                value={newAssignment.priority}
                onValueChange={(v) => setNewAssignment({ ...newAssignment, priority: v })}
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
            <Button onClick={handleSubmit} className="bg-[#6D0F2B] hover:bg-[#8A1538] w-full">
              <Plus className="h-4 w-4 mr-2" /> Create Assignment
            </Button>
          </CardContent>
        </Card>
      )}

      {assignments && assignments.length > 0 ? (
        <div className="space-y-2">
          {assignments.map((assignment: any) => (
            <div key={assignment.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <Checkbox
                checked={assignment.completed}
                onCheckedChange={() => onToggleAssignment(assignment.id, !assignment.completed)}
                className="data-[state=checked]:bg-[#6D0F2B] data-[state=checked]:border-[#6D0F2B]"
              />
              <div className="flex-1">
                <p className={`text-sm font-medium ${assignment.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                  {assignment.title}
                </p>
                <p className="text-xs text-gray-400">
                  {assignment.description || 'No description'}
                  {assignment.due_date && ` • Due: ${format(new Date(assignment.due_date), 'MMM d')}`}
                </p>
              </div>
              <Badge
                variant={
                  assignment.priority === 'high' ? 'destructive' :
                  assignment.priority === 'medium' ? 'secondary' :
                  'outline'
                }
                className="text-[10px]"
              >
                {assignment.priority || 'medium'}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteAssignment(assignment.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center bg-gray-50 rounded-xl">
          <p className="text-gray-500">No assignments yet</p>
          <p className="text-sm text-gray-400">Add assignments to track your work</p>
        </div>
      )}
    </div>
  )
}

// ---------- RESOURCES TAB ----------
function ResourcesTab({ resources, onAddResource, onDeleteResource }: any) {
  const [newResource, setNewResource] = useState({
    title: '',
    type: 'link',
    url: '',
    description: '',
  })
  const [showAddForm, setShowAddForm] = useState(false)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return '📄'
      case 'video': return '🎥'
      case 'link': return '🔗'
      case 'note': return '📝'
      case 'book': return '📖'
      default: return '📁'
    }
  }

  const handleSubmit = () => {
    if (!newResource.title) return
    onAddResource(newResource)
    setNewResource({ title: '', type: 'link', url: '', description: '' })
    setShowAddForm(false)
  }

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        onClick={() => setShowAddForm(!showAddForm)}
        className="gap-1 border-dashed w-full"
      >
        <Plus className="h-4 w-4" /> {showAddForm ? 'Cancel' : 'Add Resource'}
      </Button>

      {showAddForm && (
        <Card className="border border-gray-200 rounded-xl">
          <CardContent className="p-4 space-y-3">
            <Input
              placeholder="Resource title *"
              value={newResource.title}
              onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
            />
            <Select
              value={newResource.type}
              onValueChange={(v) => setNewResource({ ...newResource, type: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">📄 PDF</SelectItem>
                <SelectItem value="video">🎥 Video</SelectItem>
                <SelectItem value="link">🔗 Link</SelectItem>
                <SelectItem value="note">📝 Note</SelectItem>
                <SelectItem value="book">📖 Book</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="URL or reference"
              value={newResource.url}
              onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
            />
            <Input
              placeholder="Description (optional)"
              value={newResource.description}
              onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
            />
            <Button onClick={handleSubmit} className="bg-[#6D0F2B] hover:bg-[#8A1538] w-full">
              <Plus className="h-4 w-4 mr-2" /> Add Resource
            </Button>
          </CardContent>
        </Card>
      )}

      {resources && resources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {resources.map((resource: any) => (
            <div key={resource.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="text-2xl">{getTypeIcon(resource.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">{resource.title}</p>
                {resource.url && (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#6D0F2B] hover:underline truncate block"
                  >
                    {resource.url}
                  </a>
                )}
                {resource.description && (
                  <p className="text-xs text-gray-400">{resource.description}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteResource(resource.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center bg-gray-50 rounded-xl">
          <p className="text-gray-500">No resources uploaded</p>
          <p className="text-sm text-gray-400">Add notes, links, and study materials</p>
        </div>
      )}
    </div>
  )
}

// ---------- SUBJECT PROGRESS DASHBOARD ----------
function SubjectProgressDashboard({ subject, units, topics, sessions = [], assignments = [] }: any) {
  const calculateHealthScore = () => {
    if (!subject) return 0
    
    const totalTopics = topics?.length || 0
    const completedTopics = topics?.filter((t: any) => t.completed).length || 0
    const topicScore = totalTopics > 0 ? (completedTopics / totalTopics) * 35 : 0
    
    const revisions = topics?.filter((t: any) => t.revision_level > 0).length || 0
    const totalRevisions = topics?.filter((t: any) => t.completed).length || 0
    const revisionScore = totalRevisions > 0 ? (revisions / totalRevisions) * 20 : 0
    
    const totalAssignments = assignments?.length || 0
    const completedAssignments = assignments?.filter((a: any) => a.completed).length || 0
    const assignmentScore = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 15 : 0
    
    const studyHours = sessions?.reduce((acc: number, s: any) => acc + (s.duration || 0) / 60, 0) || 0
    const weeklyGoal = 10
    const studyScore = Math.min(15, (studyHours / weeklyGoal) * 15)
    
    const attendance = subject?.attendance || 0
    const attendanceScore = attendance * 0.10
    
    return Math.min(100, Math.round(topicScore + revisionScore + assignmentScore + studyScore + attendanceScore))
  }
  
  const healthScore = calculateHealthScore()
  
  const calculateExamReadiness = () => {
    const completedTopics = topics?.filter((t: any) => t.completed).length || 0
    const totalTopics = topics?.length || 0
    const topicProgress = totalTopics > 0 ? (completedTopics / totalTopics) * 40 : 0
    
    const revisions = topics?.filter((t: any) => t.revision_level > 1).length || 0
    const totalRevisions = topics?.filter((t: any) => t.completed).length || 0
    const revisionProgress = totalRevisions > 0 ? (revisions / totalRevisions) * 30 : 0
    
    const assignmentsCompleted = assignments?.filter((a: any) => a.completed).length || 0
    const totalAssignments = assignments?.length || 0
    const assignmentProgress = totalAssignments > 0 ? (assignmentsCompleted / totalAssignments) * 20 : 0
    
    const studyHours = sessions?.reduce((acc: number, s: any) => acc + (s.duration || 0) / 60, 0) || 0
    const consistencyScore = Math.min(10, (studyHours / 5) * 10)
    
    return Math.min(100, Math.round(topicProgress + revisionProgress + assignmentProgress + consistencyScore))
  }
  
  const examReadiness = calculateExamReadiness()
  
  const getUnitProgress = (unitId: string) => {
    const unitTopics = topics?.filter((t: any) => t.unit_id === unitId) || []
    const completed = unitTopics.filter((t: any) => t.completed).length
    const total = unitTopics.length
    return { completed, total, progress: total > 0 ? Math.round((completed / total) * 100) : 0 }
  }
  
  const getCurrentUnit = () => {
    if (!units || units.length === 0) return null
    const sortedUnits = [...units].sort((a, b) => a.order_index - b.order_index)
    for (const unit of sortedUnits) {
      const progress = getUnitProgress(unit.id)
      if (progress.progress < 100) return unit
    }
    return sortedUnits[sortedUnits.length - 1]
  }
  
  const currentUnit = getCurrentUnit()
  
  const calculateEstimate = () => {
    const remainingTopics = topics?.filter((t: any) => !t.completed).length || 0
    const studyHours = sessions?.reduce((acc: number, s: any) => acc + (s.duration || 0) / 60, 0) || 0
    const avgSpeed = studyHours > 0 ? (topics?.filter((t: any) => t.completed).length || 0) / studyHours : 0
    const estimatedHours = avgSpeed > 0 ? remainingTopics / avgSpeed : 0
    const completionDate = estimatedHours > 0 ? addDays(new Date(), Math.ceil(estimatedHours / 2)) : null
    
    return {
      remainingTopics,
      estimatedHours: Math.round(estimatedHours * 10) / 10,
      completionDate,
    }
  }
  
  const estimate = calculateEstimate()
  
  const getPerformanceLevel = (score: number) => {
    if (score >= 80) return { label: 'Excellent', icon: '🌟', color: 'text-emerald-600' }
    if (score >= 60) return { label: 'Good', icon: '💪', color: 'text-blue-600' }
    if (score >= 40) return { label: 'Fair', icon: '📈', color: 'text-amber-600' }
    return { label: 'Needs Attention', icon: '⚠️', color: 'text-red-600' }
  }
  
  const performance = getPerformanceLevel(healthScore)
  
  const getReadinessLevel = (score: number) => {
    if (score >= 80) return { label: 'Exam Ready', icon: '🎓', color: 'text-emerald-600' }
    if (score >= 60) return { label: 'Well Prepared', icon: '💪', color: 'text-blue-600' }
    if (score >= 40) return { label: 'Moderate', icon: '📈', color: 'text-amber-600' }
    return { label: 'Beginner', icon: '🌱', color: 'text-red-600' }
  }
  
  const readiness = getReadinessLevel(examReadiness)
  
  const calculateStreak = (sess: any[], getLongest = false) => {
    if (!sess || sess.length === 0) return 0
    const dates = sess.map((s: any) => format(new Date(s.date), 'yyyy-MM-dd'))
    const uniqueDates = [...new Set(dates)].sort()
    if (getLongest) {
      let longest = 0
      let current = 1
      for (let i = 1; i < uniqueDates.length; i++) {
        if (differenceInDays(new Date(uniqueDates[i]), new Date(uniqueDates[i-1])) <= 1) {
          current++
        } else {
          longest = Math.max(longest, current)
          current = 1
        }
      }
      return Math.max(longest, current)
    }
    const today = format(new Date(), 'yyyy-MM-dd')
    let streak = 0
    for (let i = uniqueDates.length - 1; i >= 0; i--) {
      if (uniqueDates[i] === today || differenceInDays(new Date(today), new Date(uniqueDates[i])) <= 1) {
        streak++
      } else {
        break
      }
    }
    return streak
  }
  
  const getWeeklyDays = (sess: any[]) => {
    if (!sess || sess.length === 0) return 0
    const weekStart = startOfWeek(new Date())
    const weekEnd = endOfWeek(new Date())
    const dates = sess
      .filter((s: any) => isAfter(new Date(s.date), weekStart) && !isAfter(new Date(s.date), weekEnd))
      .map((s: any) => format(new Date(s.date), 'yyyy-MM-dd'))
    return [...new Set(dates)].length
  }
  
  const getLast7Days = (sess: any[]) => {
    const dates = sess?.map((s: any) => format(new Date(s.date), 'yyyy-MM-dd')) || []
    const uniqueDates = new Set(dates)
    return eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date(),
    }).map((date) => ({
      date,
      active: uniqueDates.has(format(date, 'yyyy-MM-dd')),
      label: format(date, 'EEE'),
    }))
  }
  
  const generateRecommendation = () => {
    if (!topics || topics.length === 0) return null
    
    const remaining = topics.filter((t: any) => !t.completed)
    if (remaining.length === 0) {
      return '🎉 All topics completed! Focus on revisions and practice tests.'
    }
    
    const unitProgress = units?.map((unit: any) => {
      const unitTopics = topics.filter((t: any) => t.unit_id === unit.id)
      const completed = unitTopics.filter((t: any) => t.completed).length
      const total = unitTopics.length
      return { unit, progress: total > 0 ? completed / total : 0 }
    }) || []
    
    const weakest = unitProgress.sort((a, b) => a.progress - b.progress)[0]
    
    if (healthScore < 40) {
      return `⚠️ Your subject health needs attention. Focus on "${weakest?.unit?.name || 'your weakest unit'}" to improve.`
    }
    
    if (healthScore < 70) {
      return `📚 You're making progress! Next, study "${remaining[0]?.name || 'remaining topics'}".`
    }
    
    return `💪 Great work! Keep up the momentum by studying "${remaining[0]?.name || 'remaining topics'}" next.`
  }
  
  const recommendation = generateRecommendation()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-[0_4px_24px_rgba(0,0,0,0.06)] rounded-2xl overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#F8EEF1]">
                <Heart className="h-5 w-5 text-[#6D0F2B]" />
              </div>
              <CardTitle className="text-gray-800">Subject Health</CardTitle>
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
                <p className={`text-lg font-semibold ${performance.color}`}>
                  {performance.icon} {performance.label}
                </p>
                <p className="text-sm text-gray-500">Based on your activity</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-[0_4px_24px_rgba(0,0,0,0.06)] rounded-2xl overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#F8EEF1]">
                <Target className="h-5 w-5 text-[#6D0F2B]" />
              </div>
              <CardTitle className="text-gray-800">Exam Readiness</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative">
                <svg className="h-24 w-24 -rotate-90 transform">
                  <circle className="text-gray-200" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="48" cy="48" />
                  <motion.circle
                    initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - examReadiness / 100) }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className="text-[#C41E3A]" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="48" cy="48"
                    strokeLinecap="round" strokeDasharray={2 * Math.PI * 40}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-xl font-bold">{examReadiness}</p>
                    <p className="text-[10px] text-gray-400">/ 100</p>
                  </div>
                </div>
              </div>
              <div>
                <p className={`text-lg font-semibold ${readiness.color}`}>
                  {readiness.icon} {readiness.label}
                </p>
                <p className="text-sm text-gray-500">Exam preparation progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="border-0 shadow-[0_4px_24px_rgba(0,0,0,0.06)] rounded-2xl overflow-hidden">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#F8EEF1]">
              <GitBranch className="h-5 w-5 text-[#6D0F2B]" />
            </div>
            <CardTitle className="text-gray-800">Learning Journey</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {units && units.length > 0 ? (
            <div className="space-y-2">
              {units.sort((a: any, b: any) => a.order_index - b.order_index).map((unit: any) => {
                const progress = getUnitProgress(unit.id)
                const isCompleted = progress.progress === 100
                const isCurrent = currentUnit?.id === unit.id
                const isUpcoming = !isCompleted && !isCurrent
                
                return (
                  <div key={unit.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isCompleted ? 'bg-emerald-100 text-emerald-700' :
                      isCurrent ? 'bg-[#6D0F2B] text-white' :
                      'bg-gray-200 text-gray-400'
                    }`}>
                      {isCompleted ? '✓' : unit.order_index + 1}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${isUpcoming ? 'text-gray-400' : 'text-gray-800'}`}>
                        {unit.name}
                        {isCurrent && <Badge className="ml-2 bg-[#6D0F2B] text-white border-0 text-[10px]">Current</Badge>}
                        {isCompleted && <Badge className="ml-2 bg-emerald-100 text-emerald-700 border-0 text-[10px]">Completed</Badge>}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{progress.completed}/{progress.total} topics</span>
                        <span>{progress.progress}% complete</span>
                      </div>
                    </div>
                    <div className="w-16">
                      <Progress value={progress.progress} className="h-1.5" />
                    </div>
                  </div>
                )
              })}
              
              <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 opacity-50">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-sm font-bold">🏁</div>
                <div>
                  <p className="font-medium text-gray-400">Final Revision</p>
                  <p className="text-xs text-gray-400">Unlocks after all units are completed</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 opacity-50">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-sm font-bold">🎓</div>
                <div>
                  <p className="font-medium text-gray-400">Exam Ready</p>
                  <p className="text-xs text-gray-400">Unlocks after all revisions are complete</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-500">No units created yet</p>
              <p className="text-sm text-gray-400">Add units to start your learning journey</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="border-0 shadow-[0_4px_24px_rgba(0,0,0,0.06)] rounded-2xl overflow-hidden">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#F8EEF1]">
              <Flame className="h-5 w-5 text-[#6D0F2B]" />
            </div>
            <CardTitle className="text-gray-800">Study Consistency</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {sessions && sessions.length > 0 ? (
            <div className="flex items-center gap-8 flex-wrap">
              <div className="text-center">
                <p className="text-3xl font-bold text-[#6D0F2B]">{calculateStreak(sessions)}🔥</p>
                <p className="text-xs text-gray-400">Current Streak</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{calculateStreak(sessions, true)}</p>
                <p className="text-xs text-gray-400">Longest Streak</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{getWeeklyDays(sessions)}</p>
                <p className="text-xs text-gray-400">Days This Week</p>
              </div>
              <div className="flex-1 min-w-[150px]">
                <div className="flex gap-1">
                  {getLast7Days(sessions).map((day, i) => (
                    <div
                      key={i}
                      className={`flex-1 aspect-square rounded-sm ${day.active ? 'bg-[#6D0F2B]' : 'bg-gray-200'}`}
                      title={day.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-gray-500">No study sessions recorded yet</p>
              <p className="text-sm text-gray-400">Start your first study session today</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="border-0 shadow-[0_4px_24px_rgba(0,0,0,0.06)] rounded-2xl overflow-hidden">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#F8EEF1]">
              <Calendar className="h-5 w-5 text-[#6D0F2B]" />
            </div>
            <CardTitle className="text-gray-800">Estimated Completion</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-gray-50">
              <p className="text-2xl font-bold text-gray-800">{estimate.remainingTopics}</p>
              <p className="text-sm text-gray-500">Remaining Topics</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-gray-50">
              <p className="text-2xl font-bold text-gray-800">{estimate.estimatedHours}h</p>
              <p className="text-sm text-gray-500">Estimated Study Time</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-gray-50">
              <p className="text-2xl font-bold text-gray-800">
                {estimate.completionDate ? format(estimate.completionDate, 'MMM d') : 'N/A'}
              </p>
              <p className="text-sm text-gray-500">Expected Completion</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-0 shadow-[0_4px_24px_rgba(0,0,0,0.06)] rounded-2xl overflow-hidden bg-[#F8EEF1]">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-1 rounded-full bg-[#6D0F2B]/10 mt-0.5">
              <Brain className="h-4 w-4 text-[#6D0F2B]" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">AI Recommendation</p>
              <p className="text-sm text-gray-600">
                {recommendation || 'Add your syllabus and begin studying to receive personalized recommendations.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ---------- MAIN COMPONENT ----------
export default function AcademicPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [subjects, setSubjects] = useState<any[]>([])
  const [selectedSubject, setSelectedSubject] = useState<any>(null)
  const [units, setUnits] = useState<any[]>([])
  const [topics, setTopics] = useState<any[]>([])
  const [studySessions, setStudySessions] = useState<any[]>([])
  const [subjectAssignments, setSubjectAssignments] = useState<any[]>([])
  const [subjectResources, setSubjectResources] = useState<any[]>([])
  const [search, setSearch] = useState('')

  const [showAddSubject, setShowAddSubject] = useState(false)
  const [showEditSubject, setShowEditSubject] = useState(false)
  const [showAddUnit, setShowAddUnit] = useState(false)

  const [newSubject, setNewSubject] = useState({
    name: '',
    code: '',
    faculty: '',
    credits: 3,
    semester: '1',
    department: '',
    color: SUBJECT_COLORS[0],
    icon: '📚',
  })

  const [editSubjectData, setEditSubjectData] = useState<any>(null)
  const [newUnitName, setNewUnitName] = useState('')

  const [stats, setStats] = useState({
    total: 0,
    credits: 0,
    lessonsCompleted: 0,
    lessonsRemaining: 0,
    studyHours: 0,
  })

  useEffect(() => {
    if (user) fetchSubjects()
  }, [user])

  const fetchSubjects = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setSubjects(data)
      calculateStats(data)
    }
    setLoading(false)
  }

  const calculateStats = (subjectsData: any[]) => {
    const total = subjectsData.length
    const credits = subjectsData.reduce((acc, s) => acc + (s.credits || 3), 0)
    setStats({
      total,
      credits,
      lessonsCompleted: 0,
      lessonsRemaining: 0,
      studyHours: 0,
    })
  }

  const fetchSubjectDetails = async (subjectId: string) => {
    const [unitsRes, topicsRes, sessionsRes, assignmentsRes, resourcesRes] = await Promise.all([
      supabase.from('units').select('*').eq('subject_id', subjectId).order('order_index', { ascending: true }),
      supabase.from('topics').select('*').eq('user_id', user?.id).order('created_at', { ascending: true }),
      supabase.from('study_sessions').select('*').eq('user_id', user?.id).eq('subject_id', subjectId).order('date', { ascending: false }),
      supabase.from('assignments').select('*').eq('subject_id', subjectId),
      supabase.from('resources').select('*').eq('subject_id', subjectId),
    ])

    if (!unitsRes.error) setUnits(unitsRes.data || [])
    if (!topicsRes.error) setTopics(topicsRes.data || [])
    if (!sessionsRes.error) setStudySessions(sessionsRes.data || [])
    if (!assignmentsRes.error) setSubjectAssignments(assignmentsRes.data || [])
    if (!resourcesRes.error) setSubjectResources(resourcesRes.data || [])
  }

  const handleSelectSubject = (subject: any) => {
    setSelectedSubject(subject)
    fetchSubjectDetails(subject.id)
  }

  const handleAddSubject = async () => {
    if (!newSubject.name) return

    const { data, error } = await supabase
      .from('subjects')
      .insert({
        user_id: user?.id,
        name: newSubject.name,
        code: newSubject.code || '',
        faculty: newSubject.faculty || '',
        credits: newSubject.credits,
        semester: newSubject.semester,
        department: newSubject.department || '',
        color: newSubject.color,
        icon: newSubject.icon,
        progress: 0,
      })
      .select()

    if (!error && data) {
      setSubjects([data[0], ...subjects])
      setShowAddSubject(false)
      setNewSubject({ name: '', code: '', faculty: '', credits: 3, semester: '1', department: '', color: SUBJECT_COLORS[0], icon: '📚' })
      calculateStats([data[0], ...subjects])
    }
  }

  const handleDeleteSubject = async (id: string) => {
    if (!confirm('Delete this subject?')) return
    const { error } = await supabase.from('subjects').delete().eq('id', id)
    if (!error) {
      setSubjects(subjects.filter((s) => s.id !== id))
      if (selectedSubject?.id === id) setSelectedSubject(null)
    }
  }

  const handleEditSubject = (subject: any) => {
    setEditSubjectData(subject)
    setShowEditSubject(true)
  }

  const handleSaveEdit = async () => {
    if (!editSubjectData) return
    const { error } = await supabase
      .from('subjects')
      .update({
        name: editSubjectData.name,
        code: editSubjectData.code,
        faculty: editSubjectData.faculty,
        credits: editSubjectData.credits,
        semester: editSubjectData.semester,
        department: editSubjectData.department,
        color: editSubjectData.color,
        icon: editSubjectData.icon,
      })
      .eq('id', editSubjectData.id)

    if (!error) {
      setSubjects(subjects.map((s) => s.id === editSubjectData.id ? editSubjectData : s))
      if (selectedSubject?.id === editSubjectData.id) setSelectedSubject(editSubjectData)
      setShowEditSubject(false)
      setEditSubjectData(null)
    }
  }

  const handleAddUnit = async () => {
    if (!newUnitName || !selectedSubject) return

    const order = units.length
    const { data, error } = await supabase
      .from('units')
      .insert({
        subject_id: selectedSubject.id,
        name: newUnitName,
        order_index: order,
      })
      .select()

    if (!error && data) {
      setUnits([...units, data[0]])
      setNewUnitName('')
      setShowAddUnit(false)
    }
  }

  const handleDeleteUnit = async (id: string) => {
    if (!confirm('Delete this unit?')) return
    const { error } = await supabase.from('units').delete().eq('id', id)
    if (!error) setUnits(units.filter((u) => u.id !== id))
  }

  const handleAddTopic = async (unitId: string, name: string) => {
    const { data, error } = await supabase
      .from('topics')
      .insert({
        unit_id: unitId,
        user_id: user?.id,
        name: name,
        completed: false,
        revision_level: 0,
      })
      .select()

    if (!error && data) {
      setTopics([...topics, data[0]])
    }
  }

  const handleToggleTopic = async (id: string, completed: boolean) => {
    const { error } = await supabase
      .from('topics')
      .update({
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      })
      .eq('id', id)

    if (!error) {
      setTopics(topics.map((t) => t.id === id ? { ...t, completed, completed_at: completed ? new Date().toISOString() : null } : t))
      if (selectedSubject) {
        const total = topics.length
        const done = topics.filter((t) => t.completed).length + (completed ? 1 : -1)
        const progress = total > 0 ? Math.round((done / total) * 100) : 0
        await supabase.from('subjects').update({ progress }).eq('id', selectedSubject.id)
        setSelectedSubject({ ...selectedSubject, progress })
        setSubjects(subjects.map((s) => s.id === selectedSubject.id ? { ...s, progress } : s))
      }
    }
  }

  const handleEditTopic = async (id: string, name: string) => {
    const { error } = await supabase.from('topics').update({ name }).eq('id', id)
    if (!error) setTopics(topics.map((t) => t.id === id ? { ...t, name } : t))
  }

  const handleDeleteTopic = async (id: string) => {
    const { error } = await supabase.from('topics').delete().eq('id', id)
    if (!error) setTopics(topics.filter((t) => t.id !== id))
  }

  const handleAddStudySession = async (duration: number, note: string) => {
    const { data, error } = await supabase
      .from('study_sessions')
      .insert({
        user_id: user?.id,
        subject_id: selectedSubject?.id,
        duration: duration,
        date: new Date().toISOString(),
        note: note || null,
      })
      .select()

    if (!error && data) {
      setStudySessions([data[0], ...studySessions])
      fetchSubjectDetails(selectedSubject?.id)
    }
  }

  const handleDeleteStudySession = async (id: string) => {
    const { error } = await supabase.from('study_sessions').delete().eq('id', id)
    if (!error) {
      setStudySessions(studySessions.filter((s) => s.id !== id))
      fetchSubjectDetails(selectedSubject?.id)
    }
  }

  const handleAddAssignment = async (assignment: any) => {
    const { data, error } = await supabase
      .from('assignments')
      .insert({
        user_id: user?.id,
        subject_id: selectedSubject?.id,
        title: assignment.title,
        description: assignment.description || null,
        due_date: assignment.due_date || null,
        priority: assignment.priority || 'medium',
        completed: false,
      })
      .select()

    if (!error && data) {
      setSubjectAssignments([data[0], ...subjectAssignments])
      fetchSubjectDetails(selectedSubject?.id)
    }
  }

  const handleToggleAssignment = async (id: string, completed: boolean) => {
    const { error } = await supabase
      .from('assignments')
      .update({ completed, completed_at: completed ? new Date().toISOString() : null })
      .eq('id', id)

    if (!error) {
      setSubjectAssignments(subjectAssignments.map((a) => a.id === id ? { ...a, completed } : a))
      fetchSubjectDetails(selectedSubject?.id)
    }
  }

  const handleDeleteAssignment = async (id: string) => {
    const { error } = await supabase.from('assignments').delete().eq('id', id)
    if (!error) {
      setSubjectAssignments(subjectAssignments.filter((a) => a.id !== id))
      fetchSubjectDetails(selectedSubject?.id)
    }
  }

  const handleAddResource = async (resource: any) => {
    const { data, error } = await supabase
      .from('resources')
      .insert({
        user_id: user?.id,
        subject_id: selectedSubject?.id,
        title: resource.title,
        type: resource.type || 'link',
        url: resource.url || null,
        description: resource.description || null,
      })
      .select()

    if (!error && data) {
      setSubjectResources([data[0], ...subjectResources])
    }
  }

  const handleDeleteResource = async (id: string) => {
    const { error } = await supabase.from('resources').delete().eq('id', id)
    if (!error) {
      setSubjectResources(subjectResources.filter((r) => r.id !== id))
    }
  }

  const filteredSubjects = subjects.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.code || '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
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
                <BookOpen className="h-6 w-6 text-white/70" />
                <span className="text-xs font-medium tracking-widest text-white/60 uppercase">
                  Subject Management
                </span>
              </div>
              <h1 className="mt-2 text-2xl md:text-3xl font-bold text-white">
                📚 Manage Your Subjects
              </h1>
              <p className="mt-1 text-white/70 text-sm">
                {selectedSubject ? `Working on: ${selectedSubject.name}` : 'Organize your semester, track progress, and stay consistent.'}
              </p>
            </div>
            {!selectedSubject && (
              <Button
                onClick={() => setShowAddSubject(true)}
                className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Subject
              </Button>
            )}
          </div>
        </motion.div>

        {!selectedSubject ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search subjects..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-white/50 backdrop-blur-sm border-gray-200 rounded-xl"
                />
              </div>
              <Button onClick={() => setShowAddSubject(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Subject
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard title="Total Subjects" value={stats.total} icon={BookOpen} color="from-blue-500 to-blue-600" />
              <StatCard title="Total Credits" value={stats.credits} icon={GraduationCap} color="from-purple-500 to-pink-500" />
              <StatCard title="Lessons Done" value={stats.lessonsCompleted} icon={CheckCircle2} color="from-emerald-500 to-green-500" />
              <StatCard title="Study Hours" value={`${stats.studyHours}h`} icon={Clock} color="from-amber-500 to-orange-500" />
            </div>

            {filteredSubjects.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto w-24 h-24 rounded-full bg-[#F8EEF1] flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-[#6D0F2B]" />
                </div>
                <p className="mt-4 text-lg font-medium text-gray-700">No subjects added yet</p>
                <p className="text-sm text-gray-400">Start by adding your first subject</p>
                <Button onClick={() => setShowAddSubject(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" /> Add Subject
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSubjects.map((subject) => (
                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    onSelect={handleSelectSubject}
                    onDelete={handleDeleteSubject}
                    onEdit={handleEditSubject}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6">
            <Button variant="ghost" onClick={() => setSelectedSubject(null)} className="gap-1 text-sm">
              <ChevronRight className="h-4 w-4 rotate-180" /> Back to Subjects
            </Button>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-3xl">{selectedSubject.icon || '📚'}</div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedSubject.name}</h2>
                  <p className="text-sm text-gray-500">
                    {selectedSubject.faculty || 'No faculty'} • {selectedSubject.code || 'CS101'} • {selectedSubject.credits || 3} Credits
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-sm px-3 py-1">
                  {selectedSubject.progress || 0}% Complete
                </Badge>
                <Button variant="outline" size="sm" onClick={() => handleEditSubject(selectedSubject)}>
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
              </div>
            </div>

            <Progress value={selectedSubject.progress || 0} className="h-2" />

            <SubjectProgressDashboard 
              subject={selectedSubject}
              units={units}
              topics={topics}
              sessions={studySessions}
              assignments={subjectAssignments}
            />

            <Tabs defaultValue="syllabus" className="w-full">
              <TabsList className="bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl p-1">
                <TabsTrigger value="syllabus" className="rounded-lg">📋 Syllabus</TabsTrigger>
                <TabsTrigger value="study" className="rounded-lg">⏱️ Study</TabsTrigger>
                <TabsTrigger value="assignments" className="rounded-lg">📝 Assignments</TabsTrigger>
                <TabsTrigger value="resources" className="rounded-lg">📁 Resources</TabsTrigger>
              </TabsList>

              <TabsContent value="syllabus" className="mt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddUnit(true)}
                    className="gap-1 border-dashed"
                  >
                    <Plus className="h-4 w-4" /> Add Unit
                  </Button>
                </div>

                {units.length === 0 ? (
                  <div className="py-12 text-center bg-gray-50 rounded-2xl">
                    <p className="text-gray-500">No units created yet</p>
                    <p className="text-sm text-gray-400">Add units to start building your syllabus</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {units.map((unit) => (
                      <UnitSection
                        key={unit.id}
                        unit={unit}
                        topics={topics.filter((t) => t.unit_id === unit.id)}
                        onAddTopic={handleAddTopic}
                        onToggleTopic={handleToggleTopic}
                        onEditTopic={handleEditTopic}
                        onDeleteTopic={handleDeleteTopic}
                        onEditUnit={(u: any) => {
                          const newName = prompt('Edit unit name:', u.name)
                          if (newName) {
                            supabase.from('units').update({ name: newName }).eq('id', u.id)
                            setUnits(units.map((unit) => unit.id === u.id ? { ...unit, name: newName } : unit))
                          }
                        }}
                        onDeleteUnit={handleDeleteUnit}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="study" className="mt-6">
                <StudyTab
                  subject={selectedSubject}
                  studySessions={studySessions}
                  onAddSession={handleAddStudySession}
                  onDeleteSession={handleDeleteStudySession}
                />
              </TabsContent>

              <TabsContent value="assignments" className="mt-6">
                <AssignmentsTab
                  assignments={subjectAssignments}
                  onAddAssignment={handleAddAssignment}
                  onToggleAssignment={handleToggleAssignment}
                  onDeleteAssignment={handleDeleteAssignment}
                />
              </TabsContent>

              <TabsContent value="resources" className="mt-6">
                <ResourcesTab
                  resources={subjectResources}
                  onAddResource={handleAddResource}
                  onDeleteResource={handleDeleteResource}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      <Dialog open={showAddSubject} onOpenChange={setShowAddSubject}>
        <DialogContent className="max-w-2xl rounded-2xl p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-[#6D0F2B] to-[#8A1538] px-6 py-4">
            <DialogHeader>
              <DialogTitle className="text-white text-xl flex items-center gap-2">
                <Plus className="h-5 w-5" /> Add New Subject
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Subject Name *</label>
                <Input
                  placeholder="e.g. Machine Learning"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Course Code</label>
                <Input
                  placeholder="e.g. CS101"
                  value={newSubject.code}
                  onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Faculty</label>
                <Input
                  placeholder="e.g. Dr. Smith"
                  value={newSubject.faculty}
                  onChange={(e) => setNewSubject({ ...newSubject, faculty: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Credits</label>
                <Select
                  value={String(newSubject.credits)}
                  onValueChange={(v) => setNewSubject({ ...newSubject, credits: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Credits" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5].map((c) => (
                      <SelectItem key={c} value={String(c)}>{c} {c === 1 ? 'Credit' : 'Credits'}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Semester</label>
                <Select
                  value={newSubject.semester}
                  onValueChange={(v) => setNewSubject({ ...newSubject, semester: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8].map((s) => (
                      <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Department</label>
                <Input
                  placeholder="e.g. Computer Science"
                  value={newSubject.department}
                  onChange={(e) => setNewSubject({ ...newSubject, department: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Color</label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECT_COLORS.map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${newSubject.color === color ? 'border-[#6D0F2B] scale-110' : 'border-transparent'}`}
                      style={{ background: color }}
                      onClick={() => setNewSubject({ ...newSubject, color })}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECT_ICONS.map((icon) => (
                    <button
                      key={icon}
                      className={`w-10 h-10 rounded-lg text-xl border-2 transition-all ${newSubject.icon === icon ? 'border-[#6D0F2B] bg-[#F8EEF1]' : 'border-gray-200'}`}
                      onClick={() => setNewSubject({ ...newSubject, icon })}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowAddSubject(false)}>Cancel</Button>
              <Button onClick={handleAddSubject} className="bg-[#6D0F2B] hover:bg-[#8A1538]">
                <Plus className="h-4 w-4 mr-2" /> Create Subject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditSubject} onOpenChange={setShowEditSubject}>
        <DialogContent className="max-w-2xl rounded-2xl p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-[#6D0F2B] to-[#8A1538] px-6 py-4">
            <DialogHeader>
              <DialogTitle className="text-white text-xl flex items-center gap-2">
                <Edit className="h-5 w-5" /> Edit Subject
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {editSubjectData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Subject Name</label>
                  <Input
                    value={editSubjectData.name}
                    onChange={(e) => setEditSubjectData({ ...editSubjectData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Course Code</label>
                  <Input
                    value={editSubjectData.code || ''}
                    onChange={(e) => setEditSubjectData({ ...editSubjectData, code: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Faculty</label>
                  <Input
                    value={editSubjectData.faculty || ''}
                    onChange={(e) => setEditSubjectData({ ...editSubjectData, faculty: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Credits</label>
                  <Select
                    value={String(editSubjectData.credits || 3)}
                    onValueChange={(v) => setEditSubjectData({ ...editSubjectData, credits: parseInt(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5].map((c) => (
                        <SelectItem key={c} value={String(c)}>{c} {c === 1 ? 'Credit' : 'Credits'}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Semester</label>
                  <Select
                    value={editSubjectData.semester || '1'}
                    onValueChange={(v) => setEditSubjectData({ ...editSubjectData, semester: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8].map((s) => (
                        <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Department</label>
                  <Input
                    value={editSubjectData.department || ''}
                    onChange={(e) => setEditSubjectData({ ...editSubjectData, department: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {SUBJECT_COLORS.map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${editSubjectData.color === color ? 'border-[#6D0F2B] scale-110' : 'border-transparent'}`}
                        style={{ background: color }}
                        onClick={() => setEditSubjectData({ ...editSubjectData, color })}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {SUBJECT_ICONS.map((icon) => (
                      <button
                        key={icon}
                        className={`w-10 h-10 rounded-lg text-xl border-2 transition-all ${editSubjectData.icon === icon ? 'border-[#6D0F2B] bg-[#F8EEF1]' : 'border-gray-200'}`}
                        onClick={() => setEditSubjectData({ ...editSubjectData, icon })}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowEditSubject(false)}>Cancel</Button>
              <Button onClick={handleSaveEdit} className="bg-[#6D0F2B] hover:bg-[#8A1538]">
                <Save className="h-4 w-4 mr-2" /> Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddUnit} onOpenChange={setShowAddUnit}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-[#6D0F2B]" /> Add New Unit
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              placeholder="Enter unit name (e.g. Unit 1)"
              value={newUnitName}
              onChange={(e) => setNewUnitName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddUnit()}
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddUnit(false)}>Cancel</Button>
              <Button onClick={handleAddUnit} className="bg-[#6D0F2B] hover:bg-[#8A1538]">
                <Plus className="h-4 w-4 mr-2" /> Add Unit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}