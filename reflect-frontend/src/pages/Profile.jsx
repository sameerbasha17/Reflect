import React, { useEffect, useState } from 'react'
import { Save, User, Award, Focus, Compass, Sparkles, BookOpen } from 'lucide-react'
import { api, getErrorMessage } from '../api'
import { useToast } from '../components/Toast'

export default function Profile() {
  const { showToast } = useToast()
  const [form, setForm] = useState({ age: '', gender: '', focusAreas: '', baselineScore: '', bio: '' })
  const [exists, setExists] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [assessmentAvg, setAssessmentAvg] = useState(null)

  // Fetch profile and optionally assessments to calculate average score
  useEffect(() => {
    Promise.all([
      api.get('/profile').then(({ data }) => {
        setExists(true)
        setForm({
          age: data.age ?? '',
          gender: data.gender ?? '',
          focusAreas: data.focusAreas ?? '',
          baselineScore: data.baselineScore ?? '',
          bio: data.bio ?? '',
        })
      }).catch(() => setExists(false)),
      
      api.get('/self-assessments').then(({ data }) => {
        if (data.length > 0) {
          const sum = data.reduce((acc, item) => acc + item.totalScore, 0)
          setAssessmentAvg(sum / data.length)
        }
      }).catch(() => {})
    ]).finally(() => setLoading(false))
  }, [])

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      ...form,
      age: form.age === '' ? null : Number(form.age),
      baselineScore: form.baselineScore === '' ? null : Number(form.baselineScore)
    }

    try {
      const { data } = exists ? await api.put('/profile', payload) : await api.post('/profile', payload)
      setExists(true)
      setForm({
        age: data.age ?? '',
        gender: data.gender ?? '',
        focusAreas: data.focusAreas ?? '',
        baselineScore: data.baselineScore ?? '',
        bio: data.bio ?? '',
      })
      showToast('Profile saved successfully!', 'success')
    } catch (err) {
      setError(getErrorMessage(err))
      showToast(getErrorMessage(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  // Parse focus areas comma-separated list into tags
  const focusAreasTags = form.focusAreas
    ? form.focusAreas.split(',').map((tag) => tag.trim()).filter(Boolean)
    : []

  if (loading) {
    return <div className="boot">Loading profile details...</div>
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <span>Personal Baseline</span>
          <h1>My Profile</h1>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="two-column" style={{ gridTemplateColumns: '360px 1fr' }}>
        {/* Left Column: Visual Profile Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <section className="panel" style={{ textAlign: 'center', alignItems: 'center' }}>
            <div style={{
              width: 90,
              height: 90,
              borderRadius: '50%',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              marginBottom: 16,
              border: '2px dashed var(--primary)'
            }}>
              <User size={48} />
            </div>

            <h2 style={{ fontSize: 20, marginBottom: 4 }}>Workspace Profile</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Compass size={14} /> Age: {form.age || 'Not set'} | Gender: {form.gender || 'Not set'}
            </p>

            <div style={{ borderTop: '1px solid var(--border-color)', width: '100%', marginTop: 16, paddingTop: 16, textAlign: 'left' }}>
              <span style={{ fontSize: 11, fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>BIO</span>
              <p style={{ fontSize: 14, marginTop: 6, fontStyle: form.bio ? 'normal' : 'italic', color: form.bio ? 'var(--text-main)' : 'var(--text-muted)' }}>
                {form.bio || 'Provide a brief bio description below.'}
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', width: '100%', marginTop: 16, paddingTop: 16, textAlign: 'left' }}>
              <span style={{ fontSize: 11, fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', marginBottom: 8 }}>FOCUS AREAS</span>
              {focusAreasTags.length === 0 ? (
                <span style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>No focus areas added yet.</span>
              ) : (
                <div className="pill-list">
                  {focusAreasTags.map((tag, idx) => (
                    <span key={idx} className="pill">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Growth / Progress comparison card */}
          {form.baselineScore && (
            <section className="panel" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
              <h2><Award size={18} style={{ color: 'var(--success)' }} /> Personal Growth</h2>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                <div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Baseline Score</span>
                  <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>{form.baselineScore}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Current Weekly Avg</span>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--success)', marginTop: 4 }}>
                    {assessmentAvg ? assessmentAvg.toFixed(1) : 'N/A'}
                  </div>
                </div>
              </div>
              {assessmentAvg && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 13, fontWeight: 'bold', color: assessmentAvg >= form.baselineScore ? 'var(--success-text)' : 'var(--text-muted)' }}>
                  <Sparkles size={16} />
                  <span>
                    {assessmentAvg >= form.baselineScore 
                      ? `Improving by +${(assessmentAvg - form.baselineScore).toFixed(1)} points!`
                      : 'Keep logging self-assessments to improve your score.'
                    }
                  </span>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Right Column: Profile Edit Form */}
        <section className="panel">
          <h2>Edit Profile Details</h2>
          <form className="form-grid" onSubmit={submit}>
            <div className="field">
              <span>Age</span>
              <input
                type="number"
                placeholder="e.g., 25"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
              />
            </div>
            <div className="field">
              <span>Gender</span>
              <input
                type="text"
                placeholder="e.g., Male, Female, Other"
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              />
            </div>
            <div className="field">
              <span>Baseline Score (Initial assessment rating, 1-50)</span>
              <input
                type="number"
                placeholder="e.g., 20"
                min="1"
                max="50"
                value={form.baselineScore}
                onChange={(e) => setForm({ ...form, baselineScore: e.target.value })}
              />
            </div>
            <div className="field">
              <span>Focus Areas (Comma-separated)</span>
              <input
                type="text"
                placeholder="e.g., Academic, Career, Health, Gym"
                value={form.focusAreas}
                onChange={(e) => setForm({ ...form, focusAreas: e.target.value })}
              />
            </div>
            <div className="field span-2">
              <span>Bio description</span>
              <textarea
                placeholder="Tell us about yourself, your motivators, and why you are tracking your goals..."
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </div>
            <button className="primary span-2" type="submit" disabled={saving}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
