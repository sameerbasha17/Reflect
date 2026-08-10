import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { Target } from 'lucide-react'
import { api, getErrorMessage } from './api'
import { ToastProvider } from './components/Toast'
import AppLayout from './layout/AppLayout'
import Dashboard from './pages/Dashboard'
import Goals from './pages/Goals'
import ActivityLogs from './pages/ActivityLogs'
import Habits from './pages/Habits'
import SelfAssessment from './pages/SelfAssessment'
import Insights from './pages/Insights'
import Profile from './pages/Profile'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('reflect_token')
    if (!token) {
      setLoading(false)
      return
    }
    api
      .get('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem('reflect_token'))
      .finally(() => setLoading(false))
  }, [])

  const auth = useMemo(() => ({ user, setUser }), [user])

  if (loading) return <div className="boot">Reflect is loading...</div>

  return (
    <ToastProvider>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login auth={auth} />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register auth={auth} />} />
        <Route element={user ? <AppLayout auth={auth} /> : <Navigate to="/login" />}>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/activity-logs" element={<ActivityLogs />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/self-assessment" element={<SelfAssessment />} />
          <Route path="/insights" element={<Insights />} />
        </Route>
        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
      </Routes>
    </ToastProvider>
  )
}

function Login({ auth }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    setError('')
    try {
      const { data } = await api.post('/auth/login', form)
      localStorage.setItem('reflect_token', data.token)
      auth.setUser(data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue tracking your progress.">
      <form onSubmit={submit} className="stack">
        <TextInput label="Email" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} />
        <TextInput label="Password" type="password" value={form.password} onChange={(password) => setForm({ ...form, password })} />
        {error && <p className="error">{error}</p>}
        <button className="primary" type="submit">Login</button>
      </form>
      <p className="auth-link">New to Reflect? <Link to="/register">Create an account</Link></p>
    </AuthShell>
  )
}

function Register({ auth }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    setError('')
    try {
      const { data } = await api.post('/auth/register', form)
      localStorage.setItem('reflect_token', data.token)
      auth.setUser(data.user)
      navigate('/profile')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <AuthShell title="Start reflecting" subtitle="Create your workspace for goals, habits, and self-assessment.">
      <form onSubmit={submit} className="stack">
        <TextInput label="Name" value={form.name} onChange={(name) => setForm({ ...form, name })} />
        <TextInput label="Email" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} />
        <TextInput label="Password" type="password" value={form.password} onChange={(password) => setForm({ ...form, password })} />
        {error && <p className="error">{error}</p>}
        <button className="primary" type="submit">Create account</button>
      </form>
      <p className="auth-link">Already registered? <Link to="/login">Login</Link></p>
    </AuthShell>
  )
}

function AuthShell({ title, subtitle, children }) {
  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="brand-mark"><Target size={30} /></div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {children}
      </section>
      <section className="auth-aside">
        <h2>Reflect</h2>
        <p>Track behavior, measure growth, and keep your future path visible.</p>
      </section>
    </main>
  )
}

function TextInput({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} required />
    </label>
  )
}

export default App
