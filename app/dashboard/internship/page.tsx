'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
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
  Building2,
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
  Users,
  Target,
  Brain,
  Code2,
  Briefcase,
  Rocket,
  TrendingUp,
  TrendingDown,
  Calendar,
  Star,
  Medal,
  Trophy,
} from 'lucide-react'

// ---------- ANIMATION VARIANTS ----------
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
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

// ---------- APPLICATION CARD ----------
function ApplicationCard({ application, onEdit, onDelete }: any) {
  const statusColors: any = {
    saved: 'bg-gray-100 text-gray-600',
    applied: 'bg-blue-100 text-blue-600',
    assessment: 'bg-yellow-100 text-yellow-600',
    interview: 'bg-purple-100 text-purple-600',
    offer_received: 'bg-emerald-100 text-emerald-600',
    accepted: 'bg-green-100 text-green-600',
    rejected: 'bg-red-100 text-red-600',
    completed: 'bg-indigo-100 text-indigo-600',
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
            <h4 className="font-medium text-gray-800">{application.company_name}</h4>
            <Badge className={statusColors[application.status] || 'bg-gray-100 text-gray-600'}>
              {application.status?.replace('_', ' ') || 'Saved'}
            </Badge>
          </div>
          <p className="text-sm text-gray-500">{application.role || 'Role not specified'}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
            {application.location && <span>📍 {application.location}</span>}
            {application.mode && <span>🏢 {application.mode}</span>}
            {application.duration && <span>⏱️ {application.duration}</span>}
            {application.stipend && <span>💰 ₹{application.stipend}</span>}
            {application.application_deadline && (
              <span>📅 Deadline: {format(new Date(application.application_deadline), 'MMM d')}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(application)}
            className="rounded-lg p-1.5 text-gray-400 hover:text-[#6D0F2B] transition-colors"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(application.id)}
            className="rounded-lg p-1.5 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ---------- PROJECT CARD ----------
function ProjectCard({ project, onDelete }: any) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="rounded-xl bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(109,15,43,0.08)] transition-all duration-300"
    >
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-[#F8EEF1] p-3">
          <Code2 className="h-5 w-5 text-[#6D0F2B]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-800">{project.title}</h4>
            <Badge
              variant={project.status === 'completed' ? 'default' : 'secondary'}
              className="text-[10px]"
            >
              {project.status || 'in_progress'}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 truncate">{project.description || 'No description'}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-400">
            {project.technologies && <span>🛠️ {project.technologies}</span>}
            {project.github_url && (
              <a href={project.github_url} target="_blank" rel="noopener" className="text-[#6D0F2B] hover:underline">
                GitHub
              </a>
            )}
          </div>
        </div>
        <button
          onClick={() => onDelete(project.id)}
          className="rounded-lg p-1.5 text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}

// ---------- CERTIFICATION CARD ----------
function CertificationCard({ cert, onDelete }: any) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="rounded-xl bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(109,15,43,0.08)] transition-all duration-300"
    >
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-[#F8EEF1] p-3">
          <Award className="h-5 w-5 text-[#6D0F2B]" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-800">{cert.name}</h4>
          <p className="text-sm text-gray-500">{cert.organization}</p>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-400">
            {cert.issue_date && <span>📅 Issued: {format(new Date(cert.issue_date), 'MMM yyyy')}</span>}
            {cert.credential_id && <span>🔑 {cert.credential_id}</span>}
          </div>
        </div>
        <button
          onClick={() => onDelete(cert.id)}
          className="rounded-lg p-1.5 text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}

// ---------- MAIN COMPONENT ----------
export default function InternshipPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // State
  const [applications, setApplications] = useState<any[]>([])
  const [skills, setSkills] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [certifications, setCertifications] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    interviews: 0,
    offers: 0,
    accepted: 0,
    rejected: 0,
    skills: 0,
    certificates: 0,
  })

  // Readiness Score
  const [readinessScore, setReadinessScore] = useState(0)

  // Modal states
  const [showAddApplication, setShowAddApplication] = useState(false)
  const [showAddSkill, setShowAddSkill] = useState(false)
  const [showAddProject, setShowAddProject] = useState(false)
  const [showAddCertification, setShowAddCertification] = useState(false)
  const [showAddDocument, setShowAddDocument] = useState(false)

  // Form states
  const [newApplication, setNewApplication] = useState({
    company_name: '',
    role: '',
    department: '',
    location: '',
    mode: 'remote',
    duration: '',
    stipend: '',
    application_deadline: '',
    status: 'saved',
    job_description: '',
    required_skills: '',
    application_link: '',
    notes: '',
  })

  const [newSkill, setNewSkill] = useState({
    name: '',
    category: '',
    level: 'beginner',
    resource_url: '',
    date_started: new Date().toISOString().split('T')[0],
    status: 'not_started',
  })

  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    technologies: '',
    github_url: '',
    live_demo_url: '',
    status: 'in_progress',
    completion_date: '',
    skills_learned: '',
  })

  const [newCertification, setNewCertification] = useState({
    name: '',
    organization: '',
    issue_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    credential_id: '',
    file_url: '',
    verification_url: '',
  })

  useEffect(() => {
    if (user) fetchAllData()
  }, [user])

  const fetchAllData = async () => {
    if (!user) return

    try {
      setLoading(true)

      const [
        { data: appsData },
        { data: skillsData },
        { data: projectsData },
        { data: certsData },
        { data: docsData },
        { data: eventsData },
      ] = await Promise.all([
        supabase.from('internships_applications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('internship_skills').select('*').eq('user_id', user.id),
        supabase.from('internship_projects').select('*').eq('user_id', user.id),
        supabase.from('internship_certifications').select('*').eq('user_id', user.id),
        supabase.from('internship_documents').select('*').eq('user_id', user.id),
        supabase.from('internship_events').select('*').eq('user_id', user.id),
      ])

      setApplications(appsData || [])
      setSkills(skillsData || [])
      setProjects(projectsData || [])
      setCertifications(certsData || [])
      setDocuments(docsData || [])
      setEvents(eventsData || [])

      // Calculate stats
      const total = appsData?.length || 0
      const active = appsData?.filter((a: any) => a.status !== 'rejected' && a.status !== 'completed').length || 0
      const interviews = appsData?.filter((a: any) => a.status === 'interview').length || 0
      const offers = appsData?.filter((a: any) => a.status === 'offer_received' || a.status === 'accepted').length || 0
      const accepted = appsData?.filter((a: any) => a.status === 'accepted').length || 0
      const rejected = appsData?.filter((a: any) => a.status === 'rejected').length || 0

      setStats({
        total,
        active,
        interviews,
        offers,
        accepted,
        rejected,
        skills: skillsData?.length || 0,
        certificates: certsData?.length || 0,
      })

      // Calculate Readiness Score
      const resumeScore = docsData?.filter((d: any) => d.category === 'resume').length > 0 ? 15 : 0
      const portfolioScore = projectsData?.length > 0 ? Math.min(20, projectsData.length * 4) : 0
      const projectScore = projectsData?.filter((p: any) => p.status === 'completed').length * 5 || 0
      const skillScore = skillsData?.length > 0 ? Math.min(15, skillsData.length * 2) : 0
      const certScore = certsData?.length > 0 ? Math.min(10, certsData.length * 2) : 0
      const appScore = appsData?.length > 0 ? Math.min(15, appsData.length * 2) : 0

      const totalScore = Math.min(100, Math.round(resumeScore + portfolioScore + projectScore + skillScore + certScore + appScore))
      setReadinessScore(totalScore)

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Application handlers
  const handleAddApplication = async () => {
    if (!newApplication.company_name || !newApplication.role) {
      alert('Please fill in company name and role')
      return
    }

    const { data, error } = await supabase
      .from('internships_applications')
      .insert({
        user_id: user?.id,
        ...newApplication,
        stipend: newApplication.stipend ? parseFloat(newApplication.stipend) : null,
      })
      .select()

    if (!error && data) {
      setApplications([data[0], ...applications])
      setShowAddApplication(false)
      setNewApplication({
        company_name: '',
        role: '',
        department: '',
        location: '',
        mode: 'remote',
        duration: '',
        stipend: '',
        application_deadline: '',
        status: 'saved',
        job_description: '',
        required_skills: '',
        application_link: '',
        notes: '',
      })
      fetchAllData()
    }
  }

  const handleDeleteApplication = async (id: string) => {
    if (!confirm('Delete this application?')) return
    const { error } = await supabase.from('internships_applications').delete().eq('id', id)
    if (!error) {
      setApplications(applications.filter((a) => a.id !== id))
      fetchAllData()
    }
  }

  // Skill handlers
  const handleAddSkill = async () => {
    if (!newSkill.name) return

    const { data, error } = await supabase
      .from('internship_skills')
      .insert({
        user_id: user?.id,
        ...newSkill,
      })
      .select()

    if (!error && data) {
      setSkills([data[0], ...skills])
      setShowAddSkill(false)
      setNewSkill({
        name: '',
        category: '',
        level: 'beginner',
        resource_url: '',
        date_started: new Date().toISOString().split('T')[0],
        status: 'not_started',
      })
      fetchAllData()
    }
  }

  const handleDeleteSkill = async (id: string) => {
    const { error } = await supabase.from('internship_skills').delete().eq('id', id)
    if (!error) {
      setSkills(skills.filter((s) => s.id !== id))
      fetchAllData()
    }
  }

  // Project handlers
  const handleAddProject = async () => {
    if (!newProject.title) return

    const { data, error } = await supabase
      .from('internship_projects')
      .insert({
        user_id: user?.id,
        ...newProject,
      })
      .select()

    if (!error && data) {
      setProjects([data[0], ...projects])
      setShowAddProject(false)
      setNewProject({
        title: '',
        description: '',
        technologies: '',
        github_url: '',
        live_demo_url: '',
        status: 'in_progress',
        completion_date: '',
        skills_learned: '',
      })
      fetchAllData()
    }
  }

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Delete this project?')) return
    const { error } = await supabase.from('internship_projects').delete().eq('id', id)
    if (!error) {
      setProjects(projects.filter((p) => p.id !== id))
      fetchAllData()
    }
  }

  // Certification handlers
  const handleAddCertification = async () => {
    if (!newCertification.name || !newCertification.organization) {
      alert('Please fill in certification name and organization')
      return
    }

    const { data, error } = await supabase
      .from('internship_certifications')
      .insert({
        user_id: user?.id,
        ...newCertification,
      })
      .select()

    if (!error && data) {
      setCertifications([data[0], ...certifications])
      setShowAddCertification(false)
      setNewCertification({
        name: '',
        organization: '',
        issue_date: new Date().toISOString().split('T')[0],
        expiry_date: '',
        credential_id: '',
        file_url: '',
        verification_url: '',
      })
      fetchAllData()
    }
  }

  const handleDeleteCertification = async (id: string) => {
    if (!confirm('Delete this certification?')) return
    const { error } = await supabase.from('internship_certifications').delete().eq('id', id)
    if (!error) {
      setCertifications(certifications.filter((c) => c.id !== id))
      fetchAllData()
    }
  }

  const filteredApplications = applications.filter((a) =>
    a.company_name.toLowerCase().includes(search.toLowerCase()) ||
    (a.role || '').toLowerCase().includes(search.toLowerCase())
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
                  Internship Hub
                </span>
              </div>
              <h1 className="mt-2 text-2xl md:text-3xl font-bold text-white">
                🚀 Internship Manager
              </h1>
              <p className="mt-1 text-white/70 text-sm">
                Discover, apply, and manage your internship journey.
              </p>
            </div>
            <Button
              onClick={() => setShowAddApplication(true)}
              className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Application
            </Button>
          </div>
        </motion.div>

        {/* ----- STATS ----- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            title="Total Applications"
            value={stats.total}
            icon={Building2}
            color="from-blue-500 to-blue-600"
            loading={loading}
          />
          <StatCard
            title="Active"
            value={stats.active}
            icon={Target}
            color="from-emerald-500 to-green-500"
            loading={loading}
          />
          <StatCard
            title="Interviews"
            value={stats.interviews}
            icon={Users}
            color="from-purple-500 to-pink-500"
            loading={loading}
          />
          <StatCard
            title="Offers"
            value={stats.offers}
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
                <Rocket className="h-5 w-5 text-[#6D0F2B]" />
              </div>
              <CardTitle className="text-gray-800">Internship Readiness</CardTitle>
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
                  {readinessScore >= 80 ? '🌟 Industry Ready' :
                   readinessScore >= 60 ? '💪 Internship Ready' :
                   readinessScore >= 40 ? '📈 Building Experience' :
                   '🌱 Beginner'}
                </p>
                <p className="text-sm text-gray-500">
                  {readinessScore === 0 ? 'Start building your professional profile.' :
                   'Based on your activity'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ----- TABS ----- */}
        <Tabs defaultValue="applications" className="w-full">
          <TabsList className="bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl p-1 flex-wrap">
            <TabsTrigger value="applications" className="rounded-lg">📋 Applications</TabsTrigger>
            <TabsTrigger value="skills" className="rounded-lg">📚 Skills</TabsTrigger>
            <TabsTrigger value="projects" className="rounded-lg">💻 Projects</TabsTrigger>
            <TabsTrigger value="certifications" className="rounded-lg">📜 Certifications</TabsTrigger>
          </TabsList>

          {/* ----- APPLICATIONS TAB ----- */}
          <TabsContent value="applications" className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search applications..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-white/50 backdrop-blur-sm border-gray-200 rounded-xl"
                />
              </div>
              <Button onClick={() => setShowAddApplication(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Application
              </Button>
            </div>

            {applications.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto w-20 h-20 rounded-full bg-[#F8EEF1] flex items-center justify-center">
                  <Building2 className="h-10 w-10 text-[#6D0F2B]" />
                </div>
                <p className="mt-4 text-lg font-medium text-gray-700">No internship applications yet</p>
                <p className="text-sm text-gray-400">Start your internship journey by adding an application</p>
                <Button onClick={() => setShowAddApplication(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" /> Add Application
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredApplications.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    application={app}
                    onEdit={() => {}}
                    onDelete={handleDeleteApplication}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* ----- SKILLS TAB ----- */}
          <TabsContent value="skills" className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-500">Track your professional skills</p>
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
                <p className="mt-4 text-lg font-medium text-gray-700">No skills added yet</p>
                <p className="text-sm text-gray-400">Add skills to track your professional growth</p>
                <Button onClick={() => setShowAddSkill(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" /> Add Skill
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {skills.map((skill) => (
                  <div key={skill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-700">{skill.name}</p>
                      <p className="text-xs text-gray-400">{skill.category || 'Uncategorized'} • {skill.level}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteSkill(skill.id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ----- PROJECTS TAB ----- */}
          <TabsContent value="projects" className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-500">Showcase your projects</p>
              </div>
              <Button onClick={() => setShowAddProject(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </div>

            {projects.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto w-20 h-20 rounded-full bg-[#F8EEF1] flex items-center justify-center">
                  <Code2 className="h-10 w-10 text-[#6D0F2B]" />
                </div>
                <p className="mt-4 text-lg font-medium text-gray-700">No projects added yet</p>
                <p className="text-sm text-gray-400">Add projects to build your portfolio</p>
                <Button onClick={() => setShowAddProject(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" /> Add Project
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} onDelete={handleDeleteProject} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* ----- CERTIFICATIONS TAB ----- */}
          <TabsContent value="certifications" className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-500">Track your certifications</p>
              </div>
              <Button onClick={() => setShowAddCertification(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Certification
              </Button>
            </div>

            {certifications.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto w-20 h-20 rounded-full bg-[#F8EEF1] flex items-center justify-center">
                  <Award className="h-10 w-10 text-[#6D0F2B]" />
                </div>
                <p className="mt-4 text-lg font-medium text-gray-700">No certifications yet</p>
                <p className="text-sm text-gray-400">Add certifications to strengthen your profile</p>
                <Button onClick={() => setShowAddCertification(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" /> Add Certification
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {certifications.map((cert) => (
                  <CertificationCard key={cert.id} cert={cert} onDelete={handleDeleteCertification} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* ----- ADD APPLICATION MODAL ----- */}
      <Dialog open={showAddApplication} onOpenChange={setShowAddApplication}>
        <DialogContent className="max-w-2xl rounded-2xl p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-[#6D0F2B] to-[#8A1538] px-6 py-4">
            <DialogHeader>
              <DialogTitle className="text-white text-xl flex items-center gap-2">
                <Plus className="h-5 w-5" /> Add Internship Application
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Company Name *</label>
                <Input
                  placeholder="e.g. Google"
                  value={newApplication.company_name}
                  onChange={(e) => setNewApplication({ ...newApplication, company_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Role *</label>
                <Input
                  placeholder="e.g. SWE Intern"
                  value={newApplication.role}
                  onChange={(e) => setNewApplication({ ...newApplication, role: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Department</label>
                <Input
                  placeholder="e.g. Engineering"
                  value={newApplication.department}
                  onChange={(e) => setNewApplication({ ...newApplication, department: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Location</label>
                <Input
                  placeholder="e.g. Bangalore"
                  value={newApplication.location}
                  onChange={(e) => setNewApplication({ ...newApplication, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Mode</label>
                <Select
                  value={newApplication.mode}
                  onValueChange={(v) => setNewApplication({ ...newApplication, mode: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">🌐 Remote</SelectItem>
                    <SelectItem value="hybrid">🏢 Hybrid</SelectItem>
                    <SelectItem value="onsite">📍 Onsite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Duration</label>
                <Input
                  placeholder="e.g. 6 months"
                  value={newApplication.duration}
                  onChange={(e) => setNewApplication({ ...newApplication, duration: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Stipend</label>
                <Input
                  type="number"
                  placeholder="e.g. 25000"
                  value={newApplication.stipend}
                  onChange={(e) => setNewApplication({ ...newApplication, stipend: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Application Deadline</label>
                <Input
                  type="date"
                  value={newApplication.application_deadline}
                  onChange={(e) => setNewApplication({ ...newApplication, application_deadline: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Select
                  value={newApplication.status}
                  onValueChange={(v) => setNewApplication({ ...newApplication, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="saved">💾 Saved</SelectItem>
                    <SelectItem value="applied">📤 Applied</SelectItem>
                    <SelectItem value="assessment">📝 Assessment</SelectItem>
                    <SelectItem value="interview">🎯 Interview</SelectItem>
                    <SelectItem value="offer_received">🎉 Offer Received</SelectItem>
                    <SelectItem value="accepted">✅ Accepted</SelectItem>
                    <SelectItem value="rejected">❌ Rejected</SelectItem>
                    <SelectItem value="completed">🎓 Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Application Link</label>
                <Input
                  placeholder="https://..."
                  value={newApplication.application_link}
                  onChange={(e) => setNewApplication({ ...newApplication, application_link: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Job Description</label>
                <Input
                  placeholder="Brief description..."
                  value={newApplication.job_description}
                  onChange={(e) => setNewApplication({ ...newApplication, job_description: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Required Skills</label>
                <Input
                  placeholder="Python, React, etc."
                  value={newApplication.required_skills}
                  onChange={(e) => setNewApplication({ ...newApplication, required_skills: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Notes</label>
                <Input
                  placeholder="Add notes about this application..."
                  value={newApplication.notes}
                  onChange={(e) => setNewApplication({ ...newApplication, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowAddApplication(false)}>Cancel</Button>
              <Button onClick={handleAddApplication} className="bg-[#6D0F2B] hover:bg-[#8A1538]">
                <Plus className="h-4 w-4 mr-2" /> Add Application
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
              placeholder="Category (e.g. Programming, AI/ML)"
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
            <Input
              type="date"
              value={newSkill.date_started}
              onChange={(e) => setNewSkill({ ...newSkill, date_started: e.target.value })}
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddSkill(false)}>Cancel</Button>
              <Button onClick={handleAddSkill} className="bg-[#6D0F2B] hover:bg-[#8A1538]">
                <Plus className="h-4 w-4 mr-2" /> Add Skill
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ----- ADD PROJECT MODAL ----- */}
      <Dialog open={showAddProject} onOpenChange={setShowAddProject}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-[#6D0F2B]" /> Add Project
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              placeholder="Project title *"
              value={newProject.title}
              onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
            />
            <Input
              placeholder="Description"
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            />
            <Input
              placeholder="Technologies used (comma separated)"
              value={newProject.technologies}
              onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
            />
            <Input
              placeholder="GitHub URL"
              value={newProject.github_url}
              onChange={(e) => setNewProject({ ...newProject, github_url: e.target.value })}
            />
            <Input
              placeholder="Live Demo URL"
              value={newProject.live_demo_url}
              onChange={(e) => setNewProject({ ...newProject, live_demo_url: e.target.value })}
            />
            <Select
              value={newProject.status}
              onValueChange={(v) => setNewProject({ ...newProject, status: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_progress">🔄 In Progress</SelectItem>
                <SelectItem value="completed">✅ Completed</SelectItem>
                <SelectItem value="on_hold">⏸️ On Hold</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              placeholder="Completion Date"
              value={newProject.completion_date}
              onChange={(e) => setNewProject({ ...newProject, completion_date: e.target.value })}
            />
            <Input
              placeholder="Skills learned"
              value={newProject.skills_learned}
              onChange={(e) => setNewProject({ ...newProject, skills_learned: e.target.value })}
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddProject(false)}>Cancel</Button>
              <Button onClick={handleAddProject} className="bg-[#6D0F2B] hover:bg-[#8A1538]">
                <Plus className="h-4 w-4 mr-2" /> Add Project
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ----- ADD CERTIFICATION MODAL ----- */}
      <Dialog open={showAddCertification} onOpenChange={setShowAddCertification}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-[#6D0F2B]" /> Add Certification
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              placeholder="Certification name *"
              value={newCertification.name}
              onChange={(e) => setNewCertification({ ...newCertification, name: e.target.value })}
            />
            <Input
              placeholder="Issuing organization *"
              value={newCertification.organization}
              onChange={(e) => setNewCertification({ ...newCertification, organization: e.target.value })}
            />
            <Input
              type="date"
              placeholder="Issue Date"
              value={newCertification.issue_date}
              onChange={(e) => setNewCertification({ ...newCertification, issue_date: e.target.value })}
            />
            <Input
              type="date"
              placeholder="Expiry Date (optional)"
              value={newCertification.expiry_date}
              onChange={(e) => setNewCertification({ ...newCertification, expiry_date: e.target.value })}
            />
            <Input
              placeholder="Credential ID"
              value={newCertification.credential_id}
              onChange={(e) => setNewCertification({ ...newCertification, credential_id: e.target.value })}
            />
            <Input
              placeholder="Verification URL"
              value={newCertification.verification_url}
              onChange={(e) => setNewCertification({ ...newCertification, verification_url: e.target.value })}
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddCertification(false)}>Cancel</Button>
              <Button onClick={handleAddCertification} className="bg-[#6D0F2B] hover:bg-[#8A1538]">
                <Plus className="h-4 w-4 mr-2" /> Add Certification
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}