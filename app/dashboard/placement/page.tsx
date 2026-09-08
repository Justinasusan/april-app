'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
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
  Briefcase,
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
  FileText,
  Upload,
  Download,
  Building2,
  Users,
  Target,
  Brain,
  Code2,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Star,
  Medal,
  Crown,
  Rocket,
  AlertCircle,
  Trophy,
} from 'lucide-react'

// ---------- ANIMATION VARIANTS ----------
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

// ---------- COMPANY CARD ----------
function CompanyCard({ company, onEdit, onDelete }: any) {
  const statusColors: any = {
    wishlist: 'bg-gray-100 text-gray-600',
    applied: 'bg-blue-100 text-blue-600',
    online_assessment: 'bg-yellow-100 text-yellow-600',
    technical_interview: 'bg-purple-100 text-purple-600',
    hr_interview: 'bg-indigo-100 text-indigo-600',
    selected: 'bg-emerald-100 text-emerald-600',
    rejected: 'bg-red-100 text-red-600',
    offer_accepted: 'bg-green-100 text-green-600',
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="rounded-xl bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(109,15,43,0.08)] transition-all duration-300"
    >
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-[#F8EEF1] p-3">
          <Building2 className="h-5 w-5 text-[#6D0F2B]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-800">{company.name}</h4>
            <Badge className={statusColors[company.status] || 'bg-gray-100 text-gray-600'}>
              {company.status?.replace('_', ' ') || 'Wishlist'}
            </Badge>
          </div>
          <p className="text-sm text-gray-500">{company.role || 'Role not specified'}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
            {company.package && <span>💰 ₹{company.package} LPA</span>}
            {company.location && <span>📍 {company.location}</span>}
            {company.mode && <span>🏢 {company.mode}</span>}
            {company.application_deadline && (
              <span>📅 Deadline: {format(new Date(company.application_deadline), 'MMM d')}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(company)}
            className="rounded-lg p-1.5 text-gray-400 hover:text-[#6D0F2B] transition-colors"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(company.id)}
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
export default function PlacementPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // State
  const [companies, setCompanies] = useState<any[]>([])
  const [resumes, setResumes] = useState<any[]>([])
  const [codingProblems, setCodingProblems] = useState<any[]>([])
  const [skills, setSkills] = useState<any[]>([])
  const [interviewQuestions, setInterviewQuestions] = useState<any[]>([])
  const [mockInterviews, setMockInterviews] = useState<any[]>([])
  const [aptitudeTopics, setAptitudeTopics] = useState<any[]>([])
  const [placementEvents, setPlacementEvents] = useState<any[]>([])

  // Stats
  const [stats, setStats] = useState({
    companiesApplied: 0,
    upcomingAssessments: 0,
    upcomingInterviews: 0,
    offersReceived: 0,
    rejections: 0,
    problemsSolved: 0,
    mockInterviewsCompleted: 0,
  })

  // Placement Readiness Score
  const [readinessScore, setReadinessScore] = useState(0)

  // Modal states
  const [showAddCompany, setShowAddCompany] = useState(false)
  const [showAddResume, setShowAddResume] = useState(false)
  const [showAddCoding, setShowAddCoding] = useState(false)
  const [showAddSkill, setShowAddSkill] = useState(false)
  const [showAddQuestion, setShowAddQuestion] = useState(false)
  const [showAddMockInterview, setShowAddMockInterview] = useState(false)
  const [showAddEvent, setShowAddEvent] = useState(false)

  // Form states
  const [newCompany, setNewCompany] = useState({
    name: '',
    role: '',
    package: '',
    location: '',
    mode: 'onsite',
    eligibility: '',
    application_deadline: '',
    interview_date: '',
    status: 'wishlist',
    notes: '',
  })

  const [newResume, setNewResume] = useState({
    name: '',
    target_role: '',
    version: '1.0',
    status: 'active',
  })

  const [newCoding, setNewCoding] = useState({
    platform: 'leetcode',
    name: '',
    difficulty: 'medium',
    topic: '',
    date_solved: new Date().toISOString().split('T')[0],
    time_taken: '',
    notes: '',
  })

  const [newSkill, setNewSkill] = useState({
    name: '',
    category: '',
    level: 'beginner',
    resource_url: '',
    status: 'not_started',
  })

  const [newQuestion, setNewQuestion] = useState({
    type: 'technical',
    question: '',
    answer: '',
    status: 'not_started',
  })

  const [newMockInterview, setNewMockInterview] = useState({
    date: new Date().toISOString().split('T')[0],
    type: '',
    duration: '',
    feedback: '',
    score: '',
    areas_to_improve: '',
  })

  const [newEvent, setNewEvent] = useState({
    title: '',
    type: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  })

  useEffect(() => {
    if (user) fetchAllData()
  }, [user])

  const fetchAllData = async () => {
    if (!user) return

    try {
      setLoading(true)

      const [
        { data: companiesData },
        { data: resumesData },
        { data: codingData },
        { data: skillsData },
        { data: questionsData },
        { data: mockData },
        { data: aptitudeData },
        { data: eventsData },
      ] = await Promise.all([
        supabase.from('companies').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('resumes').select('*').eq('user_id', user.id),
        supabase.from('coding_problems').select('*').eq('user_id', user.id),
        supabase.from('skills').select('*').eq('user_id', user.id),
        supabase.from('interview_questions').select('*').eq('user_id', user.id),
        supabase.from('mock_interviews').select('*').eq('user_id', user.id),
        supabase.from('aptitude_topics').select('*').eq('user_id', user.id),
        supabase.from('placement_events').select('*').eq('user_id', user.id),
      ])

      setCompanies(companiesData || [])
      setResumes(resumesData || [])
      setCodingProblems(codingData || [])
      setSkills(skillsData || [])
      setInterviewQuestions(questionsData || [])
      setMockInterviews(mockData || [])
      setAptitudeTopics(aptitudeData || [])
      setPlacementEvents(eventsData || [])

      // Calculate stats
      const applied = companiesData?.filter((c: any) => c.status !== 'wishlist' && c.status !== 'rejected').length || 0
      const offers = companiesData?.filter((c: any) => c.status === 'selected' || c.status === 'offer_accepted').length || 0
      const rejected = companiesData?.filter((c: any) => c.status === 'rejected').length || 0
      const interviews = companiesData?.filter((c: any) => c.status === 'technical_interview' || c.status === 'hr_interview').length || 0
      const problems = codingData?.length || 0
      const mocks = mockData?.length || 0

      setStats({
        companiesApplied: applied,
        upcomingAssessments: 0,
        upcomingInterviews: interviews,
        offersReceived: offers,
        rejections: rejected,
        problemsSolved: problems,
        mockInterviewsCompleted: mocks,
      })

      // Calculate Readiness Score
      const resumeScore = resumesData && resumesData.length > 0 ? Math.min(20, resumesData.length * 10) : 0
      const codingScore = Math.min(25, problems * 2)
      const aptitudeScore = aptitudeData && aptitudeData.length > 0 ? Math.min(15, aptitudeData.length * 3) : 0
      const interviewScore = Math.min(20, questionsData?.filter((q: any) => q.status === 'mastered').length * 4 || 0)
      const mockScore = Math.min(10, mocks * 2)
      const applicationScore = Math.min(10, applied * 2)

      const total = Math.min(100, Math.round(resumeScore + codingScore + aptitudeScore + interviewScore + mockScore + applicationScore))
      setReadinessScore(total)

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Company handlers
  const handleAddCompany = async () => {
    if (!newCompany.name) return

    const { data, error } = await supabase
      .from('companies')
      .insert({
        user_id: user?.id,
        ...newCompany,
        package: newCompany.package ? parseFloat(newCompany.package) : null,
      })
      .select()

    if (!error && data) {
      setCompanies([data[0], ...companies])
      setShowAddCompany(false)
      setNewCompany({
        name: '',
        role: '',
        package: '',
        location: '',
        mode: 'onsite',
        eligibility: '',
        application_deadline: '',
        interview_date: '',
        status: 'wishlist',
        notes: '',
      })
      fetchAllData()
    }
  }

  const handleDeleteCompany = async (id: string) => {
    if (!confirm('Delete this company?')) return
    const { error } = await supabase.from('companies').delete().eq('id', id)
    if (!error) {
      setCompanies(companies.filter((c) => c.id !== id))
      fetchAllData()
    }
  }

  // Resume handlers
 const handleAddResume = async () => {
  console.log('🔵 Add Resume clicked')
  console.log('🔵 New Resume data:', newResume)
  console.log('🔵 User ID:', user?.id)

  if (!newResume.name) {
    console.log('⚠️ No resume name')
    alert('Please enter a resume name')
    return
  }

  if (!user?.id) {
    console.error('🔴 No user ID')
    alert('User not authenticated')
    return
  }

  try {
    const resumeData = {
      user_id: user.id,
      name: newResume.name,
      target_role: newResume.target_role || null,
      version: newResume.version || '1.0',
      status: newResume.status || 'active',
    }

    console.log('🔵 Inserting:', resumeData)

    const { data, error } = await supabase
      .from('resumes')
      .insert(resumeData)
      .select()

    if (error) {
      console.error('🔴 Supabase error:', {
        message: error.message,
        code: error.code,
        details: error.details,
      })
      alert(`Error: ${error.message || 'Failed to add resume'}`)
      return
    }

    if (data && data.length > 0) {
      console.log('🟢 Resume added:', data[0])
      setResumes([data[0], ...resumes])
      setShowAddResume(false)
      setNewResume({ name: '', target_role: '', version: '1.0', status: 'active' })
      fetchAllData()
      alert('✅ Resume added successfully!')
    }
  } catch (err) {
    console.error('🔴 Unexpected error:', err)
    alert('An unexpected error occurred. Check console for details.')
  }
}

  // Coding handlers
  const handleAddCoding = async () => {
    if (!newCoding.name) return

    const { data, error } = await supabase
      .from('coding_problems')
      .insert({
        user_id: user?.id,
        ...newCoding,
        time_taken: newCoding.time_taken ? parseInt(newCoding.time_taken) : null,
      })
      .select()

    if (!error && data) {
      setCodingProblems([data[0], ...codingProblems])
      setShowAddCoding(false)
      setNewCoding({
        platform: 'leetcode',
        name: '',
        difficulty: 'medium',
        topic: '',
        date_solved: new Date().toISOString().split('T')[0],
        time_taken: '',
        notes: '',
      })
      fetchAllData()
    }
  }

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.role || '').toLowerCase().includes(search.toLowerCase())
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
                <Briefcase className="h-6 w-6 text-white/70" />
                <span className="text-xs font-medium tracking-widest text-white/60 uppercase">
                  Placement Management
                </span>
              </div>
              <h1 className="mt-2 text-2xl md:text-3xl font-bold text-white">
                💼 Placement Coach
              </h1>
              <p className="mt-1 text-white/70 text-sm">
                Track applications, prepare for interviews, and monitor your placement readiness.
              </p>
            </div>
            <Button
              onClick={() => setShowAddCompany(true)}
              className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </Button>
          </div>
        </motion.div>

        {/* ----- STATS ----- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            title="Companies Applied"
            value={stats.companiesApplied}
            icon={Building2}
            color="from-blue-500 to-blue-600"
            loading={loading}
          />
          <StatCard
            title="Problems Solved"
            value={stats.problemsSolved}
            icon={Code2}
            color="from-purple-500 to-pink-500"
            loading={loading}
          />
          <StatCard
            title="Mock Interviews"
            value={stats.mockInterviewsCompleted}
            icon={Users}
            color="from-emerald-500 to-green-500"
            loading={loading}
          />
          <StatCard
            title="Offers Received"
            value={stats.offersReceived}
            icon={Trophy}
            color="from-amber-500 to-orange-500"
            loading={loading}
          />
        </div>

        {/* ----- READINESS SCORE ----- */}
        <Card className="border-0 shadow-[0_4px_24px_rgba(0,0,0,0.06)] rounded-2xl overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#F8EEF1]">
                <Target className="h-5 w-5 text-[#6D0F2B]" />
              </div>
              <CardTitle className="text-gray-800">Placement Readiness</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative">
                <svg className="h-24 w-24 -rotate-90 transform">
                  <circle className="text-gray-200" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="48" cy="48" />
                  <motion.circle
                    initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - readinessScore / 100) }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className="text-[#6D0F2B]" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="48" cy="48"
                    strokeLinecap="round" strokeDasharray={2 * Math.PI * 40}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-xl font-bold">{readinessScore}</p>
                    <p className="text-[10px] text-gray-400">/ 100</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-lg font-semibold">
                  {readinessScore >= 80 ? '🌟 Placement Ready' :
                   readinessScore >= 60 ? '💪 Interview Ready' :
                   readinessScore >= 40 ? '📈 Developing' :
                   '🌱 Beginner'}
                </p>
                <p className="text-sm text-gray-500">
                  {readinessScore === 0 ? 'Start preparing to build your placement profile.' :
                   'Based on your activity'}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-[10px]">Resume 20%</Badge>
                  <Badge variant="outline" className="text-[10px]">Coding 25%</Badge>
                  <Badge variant="outline" className="text-[10px]">Aptitude 15%</Badge>
                  <Badge variant="outline" className="text-[10px]">Interview 20%</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ----- TABS ----- */}
        <Tabs defaultValue="companies" className="w-full">
          <TabsList className="bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl p-1 flex-wrap">
            <TabsTrigger value="companies" className="rounded-lg">🏢 Companies</TabsTrigger>
            <TabsTrigger value="coding" className="rounded-lg">💻 Coding</TabsTrigger>
            <TabsTrigger value="skills" className="rounded-lg">📚 Skills</TabsTrigger>
            <TabsTrigger value="interview" className="rounded-lg">🎯 Interview</TabsTrigger>
            <TabsTrigger value="resume" className="rounded-lg">📄 Resume</TabsTrigger>
          </TabsList>

          {/* ----- COMPANIES TAB ----- */}
          <TabsContent value="companies" className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search companies..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-white/50 backdrop-blur-sm border-gray-200 rounded-xl"
                />
              </div>
              <Button onClick={() => setShowAddCompany(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Company
              </Button>
            </div>

            {companies.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto w-20 h-20 rounded-full bg-[#F8EEF1] flex items-center justify-center">
                  <Building2 className="h-10 w-10 text-[#6D0F2B]" />
                </div>
                <p className="mt-4 text-lg font-medium text-gray-700">No companies tracked yet</p>
                <p className="text-sm text-gray-400">Start your placement journey by adding companies</p>
                <Button onClick={() => setShowAddCompany(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" /> Add Company
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCompanies.map((company) => (
                  <CompanyCard
                    key={company.id}
                    company={company}
                    onEdit={() => {}}
                    onDelete={handleDeleteCompany}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* ----- CODING TAB ----- */}
          <TabsContent value="coding" className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-500">Track your coding practice</p>
              </div>
              <Button onClick={() => setShowAddCoding(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Problem
              </Button>
            </div>

            {codingProblems.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto w-20 h-20 rounded-full bg-[#F8EEF1] flex items-center justify-center">
                  <Code2 className="h-10 w-10 text-[#6D0F2B]" />
                </div>
                <p className="mt-4 text-lg font-medium text-gray-700">No coding problems solved</p>
                <p className="text-sm text-gray-400">Track your coding practice to improve</p>
                <Button onClick={() => setShowAddCoding(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" /> Add Problem
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {codingProblems.map((problem) => (
                  <div key={problem.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className={`w-2 h-2 rounded-full ${
                      problem.difficulty === 'easy' ? 'bg-emerald-500' :
                      problem.difficulty === 'medium' ? 'bg-amber-500' :
                      'bg-red-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">{problem.name}</p>
                      <p className="text-xs text-gray-400">
                        {problem.platform} • {problem.topic || 'General'} • {problem.difficulty}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {problem.date_solved ? format(new Date(problem.date_solved), 'MMM d') : 'No date'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ----- SKILLS TAB ----- */}
          <TabsContent value="skills" className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-500">Track your technical skills</p>
              </div>
              <Button onClick={() => setShowAddSkill(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Skill
              </Button>
            </div>

            {skills.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto w-20 h-20 rounded-full bg-[#F8EEF1] flex items-center justify-center">
                  <Brain className="h-10 w-10 text-[#6D0F2B]" />
                </div>
                <p className="mt-4 text-lg font-medium text-gray-700">No skills added</p>
                <p className="text-sm text-gray-400">Track your skills to improve</p>
                <Button onClick={() => setShowAddSkill(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" /> Add Skill
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {skills.map((skill) => (
                  <div key={skill.id} className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-700">{skill.name}</p>
                      <Badge
                        variant={
                          skill.level === 'advanced' ? 'default' :
                          skill.level === 'intermediate' ? 'secondary' :
                          'outline'
                        }
                        className="text-[10px]"
                      >
                        {skill.level || 'beginner'}
                      </Badge>
                    </div>
                    {skill.category && <p className="text-xs text-gray-400">{skill.category}</p>}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ----- INTERVIEW TAB ----- */}
          <TabsContent value="interview" className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-500">Prepare for interviews</p>
              </div>
              <Button onClick={() => setShowAddQuestion(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
              <Button variant="outline" onClick={() => setShowAddMockInterview(true)}>
                <Users className="h-4 w-4 mr-2" />
                Log Mock Interview
              </Button>
            </div>

            {interviewQuestions.length === 0 && mockInterviews.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto w-20 h-20 rounded-full bg-[#F8EEF1] flex items-center justify-center">
                  <Users className="h-10 w-10 text-[#6D0F2B]" />
                </div>
                <p className="mt-4 text-lg font-medium text-gray-700">No interview prep yet</p>
                <p className="text-sm text-gray-400">Add questions or log mock interviews</p>
                <div className="flex gap-3 justify-center mt-4">
                  <Button onClick={() => setShowAddQuestion(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Add Question
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddMockInterview(true)}>
                    Log Mock Interview
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {mockInterviews.map((mock) => (
                  <div key={mock.id} className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-700">{mock.type || 'Mock Interview'}</p>
                        <p className="text-xs text-gray-400">
                          {mock.date ? format(new Date(mock.date), 'MMM d, yyyy') : 'No date'} • {mock.duration} min
                        </p>
                      </div>
                      {mock.score && (
                        <Badge variant={mock.score >= 70 ? 'default' : 'secondary'} className="text-[10px]">
                          Score: {mock.score}%
                        </Badge>
                      )}
                    </div>
                    {mock.feedback && <p className="text-sm text-gray-500 mt-1">{mock.feedback}</p>}
                  </div>
                ))}
                {interviewQuestions.slice(0, 3).map((q) => (
                  <div key={q.id} className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-700">{q.question}</p>
                      <Badge
                        variant={
                          q.status === 'mastered' ? 'default' :
                          q.status === 'practicing' ? 'secondary' :
                          'outline'
                        }
                        className="text-[10px]"
                      >
                        {q.status || 'not_started'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400">{q.type || 'technical'}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ----- RESUME TAB ----- */}
          <TabsContent value="resume" className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-500">Manage your resumes</p>
              </div>
              <Button onClick={() => setShowAddResume(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Resume
              </Button>
            </div>

            {resumes.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto w-20 h-20 rounded-full bg-[#F8EEF1] flex items-center justify-center">
                  <FileText className="h-10 w-10 text-[#6D0F2B]" />
                </div>
                <p className="mt-4 text-lg font-medium text-gray-700">No resume uploaded</p>
                <p className="text-sm text-gray-400">Upload your resume to get started</p>
                <Button onClick={() => setShowAddResume(true)} className="mt-4">
                  <Upload className="h-4 w-4 mr-2" /> Upload Resume
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {resumes.map((resume) => (
                  <div key={resume.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <FileText className="h-8 w-8 text-[#6D0F2B]" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-700">{resume.name}</p>
                      <p className="text-xs text-gray-400">
                        {resume.target_role || 'No target role'} • v{resume.version}
                      </p>
                    </div>
                    <Badge variant={resume.status === 'active' ? 'default' : 'outline'} className="text-[10px]">
                      {resume.status || 'active'}
                    </Badge>
                    <button className="p-1.5 text-gray-400 hover:text-[#6D0F2B]">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* ----- ADD COMPANY MODAL ----- */}
      <Dialog open={showAddCompany} onOpenChange={setShowAddCompany}>
        <DialogContent className="max-w-2xl rounded-2xl p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-[#6D0F2B] to-[#8A1538] px-6 py-4">
            <DialogHeader>
              <DialogTitle className="text-white text-xl flex items-center gap-2">
                <Plus className="h-5 w-5" /> Add Company
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Company Name *</label>
                <Input
                  placeholder="e.g. Google"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Role</label>
                <Input
                  placeholder="e.g. SDE Intern"
                  value={newCompany.role}
                  onChange={(e) => setNewCompany({ ...newCompany, role: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Package (LPA)</label>
                <Input
                  type="number"
                  placeholder="e.g. 20"
                  value={newCompany.package}
                  onChange={(e) => setNewCompany({ ...newCompany, package: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Location</label>
                <Input
                  placeholder="e.g. Bangalore"
                  value={newCompany.location}
                  onChange={(e) => setNewCompany({ ...newCompany, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Mode</label>
                <Select
                  value={newCompany.mode}
                  onValueChange={(v) => setNewCompany({ ...newCompany, mode: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="onsite">Onsite</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Select
                  value={newCompany.status}
                  onValueChange={(v) => setNewCompany({ ...newCompany, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wishlist">💭 Wishlist</SelectItem>
                    <SelectItem value="applied">📤 Applied</SelectItem>
                    <SelectItem value="online_assessment">📝 Online Assessment</SelectItem>
                    <SelectItem value="technical_interview">💻 Technical Interview</SelectItem>
                    <SelectItem value="hr_interview">🤝 HR Interview</SelectItem>
                    <SelectItem value="selected">🎉 Selected</SelectItem>
                    <SelectItem value="rejected">❌ Rejected</SelectItem>
                    <SelectItem value="offer_accepted">✅ Offer Accepted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Application Deadline</label>
                <Input
                  type="date"
                  value={newCompany.application_deadline}
                  onChange={(e) => setNewCompany({ ...newCompany, application_deadline: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Interview Date</label>
                <Input
                  type="date"
                  value={newCompany.interview_date}
                  onChange={(e) => setNewCompany({ ...newCompany, interview_date: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Notes</label>
                <Input
                  placeholder="Add notes about this company..."
                  value={newCompany.notes}
                  onChange={(e) => setNewCompany({ ...newCompany, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowAddCompany(false)}>Cancel</Button>
              <Button onClick={handleAddCompany} className="bg-[#6D0F2B] hover:bg-[#8A1538]">
                <Plus className="h-4 w-4 mr-2" /> Add Company
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ----- ADD CODING PROBLEM MODAL ----- */}
      <Dialog open={showAddCoding} onOpenChange={setShowAddCoding}>
        <DialogContent className="max-w-2xl rounded-2xl p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-[#6D0F2B] to-[#8A1538] px-6 py-4">
            <DialogHeader>
              <DialogTitle className="text-white text-xl flex items-center gap-2">
                <Plus className="h-5 w-5" /> Add Coding Problem
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Platform</label>
                <Select
                  value={newCoding.platform}
                  onValueChange={(v) => setNewCoding({ ...newCoding, platform: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="leetcode">LeetCode</SelectItem>
                    <SelectItem value="codeforces">CodeForces</SelectItem>
                    <SelectItem value="codechef">CodeChef</SelectItem>
                    <SelectItem value="hackerrank">HackerRank</SelectItem>
                    <SelectItem value="gfg">GeeksforGeeks</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Problem Name *</label>
                <Input
                  placeholder="e.g. Two Sum"
                  value={newCoding.name}
                  onChange={(e) => setNewCoding({ ...newCoding, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Difficulty</label>
                <Select
                  value={newCoding.difficulty}
                  onValueChange={(v) => setNewCoding({ ...newCoding, difficulty: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">🟢 Easy</SelectItem>
                    <SelectItem value="medium">🟡 Medium</SelectItem>
                    <SelectItem value="hard">🔴 Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Topic</label>
                <Input
                  placeholder="e.g. Arrays, DP"
                  value={newCoding.topic}
                  onChange={(e) => setNewCoding({ ...newCoding, topic: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Date Solved</label>
                <Input
                  type="date"
                  value={newCoding.date_solved}
                  onChange={(e) => setNewCoding({ ...newCoding, date_solved: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Time Taken (minutes)</label>
                <Input
                  type="number"
                  placeholder="e.g. 30"
                  value={newCoding.time_taken}
                  onChange={(e) => setNewCoding({ ...newCoding, time_taken: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Notes</label>
                <Input
                  placeholder="Add notes about this problem..."
                  value={newCoding.notes}
                  onChange={(e) => setNewCoding({ ...newCoding, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowAddCoding(false)}>Cancel</Button>
              <Button onClick={handleAddCoding} className="bg-[#6D0F2B] hover:bg-[#8A1538]">
                <Plus className="h-4 w-4 mr-2" /> Add Problem
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ----- ADD SKILL MODAL ----- */}
      <Dialog open={showAddSkill} onOpenChange={setShowAddSkill}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-[#6D0F2B]" /> Add Skill
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              placeholder="Skill name *"
              value={newSkill.name}
              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
            />
            <Input
              placeholder="Category (e.g. DSA, DBMS)"
              value={newSkill.category}
              onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
            />
            <Select
              value={newSkill.level}
              onValueChange={(v) => setNewSkill({ ...newSkill, level: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">🌱 Beginner</SelectItem>
                <SelectItem value="intermediate">📈 Intermediate</SelectItem>
                <SelectItem value="advanced">🚀 Advanced</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Resource URL (optional)"
              value={newSkill.resource_url}
              onChange={(e) => setNewSkill({ ...newSkill, resource_url: e.target.value })}
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddSkill(false)}>Cancel</Button>
              <Button onClick={handleAddCoding} className="bg-[#6D0F2B] hover:bg-[#8A1538]">
                <Plus className="h-4 w-4 mr-2" /> Add Skill
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ----- ADD INTERVIEW QUESTION MODAL ----- */}
      <Dialog open={showAddQuestion} onOpenChange={setShowAddQuestion}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#6D0F2B]" /> Add Interview Question
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Select
              value={newQuestion.type}
              onValueChange={(v) => setNewQuestion({ ...newQuestion, type: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Question Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technical">💻 Technical</SelectItem>
                <SelectItem value="hr">🤝 HR</SelectItem>
                <SelectItem value="behavioral">🧠 Behavioral</SelectItem>
                <SelectItem value="system_design">🏗️ System Design</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Question *"
              value={newQuestion.question}
              onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
            />
            <Input
              placeholder="Your answer (optional)"
              value={newQuestion.answer}
              onChange={(e) => setNewQuestion({ ...newQuestion, answer: e.target.value })}
            />
            <Select
              value={newQuestion.status}
              onValueChange={(v) => setNewQuestion({ ...newQuestion, status: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_started">📋 Not Started</SelectItem>
                <SelectItem value="practicing">🔄 Practicing</SelectItem>
                <SelectItem value="mastered">✅ Mastered</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddQuestion(false)}>Cancel</Button>
              <Button onClick={handleAddCoding} className="bg-[#6D0F2B] hover:bg-[#8A1538]">
                <Plus className="h-4 w-4 mr-2" /> Add Question
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ----- ADD MOCK INTERVIEW MODAL ----- */}
      <Dialog open={showAddMockInterview} onOpenChange={setShowAddMockInterview}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#6D0F2B]" /> Log Mock Interview
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              type="date"
              value={newMockInterview.date}
              onChange={(e) => setNewMockInterview({ ...newMockInterview, date: e.target.value })}
            />
            <Input
              placeholder="Interview type (e.g. Technical, HR)"
              value={newMockInterview.type}
              onChange={(e) => setNewMockInterview({ ...newMockInterview, type: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Duration (minutes)"
              value={newMockInterview.duration}
              onChange={(e) => setNewMockInterview({ ...newMockInterview, duration: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Score (0-100)"
              value={newMockInterview.score}
              onChange={(e) => setNewMockInterview({ ...newMockInterview, score: e.target.value })}
            />
            <Input
              placeholder="Feedback"
              value={newMockInterview.feedback}
              onChange={(e) => setNewMockInterview({ ...newMockInterview, feedback: e.target.value })}
            />
            <Input
              placeholder="Areas to improve"
              value={newMockInterview.areas_to_improve}
              onChange={(e) => setNewMockInterview({ ...newMockInterview, areas_to_improve: e.target.value })}
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddMockInterview(false)}>Cancel</Button>
              <Button onClick={handleAddCoding} className="bg-[#6D0F2B] hover:bg-[#8A1538]">
                <Plus className="h-4 w-4 mr-2" /> Log Interview
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}