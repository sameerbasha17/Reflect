import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  BarChart3,
  BookOpenCheck,
  CalendarCheck,
  Check,
  Flame,
  Goal,
  Sparkles,
  Target,
  AlertCircle,
  Plus
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { api, getErrorMessage } from '../api'

const chartColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [goals, setGoals] = useState([])
  const [habits, setHabits] = useState([])
  const [productivity, setProductivity] = useState([])
  const [assessments, setAssessments] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [greeting, setGreeting] = useState('Welcome back')

  useEffect(() => {
    const hours = new Date().getHours()
    if (hours < 12) setGreeting('Good morning')
    else if (hours < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')

    Promise.all([
      api.get('/dashboard/summary'),
      api.get('/dashboard/goal-progress'),
      api.get('/dashboard/habit-completion'),
      api.get('/dashboard/productivity-trend'),
      api.get('/dashboard/self-assessment-trend'),
    ])
      .then(([s, g, h, p, a]) => {
        setSummary(s.data)
        setGoals(g.data)
        setHabits(h.data)
        setProductivity(p.data)
        setAssessments(a.data)
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  function round(value) {
    return Number(value || 0).toFixed(1)
  }

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  if (loading) {
    return (
      <div className="boot">
        <div style={{ textAlign: 'center' }}>
          <Sparkles size={36} className="animate-spin" style={{ color: 'var(--primary)', marginBottom: 12 }} />
          <p>Analyzing behavioral data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      {/* Welcome Hero */}
      <section className="panel" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)', border: '1px solid rgba(59, 130, 246, 0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.05em' }}>{todayStr}</span>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', marginTop: 4 }}>{greeting}!</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Here is a snapshot of your consistency, productivity, and long-term milestones.</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/activity-logs" className="primary"><Plus size={16} /> Log Daily Activity</Link>
            <Link to="/self-assessment" className="ghost"><BookOpenCheck size={16} /> Weekly Assessment</Link>
          </div>
        </div>
      </section>

      {error && <p className="error">{error}</p>}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat">
          <Goal size={20} />
          <span>Active Goals</span>
          <strong>{summary?.activeGoals ?? 0}</strong>
        </div>
        <div className="stat">
          <Check size={20} style={{ color: 'var(--success)', backgroundColor: 'rgba(16, 185, 129, 0.1)' }} />
          <span>Goals Completed</span>
          <strong>{summary?.completedGoals ?? 0}</strong>
        </div>
        <div className="stat">
          <Target size={20} style={{ color: 'var(--info)', backgroundColor: 'rgba(6, 182, 212, 0.1)' }} />
          <span>Milestones Done</span>
          <strong>{summary?.completedMilestones ?? 0}</strong>
        </div>
        <div className="stat">
          <Flame size={20} style={{ color: 'var(--warning)', backgroundColor: 'rgba(245, 158, 11, 0.1)' }} />
          <span>Habit Rate</span>
          <strong>{round(summary?.habitCompletionRate)}%</strong>
        </div>
        <div className="stat">
          <Activity size={20} style={{ color: 'var(--primary)', backgroundColor: 'rgba(59, 130, 246, 0.1)' }} />
          <span>Avg Productivity</span>
          <strong>{round(summary?.averageProductivityScore)}</strong>
        </div>
        <div className="stat">
          <BookOpenCheck size={20} style={{ color: 'var(--success)', backgroundColor: 'rgba(16, 185, 129, 0.1)' }} />
          <span>Latest Weekly</span>
          <strong>{summary?.latestSelfAssessmentScore ?? 0} <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 'normal' }}>/50</span></strong>
        </div>
      </div>

      {/* Quick Checklist / Notifications */}
      <div className="two-column" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <section className="panel">
          <h2><Sparkles size={18} style={{ color: 'var(--primary)' }} /> Focus Recommendations</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {summary?.activeGoals === 0 ? (
              <div style={{ display: 'flex', gap: 10, padding: 12, borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                <AlertCircle size={20} style={{ color: 'var(--warning)', flexShrink: 0 }} />
                <div>
                  <strong style={{ display: 'block', fontSize: 14 }}>No Active Goals Set</strong>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Setting concrete milestones helps establish habit structures. <Link to="/goals">Create one now.</Link></span>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10, padding: 12, borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                <Check size={20} style={{ color: 'var(--success)', flexShrink: 0 }} />
                <div>
                  <strong style={{ display: 'block', fontSize: 14 }}>Goal Path Active</strong>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>You have {summary?.activeGoals} active goals. Break them down in the <Link to="/goals">Goals Planner</Link>.</span>
                </div>
              </div>
            )}
            
            {summary?.habitCompletionRate < 50 ? (
              <div style={{ display: 'flex', gap: 10, padding: 12, borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                <Flame size={20} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                <div>
                  <strong style={{ display: 'block', fontSize: 14 }}>Low Habit Consistency</strong>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Consistency builds progress. Try to log and complete daily habits on the <Link to="/habits">Habits page</Link>.</span>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10, padding: 12, borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                <Flame size={20} style={{ color: 'var(--success)', flexShrink: 0 }} />
                <div>
                  <strong style={{ display: 'block', fontSize: 14 }}>Habit Streak Health Excellent</strong>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Keep maintaining your streaks! View consistency grids on <Link to="/habits">Habits</Link>.</span>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="panel">
          <h2><AlertCircle size={18} style={{ color: 'var(--info)' }} /> Quick Navigation</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Link to="/insights" className="ghost" style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', borderRadius: 'var(--radius-md)' }}>
              <Lightbulb size={24} style={{ color: 'var(--warning)' }} />
              <strong>Insights</strong>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>Check suggestions</span>
            </Link>
            <Link to="/profile" className="ghost" style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', borderRadius: 'var(--radius-md)' }}>
              <User size={24} style={{ color: 'var(--primary)' }} />
              <strong>My Profile</strong>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>Baseline preferences</span>
            </Link>
          </div>
        </section>
      </div>

      {/* Analytics Charts Grid */}
      <div className="chart-grid">
        <section className="panel chart-card" style={{ paddingBottom: 8 }}>
          <h2><Goal size={18} style={{ color: 'var(--primary)' }} /> Goal Progress</h2>
          <div style={{ height: 260 }}>
            {goals.length === 0 ? (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                No goals to display. Create a goal to see progress tracking.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={goals} margin={{ left: -10, right: 10, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="title" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-main)',
                    }}
                  />
                  <Bar dataKey="progressPercentage" fill="var(--primary)" radius={[4, 4, 0, 0]}>
                    {goals.map((_, index) => (
                      <Cell key={index} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="panel chart-card" style={{ paddingBottom: 8 }}>
          <h2><Activity size={18} style={{ color: 'var(--success)' }} /> Productivity & Energy</h2>
          <div style={{ height: 260 }}>
            {productivity.length === 0 ? (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                No productivity history found. Log daily reflections to start trends.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={productivity} margin={{ left: -15, right: 10, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="logDate" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-main)',
                    }}
                  />
                  <Line type="monotone" dataKey="productivityLevel" stroke="var(--success)" strokeWidth={2.5} activeDot={{ r: 6 }} name="Productivity" />
                  <Line type="monotone" dataKey="energyLevel" stroke="var(--warning)" strokeWidth={2.5} name="Energy" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="panel chart-card" style={{ paddingBottom: 8 }}>
          <h2><CalendarCheck size={18} style={{ color: 'var(--warning)' }} /> Habit Completion</h2>
          <div style={{ height: 260 }}>
            {habits.length === 0 ? (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                No habits found. Create a habit to start logging.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={habits}
                    dataKey="completionPercentage"
                    nameKey="title"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {habits.map((_, index) => (
                      <Cell key={index} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-main)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="panel chart-card" style={{ paddingBottom: 8 }}>
          <h2><BookOpenCheck size={18} style={{ color: 'var(--success)' }} /> Self-Assessment Trend</h2>
          <div style={{ height: 260 }}>
            {assessments.length === 0 ? (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                No assessments. Take a weekly self-assessment to view trends.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={assessments} margin={{ left: -15, right: 10, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="weekStartDate" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <YAxis domain={[0, 50]} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-main)',
                    }}
                  />
                  <Line type="monotone" dataKey="totalScore" stroke="var(--primary)" strokeWidth={2.5} name="Total Score" activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
