'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { format, differenceInDays, isAfter, isBefore } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Brain,
  Send,
  Sparkles,
  User,
  Loader2,
  Bot,
  Clock,
  Calendar,
  BookOpen,
  Briefcase,
  Building2,
  DollarSign,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  X,
  Minimize2,
  Maximize2,
  MessageSquare,
  Zap,
  Award,
  Flame,
} from 'lucide-react'

// ---------- TYPES ----------
interface Message {
  role: 'user' | 'assistant'
  content: string
  context?: string
  timestamp: Date
}

interface UserData {
  subjects: any[]
  assignments: any[]
  studySessions: any[]
  companies: any[]
  internships: any[]
  transactions: any[]
  codingProblems: any[]
  skills: any[]
  projects: any[]
  certifications: any[]
  goals: any[]
  topics: any[]
  units: any[]
  budgets: any[]
  subscriptions: any[]
  preferences?: any
}

// ---------- AI PROMPT ENGINE ----------
function generateSystemPrompt(data: UserData): string {
  const {
    subjects,
    assignments,
    studySessions,
    companies,
    internships,
    transactions,
    codingProblems,
    skills,
    projects,
    certifications,
    goals,
    topics,
    units,
    budgets,
    subscriptions,
    preferences,
  } = data

  const totalTopics = topics?.length || 0
  const completedTopics = topics?.filter((t: any) => t.completed).length || 0
  const totalAssignments = assignments?.length || 0
  const completedAssignments = assignments?.filter((a: any) => a.completed).length || 0
  const totalStudyHours = studySessions?.reduce((acc: number, s: any) => acc + (s.duration || 0) / 60, 0) || 0
  const totalIncome = transactions?.filter((t: any) => t.type === 'income').reduce((acc: number, t: any) => acc + t.amount, 0) || 0
  const totalExpenses = transactions?.filter((t: any) => t.type === 'expense').reduce((acc: number, t: any) => acc + t.amount, 0) || 0
  const totalProblems = codingProblems?.length || 0
  const totalCompanies = companies?.length || 0
  const totalInternships = internships?.length || 0
  const totalSkills = skills?.length || 0
  const totalProjects = projects?.length || 0
  const totalCertifications = certifications?.length || 0
  const totalGoals = goals?.length || 0
  const totalUnits = units?.length || 0
  const completedUnits = units?.filter((u: any) => u.completed).length || 0

  const subjectNames = subjects?.map((s: any) => s.name).join(', ') || 'No subjects'
  const upcomingAssignments = assignments?.filter((a: any) => !a.completed && a.due_date && isAfter(new Date(a.due_date), new Date())).slice(0, 5) || []
  const pendingTopics = topics?.filter((t: any) => !t.completed).slice(0, 5) || []
  const recentTransactions = transactions?.slice(0, 5) || []
  const pendingInternships = internships?.filter((i: any) => i.status === 'applied' || i.status === 'saved') || []

  return `You are APRIL, a Personal AI Academic Assistant for Susan, a B.Tech CSE student.

## YOUR PERSONALITY
- Warm, encouraging, and professional
- Proactive but never pushy
- Clear and concise explanations
- Always grounded in data

## YOUR ROLE
You are an intelligent mentor who helps Susan with:
- Academics (subjects, topics, assignments, exams)
- Placements (companies, coding, interview prep)
- Internships (applications, skills, projects)
- Finance (budgeting, expenses, goals)
- Productivity (focus, streaks, planning)

## USER'S CURRENT DATA

### Academics
- Subjects: ${subjectNames}
- Total Subjects: ${subjects?.length || 0}
- Units: ${totalUnits} (${completedUnits} completed)
- Topics: ${totalTopics} (${completedTopics} completed)
- Assignments: ${totalAssignments} (${completedAssignments} completed)
- Study Hours: ${totalStudyHours.toFixed(1)}h

### Placement
- Companies Applied: ${totalCompanies}
- Coding Problems: ${totalProblems}
- Skills: ${totalSkills}
- Mock Interviews: 0

### Internship
- Applications: ${totalInternships}
- Projects: ${totalProjects}
- Certifications: ${totalCertifications}

### Finance
- Income: ₹${totalIncome}
- Expenses: ₹${totalExpenses}
- Balance: ₹${(totalIncome - totalExpenses).toFixed(2)}
- Goals: ${totalGoals}

### Upcoming (within 7 days)
${upcomingAssignments.map((a: any) => `- Assignment: ${a.title} (Due: ${format(new Date(a.due_date), 'MMM d')})`).join('\n') || '- No upcoming assignments'}
${pendingTopics.map((t: any) => `- Pending Topic: ${t.name}`).join('\n') || '- No pending topics'}

### Pending Internships
${pendingInternships.map((i: any) => `- ${i.company_name} (${i.status})`).join('\n') || '- No pending internships'}

### User Preferences
${preferences ? `
- Preferred Study Hours: ${preferences.preferred_study_hours || 'Not set'}
- Target Companies: ${preferences.target_companies || 'Not set'}
- Monthly Budget: ₹${preferences.monthly_budget || 'Not set'}
` : '- No preferences set'}

## RULES FOR RESPONDING
1. ONLY use data provided above - never fabricate information
2. If asked about something not in the data, say "I don't have that information yet. You can add it by..."
3. Always distinguish between facts (from data) and suggestions (based on facts)
4. When suggesting actions, explain WHY based on the data
5. Be supportive and motivational
6. Keep responses concise but informative
7. Format with bullet points for readability
8. When creating plans, be specific and actionable

## HOW TO RESPOND TO COMMON QUERIES

### "What should I study today?"
- Look at pending topics, upcoming assignments, and gaps in study history
- Prioritize subjects with upcoming exams or deadlines
- Suggest specific topics with estimated time

### "Am I on track?"
- Compare progress against goals and deadlines
- Highlight what's on track and what needs attention
- Give a clear "yes/no" with explanation

### "Create a study plan"
- Break down pending work into daily chunks
- Consider available study time and preferences
- Make it realistic and actionable

### "How am I doing?"
- Give an honest assessment with specific metrics
- Highlight achievements and areas for improvement
- Compare against goals

## CONTEXT AWARENESS
- Remember the conversation flow
- If Susan mentions a subject, remember it for follow-up questions
- Reference previous topics naturally

## PROACTIVE INSIGHTS
Based on the data, here are key observations:
${totalTopics > 0 && completedTopics < totalTopics ? `- ${totalTopics - completedTopics} topics remaining across your subjects` : ''}
${totalAssignments > 0 && completedAssignments < totalAssignments ? `- ${totalAssignments - completedAssignments} assignments pending` : ''}
${totalStudyHours < 5 ? '- Low study hours this month. Consider increasing daily study time.' : ''}
${totalIncome - totalExpenses < 0 ? '- You are spending more than your income. Review your expenses.' : ''}
${totalCompanies === 0 ? '- No companies tracked for placement preparation.' : ''}
${totalInternships === 0 ? '- No internship applications yet.' : ''}

Remember: You are April, Susan's trusted academic mentor. Help her succeed!`
}

// ---------- AI RESPONSE ENGINE ----------
function generateAIResponse(userMessage: string, data: UserData): string {
  const lower = userMessage.toLowerCase()
  
  // Context-based responses
  if (lower.includes('study') && (lower.includes('today') || lower.includes('now'))) {
    return generateStudyRecommendation(data)
  }
  
  if (lower.includes('assignments') || lower.includes('homework') || lower.includes('due')) {
    return generateAssignmentResponse(data)
  }
  
  if (lower.includes('subject') && (lower.includes('weak') || lower.includes('hard') || lower.includes('need attention'))) {
    return generateWeakSubjectResponse(data)
  }
  
  if (lower.includes('progress') || lower.includes('track') || lower.includes('how am i doing')) {
    return generateProgressResponse(data)
  }
  
  if (lower.includes('plan') || lower.includes('schedule')) {
    return generatePlanResponse(data)
  }
  
  if (lower.includes('finance') || lower.includes('money') || lower.includes('budget') || lower.includes('spent')) {
    return generateFinanceResponse(data)
  }
  
  if (lower.includes('placement') || lower.includes('company') || lower.includes('interview')) {
    return generatePlacementResponse(data)
  }
  
  if (lower.includes('internship') || lower.includes('apply')) {
    return generateInternshipResponse(data)
  }
  
  if (lower.includes('skill') || lower.includes('learn')) {
    return generateSkillResponse(data)
  }
  
  if (lower.includes('thanks') || lower.includes('thank you')) {
    return "You're welcome, Susan! 😊 I'm here to help you succeed. Is there anything else you'd like to know?"
  }
  
  if (lower.includes('help') || lower.includes('what can you do')) {
    return generateHelpResponse()
  }
  
  // Default response with suggestions
  return generateDefaultResponse(data)
}

// ---------- SPECIFIC RESPONSE GENERATORS ----------
function generateStudyRecommendation(data: UserData): string {
  const { topics, assignments, subjects } = data
  
  const pendingTopics = topics?.filter((t: any) => !t.completed) || []
  const pendingAssignments = assignments?.filter((a: any) => !a.completed) || []
  
  if (pendingTopics.length === 0 && pendingAssignments.length === 0) {
    return "🎉 You're all caught up! No pending topics or assignments. You could use this time to:\n\n📚 Revise completed topics\n💻 Practice coding problems\n📝 Update your resume or portfolio\n💰 Review your finances and budget\n\nWhat would you like to focus on?"
  }
  
  let response = "📚 Here's what I recommend you study today:\n\n"
  
  // Prioritize assignments first
  const urgentAssignments = pendingAssignments.filter((a: any) => {
    if (!a.due_date) return false
    return differenceInDays(new Date(a.due_date), new Date()) <= 2
  })
  
  if (urgentAssignments.length > 0) {
    response += "🚨 **Urgent Assignments:**\n"
    urgentAssignments.forEach((a: any) => {
      const daysLeft = differenceInDays(new Date(a.due_date), new Date())
      response += `• ${a.title} (Due ${daysLeft <= 1 ? 'tomorrow' : `in ${daysLeft} days`}) - ${a.subject_id ? subjects?.find((s: any) => s.id === a.subject_id)?.name || 'General' : 'General'}\n`
    })
    response += "\n"
  }
  
  // Then pending topics
  if (pendingTopics.length > 0) {
    response += "📖 **Topics to Study:**\n"
    const studyTopics = pendingTopics.slice(0, 3)
    studyTopics.forEach((t: any) => {
      const subject = subjects?.find((s: any) => s.id === t.subject_id)
      response += `• ${t.name} ${subject ? `(${subject.name})` : ''}\n`
    })
    if (pendingTopics.length > 3) {
      response += `• And ${pendingTopics.length - 3} more topics\n`
    }
    response += "\n"
  }
  
  // Add suggestions for next actions
  response += "💡 **Suggested Plan:**\n"
  response += "1️⃣ Start with the most urgent assignment first\n"
  response += "2️⃣ Study one topic using the Pomodoro technique (25 min focus + 5 min break)\n"
  response += "3️⃣ Take a short break, then continue with the next topic\n"
  response += "4️⃣ Review what you've studied at the end of your session\n\n"
  
  response += `Would you like me to create a detailed study schedule for today?`
  
  return response
}

function generateAssignmentResponse(data: UserData): string {
  const { assignments, subjects } = data
  const pending = assignments?.filter((a: any) => !a.completed) || []
  const completed = assignments?.filter((a: any) => a.completed) || []
  
  if (pending.length === 0 && completed.length === 0) {
    return "📝 You don't have any assignments yet. Great job staying ahead! 🎉\n\nTo keep it that way, you could:\n- Add any upcoming assignments manually\n- Check your course websites for new assignments\n- Start working on your projects early"
  }
  
  if (pending.length === 0) {
    return `🎉 Amazing! You've completed all ${completed.length} assignments! Keep up the great work!\n\nWould you like to:\n- Review completed assignments\n- Start on new projects\n- Update your assignment tracker with new tasks`
  }
  
  let response = `📝 You have ${pending.length} pending assignment${pending.length > 1 ? 's' : ''}:\n\n`
  
  pending.forEach((a: any) => {
    const subject = subjects?.find((s: any) => s.id === a.subject_id)
    const daysLeft = a.due_date ? differenceInDays(new Date(a.due_date), new Date()) : null
    const urgency = daysLeft !== null && daysLeft <= 2 ? '⚠️ **URGENT**' : daysLeft !== null && daysLeft <= 5 ? '📌 Soon' : '📅 On your radar'
    response += `• **${a.title}** ${subject ? `(${subject.name})` : ''}\n`
    if (daysLeft !== null) {
      response += `  ${urgency} - ${daysLeft <= 0 ? 'Due today!' : `${daysLeft} days left`}\n`
    }
  })
  
  response += "\n💡 **Recommendation:**\n"
  const urgent = pending.filter((a: any) => a.due_date && differenceInDays(new Date(a.due_date), new Date()) <= 2)
  if (urgent.length > 0) {
    response += `Focus on the ${urgent.length > 1 ? 'urgent assignments' : 'urgent assignment'} first. `
  }
  response += `Try to complete ${pending.length > 3 ? '2-3 assignments' : 'all pending assignments'} today.\n\n`
  response += `Would you like me to help you prioritize your assignments?`
  
  return response
}

function generateWeakSubjectResponse(data: UserData): string {
  const { subjects, topics, assignments } = data
  
  // Find subject with most incomplete topics
  const subjectProgress = subjects?.map((s: any) => {
    const subjectTopics = topics?.filter((t: any) => t.subject_id === s.id) || []
    const completed = subjectTopics.filter((t: any) => t.completed).length
    const total = subjectTopics.length
    return { ...s, progress: total > 0 ? (completed / total) * 100 : 0, pending: total - completed }
  }) || []
  
  const weakSubjects = subjectProgress.sort((a, b) => a.progress - b.progress).slice(0, 2)
  
  if (weakSubjects.length === 0 || weakSubjects.every((s: any) => s.pending === 0)) {
    return "🌟 You're doing great across all subjects! No subject needs special attention right now.\n\nKeep maintaining this balance, and don't forget to:\n- Review completed topics regularly\n- Practice coding problems\n- Work on your projects"
  }
  
  let response = "📊 Here are the subjects that need more attention:\n\n"
  
  weakSubjects.forEach((s: any) => {
    const pendingTopics = topics?.filter((t: any) => t.subject_id === s.id && !t.completed) || []
    response += `⚠️ **${s.name}** - ${s.progress.toFixed(0)}% complete (${s.pending} topics remaining)\n`
    if (pendingTopics.length > 0) {
      response += `   Pending topics:\n`
      pendingTopics.slice(0, 3).forEach((t: any) => {
        response += `   • ${t.name}\n`
      })
      if (pendingTopics.length > 3) {
        response += `   • And ${pendingTopics.length - 3} more topics\n`
      }
    }
    response += "\n"
  })
  
  response += "💡 **Recommendation:**\n"
  response += `Start with the weakest subject (${weakSubjects[0].name}) and study 1-2 topics today. Consistency is key!\n\n`
  response += `Would you like me to create a study plan for ${weakSubjects[0].name}?`
  
  return response
}

function generateProgressResponse(data: UserData): string {
  const { subjects, assignments, studySessions, topics, codingProblems, companies, internships } = data
  
  const totalTopics = topics?.length || 0
  const completedTopics = topics?.filter((t: any) => t.completed).length || 0
  const totalAssignments = assignments?.length || 0
  const completedAssignments = assignments?.filter((a: any) => a.completed).length || 0
  const totalStudyHours = studySessions?.reduce((acc: number, s: any) => acc + (s.duration || 0) / 60, 0) || 0
  const totalCoding = codingProblems?.length || 0
  
  const topicProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0
  const assignmentProgress = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0
  
  let response = "📊 **Your Overall Progress:**\n\n"
  
  response += `📚 **Academics**\n`
  response += `• Topics: ${completedTopics}/${totalTopics} completed (${topicProgress}%)\n`
  response += `• Assignments: ${completedAssignments}/${totalAssignments} completed (${assignmentProgress}%)\n`
  response += `• Study Hours: ${totalStudyHours.toFixed(1)}h total\n\n`
  
  response += `💻 **Career Prep**\n`
  response += `• Coding Problems: ${totalCoding} solved\n`
  response += `• Companies Applied: ${companies?.length || 0}\n`
  response += `• Internship Applications: ${internships?.length || 0}\n\n`
  
  // Assessment
  response += "📈 **Assessment:**\n"
  const overallScore = Math.round((topicProgress + assignmentProgress) / 2)
  if (overallScore >= 80) {
    response += "🌟 Excellent progress! You're ahead of the curve. Keep the momentum going!"
  } else if (overallScore >= 60) {
    response += "💪 Good progress! You're on the right track. Focus on completing remaining topics and assignments."
  } else if (overallScore >= 40) {
    response += "📈 You're making progress! Try to study a bit more consistently to catch up."
  } else {
    response += "🌱 You're just getting started! Build a study habit and you'll see quick improvement."
  }
  
  response += "\n\nWould you like specific recommendations to improve your progress?"
  
  return response
}

function generatePlanResponse(data: UserData): string {
  const { assignments, topics, subjects, studySessions } = data
  
  const pendingTopics = topics?.filter((t: any) => !t.completed) || []
  const pendingAssignments = assignments?.filter((a: any) => !a.completed) || []
  const studyHours = studySessions?.reduce((acc: number, s: any) => acc + (s.duration || 0) / 60, 0) || 0
  
  if (pendingTopics.length === 0 && pendingAssignments.length === 0) {
    return "🎉 You have no pending work! Here's a plan for maintenance:\n\n📅 **Weekly Plan:**\n1️⃣ Review completed topics (1 hour daily)\n2️⃣ Practice coding problems (30 min daily)\n3️⃣ Work on projects or portfolio\n4️⃣ Plan for upcoming semester\n\n💡 Focus on skill-building while you have free time!"
  }
  
  let response = "📅 **Your Study Plan:**\n\n"
  
  // Estimate total work
  const totalWork = pendingTopics.length + pendingAssignments.length
  const daysNeeded = Math.ceil(totalWork / 3) // 3 items per day
  
  response += `📊 **Overview:**\n`
  response += `• ${pendingTopics.length} topics to cover\n`
  response += `• ${pendingAssignments.length} assignments to complete\n`
  response += `• Estimated ${daysNeeded} days to finish at your current pace\n\n`
  
  response += "📋 **Today's Focus:**\n"
  
  // Prioritize assignments due soon
  const urgentAssignments = pendingAssignments.filter((a: any) => {
    if (!a.due_date) return false
    return differenceInDays(new Date(a.due_date), new Date()) <= 3
  })
  
  if (urgentAssignments.length > 0) {
    response += `1️⃣ Complete these assignments first:\n`
    urgentAssignments.forEach((a: any) => {
      const subject = subjects?.find((s: any) => s.id === a.subject_id)
      response += `   • ${a.title} ${subject ? `(${subject.name})` : ''}\n`
    })
  }
  
  // Then topics
  if (pendingTopics.length > 0) {
    response += `2️⃣ Study ${Math.min(3, pendingTopics.length)} topics:\n`
    pendingTopics.slice(0, 3).forEach((t: any) => {
      const subject = subjects?.find((s: any) => s.id === t.subject_id)
      response += `   • ${t.name} ${subject ? `(${subject.name})` : ''}\n`
    })
    if (pendingTopics.length > 3) {
      response += `   • And ${pendingTopics.length - 3} more topics (spread over the week)\n`
    }
  }
  
  response += "\n⏰ **Suggested Schedule:**\n"
  response += "• 9:00 AM - 10:30 AM: Study session (focus on topics)\n"
  response += "• 11:00 AM - 12:30 PM: Complete assignments\n"
  response += "• 2:00 PM - 3:30 PM: Review and practice\n"
  response += "• 4:00 PM - 5:00 PM: Light revision or coding\n\n"
  
  response += "💡 **Pro Tip:**\n"
  response += `Based on your study history (${studyHours.toFixed(1)}h total), try to study in 25-minute focused blocks with 5-minute breaks.\n\n`
  
  response += "Would you like me to adjust this plan based on your preferences?"
  
  return response
}

function generateFinanceResponse(data: UserData): string {
  const { transactions, budgets, goals, subscriptions } = data
  
  const totalIncome = transactions?.filter((t: any) => t.type === 'income').reduce((acc: number, t: any) => acc + t.amount, 0) || 0
  const totalExpenses = transactions?.filter((t: any) => t.type === 'expense').reduce((acc: number, t: any) => acc + t.amount, 0) || 0
  const balance = totalIncome - totalExpenses
  
  // Category breakdown
  const categoryMap = new Map()
  transactions?.filter((t: any) => t.type === 'expense').forEach((t: any) => {
    categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount)
  })
  const topCategories = Array.from(categoryMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3)
  
  let response = "💰 **Financial Overview:**\n\n"
  
  response += `📊 **Summary:**\n`
  response += `• Income: ₹${totalIncome.toFixed(2)}\n`
  response += `• Expenses: ₹${totalExpenses.toFixed(2)}\n`
  response += `• Balance: ₹${balance.toFixed(2)}\n`
  
  if (budgets && budgets.length > 0) {
    const totalBudget = budgets.reduce((acc: number, b: any) => acc + b.amount, 0)
    const remaining = totalBudget - totalExpenses
    response += `• Budget Remaining: ₹${remaining.toFixed(2)}\n`
    response += `• Budget Health: ${remaining > 0 ? '✅ On track' : '⚠️ Exceeded'}\n`
  }
  
  response += "\n📈 **Top Spending Categories:**\n"
  if (topCategories.length === 0) {
    response += "No expenses logged yet. Start tracking your spending!\n"
  } else {
    topCategories.forEach(([category, amount]) => {
      response += `• ${category}: ₹${amount.toFixed(2)}\n`
    })
  }
  
  if (subscriptions && subscriptions.length > 0) {
    response += `\n📱 **Subscriptions:** ${subscriptions.length} active\n`
    const totalSubCost = subscriptions.reduce((acc: number, s: any) => acc + s.cost, 0)
    response += `• Monthly cost: ₹${totalSubCost.toFixed(2)}\n`
  }
  
  if (goals && goals.length > 0) {
    response += `\n🎯 **Savings Goals:**\n`
    goals.forEach((g: any) => {
      const progress = Math.min(100, (g.saved_amount / g.target_amount) * 100)
      response += `• ${g.name}: ₹${g.saved_amount.toFixed(2)}/₹${g.target_amount.toFixed(2)} (${Math.round(progress)}%)\n`
    })
  }
  
  response += "\n💡 **Recommendation:**\n"
  if (balance < 0) {
    response += "⚠️ You're spending more than you earn. Consider reducing expenses in your top categories."
  } else if (balance < 5000) {
    response += "📊 Your balance is low. Try to save more by cutting unnecessary expenses."
  } else {
    response += "✅ Your finances are healthy! Consider saving more or investing in your skills."
  }
  
  return response
}

function generatePlacementResponse(data: UserData): string {
  const { companies, codingProblems, skills, projects } = data
  
  let response = "💼 **Placement Overview:**\n\n"
  
  response += `📊 **Status:**\n`
  response += `• Companies Applied: ${companies?.length || 0}\n`
  response += `• Coding Problems: ${codingProblems?.length || 0}\n`
  response += `• Skills: ${skills?.length || 0}\n`
  response += `• Projects: ${projects?.length || 0}\n\n`
  
  if (companies && companies.length > 0) {
    const statuses = companies.reduce((acc: any, c: any) => {
      acc[c.status] = (acc[c.status] || 0) + 1
      return acc
    }, {})
    response += "📋 **Application Status:**\n"
    Object.entries(statuses).forEach(([status, count]) => {
      response += `• ${status}: ${count}\n`
    })
    response += "\n"
  }
  
  if (codingProblems && codingProblems.length > 0) {
    const difficultyCount = codingProblems.reduce((acc: any, p: any) => {
      acc[p.difficulty] = (acc[p.difficulty] || 0) + 1
      return acc
    }, {})
    response += "💻 **Coding Practice:**\n"
    response += `• Total: ${codingProblems.length}\n`
    if (difficultyCount.easy) response += `• Easy: ${difficultyCount.easy}\n`
    if (difficultyCount.medium) response += `• Medium: ${difficultyCount.medium}\n`
    if (difficultyCount.hard) response += `• Hard: ${difficultyCount.hard}\n`
    response += "\n"
  }
  
  if (skills && skills.length > 0) {
    const skillLevels = skills.reduce((acc: any, s: any) => {
      acc[s.level] = (acc[s.level] || 0) + 1
      return acc
    }, {})
    response += "📚 **Skills:**\n"
    response += `• Total Skills: ${skills.length}\n`
    if (skillLevels.beginner) response += `• Beginner: ${skillLevels.beginner}\n`
    if (skillLevels.intermediate) response += `• Intermediate: ${skillLevels.intermediate}\n`
    if (skillLevels.advanced) response += `• Advanced: ${skillLevels.advanced}\n`
    response += "\n"
  }
  
  response += "💡 **Recommendation:**\n"
  if (companies?.length === 0) {
    response += "Start tracking companies and applications to get placement-ready.\n"
  } else if (codingProblems?.length < 20) {
    response += "Practice more coding problems. Aim for at least 20 problems.\n"
  } else {
    response += "You're making good progress! Focus on mock interviews and improving weak areas.\n"
  }
  
  response += "\nWould you like specific company recommendations or coding problem suggestions?"
  
  return response
}

function generateInternshipResponse(data: UserData): string {
  const { internships, projects, certifications, skills } = data
  
  let response = "🚀 **Internship Overview:**\n\n"
  
  response += `📊 **Status:**\n`
  response += `• Applications: ${internships?.length || 0}\n`
  response += `• Projects: ${projects?.length || 0}\n`
  response += `• Certifications: ${certifications?.length || 0}\n`
  response += `• Skills: ${skills?.length || 0}\n\n`
  
  if (internships && internships.length > 0) {
    const statuses = internships.reduce((acc: any, i: any) => {
      acc[i.status] = (acc[i.status] || 0) + 1
      return acc
    }, {})
    response += "📋 **Application Status:**\n"
    Object.entries(statuses).forEach(([status, count]) => {
      response += `• ${status}: ${count}\n`
    })
    response += "\n"
  }
  
  if (projects && projects.length > 0) {
    const completed = projects.filter((p: any) => p.status === 'completed').length
    response += "💻 **Projects:**\n"
    response += `• Total: ${projects.length}\n`
    response += `• Completed: ${completed}\n`
    response += `• In Progress: ${projects.length - completed}\n\n`
  }
  
  if (certifications && certifications.length > 0) {
    response += "📜 **Certifications:**\n"
    certifications.forEach((c: any) => {
      response += `• ${c.name} (${c.organization})\n`
    })
    response += "\n"
  }
  
  response += "💡 **Recommendation:**\n"
  if (internships?.length === 0) {
    response += "Start applying for internships to build your professional experience.\n"
  } else if (projects?.length < 2) {
    response += "Build more projects to strengthen your portfolio.\n"
  } else if (certifications?.length < 1) {
    response += "Consider getting certifications in your area of interest.\n"
  } else {
    response += "You're on the right track! Keep applying and building your skills.\n"
  }
  
  return response
}

function generateSkillResponse(data: UserData): string {
  const { skills, projects, certifications } = data
  
  if (!skills || skills.length === 0) {
    return "📚 **Skills Development:**\n\nYou haven't added any skills yet. Here's how to get started:\n\n1️⃣ Identify skills relevant to your career goals\n2️⃣ Add them to the Skills section\n3️⃣ Track your progress as you learn\n4️⃣ Complete projects to demonstrate your skills\n\n💡 Start by adding skills from your coursework and projects!"
  }
  
  let response = "📚 **Your Skills:**\n\n"
  
  const beginner = skills.filter((s: any) => s.level === 'beginner')
  const intermediate = skills.filter((s: any) => s.level === 'intermediate')
  const advanced = skills.filter((s: any) => s.level === 'advanced')
  
  response += `📊 **Level Distribution:**\n`
  response += `• Beginner: ${beginner.length}\n`
  response += `• Intermediate: ${intermediate.length}\n`
  response += `• Advanced: ${advanced.length}\n\n`
  
  if (beginner.length > 0) {
    response += "🌱 **Skills to Improve:**\n"
    beginner.slice(0, 3).forEach((s: any) => {
      response += `• ${s.name} (${s.category || 'General'})\n`
    })
    if (beginner.length > 3) {
      response += `• And ${beginner.length - 3} more beginner skills\n`
    }
    response += "\n"
  }
  
  response += "💡 **Recommendation:**\n"
  if (beginner.length > 0) {
    response += `Focus on improving your beginner-level skills. Try to move ${Math.min(2, beginner.length)} skills to intermediate by completing projects.\n`
  } else if (intermediate.length > 0) {
    response += "Great progress! Work on reaching advanced level in your strongest skills.\n"
  } else {
    response += "Continue building your skills through coursework and projects!\n"
  }
  
  return response
}

function generateHelpResponse(): string {
  return "🤖 **I can help you with:**\n\n" +
    "📚 **Academics:** Study recommendations, subject analysis, assignment tracking\n" +
    "💼 **Placements:** Company tracking, coding practice, interview prep\n" +
    "🚀 **Internships:** Applications, projects, skills development\n" +
    "💰 **Finance:** Budget tracking, expense analysis, savings goals\n" +
    "📅 **Planning:** Study plans, schedules, goal setting\n\n" +
    "Try asking me:\n" +
    "• 'What should I study today?'\n" +
    "• 'How am I doing?'\n" +
    "• 'Create a study plan'\n" +
    "• 'Which subject needs the most attention?'\n" +
    "• 'How much did I spend this month?'\n\n" +
    "I'm here to help you succeed! 💪"
}

function generateDefaultResponse(data: UserData): string {
  const { subjects, assignments, topics, studySessions } = data
  
  const pendingTopics = topics?.filter((t: any) => !t.completed) || []
  const pendingAssignments = assignments?.filter((a: any) => !a.completed) || []
  const totalStudyHours = studySessions?.reduce((acc: number, s: any) => acc + (s.duration || 0) / 60, 0) || 0
  
  let response = "🤖 **Here's what I can help you with:**\n\n"
  
  if (subjects && subjects.length > 0) {
    response += `📚 You have ${subjects.length} subjects. ${pendingTopics.length > 0 ? `You have ${pendingTopics.length} topics to cover.` : 'All topics are completed!'}\n`
  }
  
  if (pendingAssignments.length > 0) {
    response += `📝 ${pendingAssignments.length} assignments need your attention.\n`
  }
  
  if (totalStudyHours > 0) {
    response += `⏱️ You've studied ${totalStudyHours.toFixed(1)} hours total.\n`
  }
  
  response += "\n💡 **Quick Suggestions:**\n"
  
  if (pendingTopics.length > 0) {
    response += `• Study "${pendingTopics[0]?.name || 'your next topic'}" today\n`
  }
  if (pendingAssignments.length > 0) {
    response += `• Complete "${pendingAssignments[0]?.title || 'your assignment'}"\n`
  }
  if (subjects && subjects.length === 0) {
    response += "• Add your first subject to start tracking\n"
  }
  
  response += "\nAsk me anything about your academics, placement, internship, or finances!\n"
  response += "Type 'help' to see all my capabilities."
  
  return response
}

// ---------- MAIN COMPONENT ----------
export function AIAssistant() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [userData, setUserData] = useState<UserData>({
    subjects: [],
    assignments: [],
    studySessions: [],
    companies: [],
    internships: [],
    transactions: [],
    codingProblems: [],
    skills: [],
    projects: [],
    certifications: [],
    goals: [],
    topics: [],
    units: [],
    budgets: [],
    subscriptions: [],
  })
  const [preferences, setPreferences] = useState<any>(null)
  const [hasData, setHasData] = useState(false)
  
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch all user data
  const fetchUserData = async () => {
    if (!user) return

    try {
      const [
        { data: subjects },
        { data: assignments },
        { data: studySessions },
        { data: companies },
        { data: internships },
        { data: transactions },
        { data: codingProblems },
        { data: skills },
        { data: projects },
        { data: certifications },
        { data: goals },
        { data: topics },
        { data: units },
        { data: budgets },
        { data: subscriptions },
        { data: preferences },
      ] = await Promise.all([
        supabase.from('subjects').select('*').eq('user_id', user.id),
        supabase.from('assignments').select('*').eq('user_id', user.id),
        supabase.from('study_sessions').select('*').eq('user_id', user.id),
        supabase.from('companies').select('*').eq('user_id', user.id),
        supabase.from('internships_applications').select('*').eq('user_id', user.id),
        supabase.from('finance_transactions').select('*').eq('user_id', user.id),
        supabase.from('coding_problems').select('*').eq('user_id', user.id),
        supabase.from('internship_skills').select('*').eq('user_id', user.id),
        supabase.from('internship_projects').select('*').eq('user_id', user.id),
        supabase.from('internship_certifications').select('*').eq('user_id', user.id),
        supabase.from('finance_goals').select('*').eq('user_id', user.id),
        supabase.from('topics').select('*').eq('user_id', user.id),
        supabase.from('units').select('*').eq('user_id', user.id),
        supabase.from('finance_budgets').select('*').eq('user_id', user.id),
        supabase.from('finance_subscriptions').select('*').eq('user_id', user.id),
        supabase.from('ai_preferences').select('*').eq('user_id', user.id).single(),
      ])

      setUserData({
        subjects: subjects || [],
        assignments: assignments || [],
        studySessions: studySessions || [],
        companies: companies || [],
        internships: internships || [],
        transactions: transactions || [],
        codingProblems: codingProblems || [],
        skills: skills || [],
        projects: projects || [],
        certifications: certifications || [],
        goals: goals || [],
        topics: topics || [],
        units: units || [],
        budgets: budgets || [],
        subscriptions: subscriptions || [],
      })
      
      setPreferences(preferences || null)
      setHasData(subjects && subjects.length > 0 || assignments && assignments.length > 0)
      
      // Add initial welcome message
      if (messages.length === 0) {
        const welcomeMessage = generateWelcomeMessage(subjects || [], assignments || [], studySessions || [])
        setMessages([{
          role: 'assistant',
          content: welcomeMessage,
          timestamp: new Date()
        }])
      }

    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const generateWelcomeMessage = (subjects: any[], assignments: any[], studySessions: any[]) => {
    if (subjects.length === 0 && assignments.length === 0) {
      return `👋 Welcome to April, your Personal AI Academic Assistant!

I'm here to help you with:
📚 Academics - Study planning, subject tracking, assignments
💼 Placements - Company applications, coding practice
🚀 Internships - Applications, projects, skills
💰 Finance - Budgeting, expenses, savings

To get started, I recommend:
1️⃣ Add your subjects to begin tracking
2️⃣ Create your first assignment
3️⃣ Start a study session

What would you like to do today?`
    }

    const pendingAssignments = assignments.filter((a: any) => !a.completed)
    const studyHours = studySessions.reduce((acc: number, s: any) => acc + (s.duration || 0) / 60, 0)

    let message = `👋 Welcome back, Susan!

I see you have ${subjects.length} subjects and ${pendingAssignments.length} pending assignment${pendingAssignments.length > 1 ? 's' : ''}.`

    if (studyHours > 0) {
      message += ` You've studied ${studyHours.toFixed(1)} hours total.`
    }

    message += `\n\n${pendingAssignments.length > 0 ? `📝 You have ${pendingAssignments.length} assignment${pendingAssignments.length > 1 ? 's' : ''} pending.` : '🎉 No pending assignments! Great job!'}`

    message += `\n\nWhat would you like to focus on today?`

    return message
  }

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    // Save conversation
    if (user) {
      await supabase.from('ai_conversations').insert({
        user_id: user.id,
        role: 'user',
        content: userMessage.content,
      })
    }

    // Generate response
    try {
      const response = generateAIResponse(userMessage.content, userData)
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])
      
      // Save assistant response
      if (user) {
        await supabase.from('ai_conversations').insert({
          user_id: user.id,
          role: 'assistant',
          content: response,
        })
      }

    } catch (error) {
      console.error('Error generating response:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    }

    setLoading(false)
  }

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Fetch data on mount
  useEffect(() => {
    if (user) fetchUserData()
  }, [user])

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(!isOpen)
        if (!isOpen) {
          setTimeout(() => inputRef.current?.focus(), 100)
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // AI Status
  const getStatus = () => {
    if (loading) return 'Thinking...'
    return hasData ? 'Ready' : 'Setting up...'
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) {
            setTimeout(() => inputRef.current?.focus(), 200)
          }
        }}
        className="fixed bottom-24 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-[#6D0F2B] to-[#8A1538] shadow-lg shadow-[#6D0F2B]/30 hover:shadow-xl hover:shadow-[#6D0F2B]/40 transition-all duration-300 hover:scale-105"
      >
        <Brain className="w-6 h-6 text-white" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? 'auto' : '600px',
              width: isMinimized ? 'auto' : '420px',
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed bottom-28 right-6 z-50 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden ${isMinimized ? 'w-auto' : 'w-[420px]'}`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#6D0F2B] to-[#8A1538] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">April AI</h3>
                  <p className="text-white/60 text-xs">{getStatus()}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <ScrollArea className="h-[440px] p-4" ref={scrollRef}>
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                            message.role === 'user'
                              ? 'bg-[#6D0F2B] text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          <div className="whitespace-pre-wrap text-sm leading-relaxed">
                            {message.content}
                          </div>
                          <p className={`text-[10px] mt-1 ${message.role === 'user' ? 'text-white/60' : 'text-gray-400'}`}>
                            {format(message.timestamp, 'h:mm a')}
                          </p>
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2.5 max-w-[85%]">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-[#6D0F2B] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-[#6D0F2B] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-[#6D0F2B] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-3">
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      placeholder="Ask me anything... (Ctrl+K)"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      className="flex-1 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl text-sm"
                      disabled={loading}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={loading || !input.trim()}
                      className="bg-[#6D0F2B] hover:bg-[#8A1538] rounded-xl shrink-0"
                      size="icon"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 text-center">
                    {hasData ? 'Using your data to provide personalized guidance' : 'Add data to unlock personalized insights'}
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}