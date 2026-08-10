import React, { useEffect, useState } from 'react'
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Edit2,
  Plus,
  Search,
  Trash2,
  Smile,
  Zap,
  Activity,
  Filter
} from 'lucide-react'
import { api, getErrorMessage } from '../api'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'

const moodsMap = [
  { value: 'VERY_LOW', label: 'Very Low', emoji: '😭' },
  { value: 'LOW', label: 'Low', emoji: '😕' },
  { value: 'NEUTRAL', label: 'Neutral', emoji: '🙂' },
  { value: 'GOOD', label: 'Good', emoji: '😊' },
  { value: 'EXCELLENT', label: 'Excellent', emoji: '🤩' },
]

export default function ActivityLogs() {
  const { showToast } = useToast()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Accordion open states
  const [expandedId, setExpandedId] = useState(null)

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [moodFilter, setMoodFilter] = useState('ALL')

  // Forms State
  const emptyForm = {
    logDate: new Date().toISOString().slice(0, 10),
    plannedTasks: '',
    completedTasks: '',
    mood: 'NEUTRAL',
    energyLevel: 5,
    productivityLevel: 5,
    distractions: '',
    reflectionNotes: '',
  }
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)

  // Delete Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [logToDelete, setLogToDelete] = useState(null)

  useEffect(() => {
    loadLogs()
  }, [])

  const loadLogs = async () => {
    try {
      const { data } = await api.get('/activity-logs')
      setLogs(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  // CREATE OR UPDATE LOG
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...form,
        energyLevel: Number(form.energyLevel),
        productivityLevel: Number(form.productivityLevel)
      }

      if (editingId) {
        await api.put(`/activity-logs/${editingId}`, payload)
        showToast('Activity log updated successfully!', 'success')
      } else {
        await api.post('/activity-logs', payload)
        showToast('Activity log saved successfully!', 'success')
      }
      
      resetForm()
      await loadLogs()
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    }
  }

  // START EDITING
  const startEdit = (log) => {
    setEditingId(log.id)
    setForm({
      logDate: log.logDate,
      plannedTasks: log.plannedTasks || '',
      completedTasks: log.completedTasks || '',
      mood: log.mood || 'NEUTRAL',
      energyLevel: log.energyLevel ?? 5,
      productivityLevel: log.productivityLevel ?? 5,
      distractions: log.distractions || '',
      reflectionNotes: log.reflectionNotes || '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetForm = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  // OPEN DELETE CONFIRM
  const openDelete = (log) => {
    setLogToDelete(log)
    setIsDeleteOpen(true)
  }

  // DELETE LOG
  const handleDelete = async () => {
    if (!logToDelete) return
    try {
      await api.delete(`/activity-logs/${logToDelete.id}`)
      setIsDeleteOpen(false)
      setLogToDelete(null)
      showToast('Activity log deleted successfully', 'success')
      await loadLogs()
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    }
  }

  const getMoodEmoji = (moodValue) => {
    return moodsMap.find(m => m.value === moodValue)?.emoji || '😐'
  }

  const getMoodLabel = (moodValue) => {
    return moodsMap.find(m => m.value === moodValue)?.label || moodValue
  }

  // FILTERED LOGS
  const filteredLogs = logs.filter((log) => {
    const textStr = `${log.plannedTasks} ${log.completedTasks} ${log.distractions} ${log.reflectionNotes} ${log.logDate}`.toLowerCase()
    const matchesSearch = textStr.includes(searchQuery.toLowerCase())
    const matchesMood = moodFilter === 'ALL' || log.mood === moodFilter
    return matchesSearch && matchesMood
  })

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <span>Behavioral Journaling</span>
          <h1>Daily Activity Logs</h1>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      {/* Logger Form Panel */}
      <section className="panel" style={{ borderLeft: editingId ? '5px solid var(--warning)' : '5px solid var(--primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>{editingId ? 'Update Reflection Log' : 'Create Reflection Log'}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
              {editingId ? 'Modify details for your existing reflection.' : 'Log your mood, productivity, tasks, and notes for the day.'}
            </p>
          </div>
          {editingId && (
            <button className="ghost" type="button" onClick={resetForm}>Cancel Edit</button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="form-grid" style={{ marginTop: 12 }}>
          <div className="field">
            <span>Date *</span>
            <input
              type="date"
              value={form.logDate}
              onChange={(e) => setForm({ ...form, logDate: e.target.value })}
              required
            />
          </div>

          <div className="field">
            <span>Mood Rating</span>
            <div className="emoji-grid">
              {moodsMap.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  className={`emoji-btn ${form.mood === m.value ? 'selected' : ''}`}
                  onClick={() => setForm({ ...form, mood: m.value })}
                >
                  <span className="emoji">{m.emoji}</span>
                  <span className="label">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <span>Energy Level (1 - 10)</span>
            <div className="slider-container">
              <input
                type="range"
                min="1"
                max="10"
                value={form.energyLevel}
                onChange={(e) => setForm({ ...form, energyLevel: Number(e.target.value) })}
              />
              <div className="slider-value">{form.energyLevel}</div>
            </div>
          </div>

          <div className="field">
            <span>Productivity Level (1 - 10)</span>
            <div className="slider-container">
              <input
                type="range"
                min="1"
                max="10"
                value={form.productivityLevel}
                onChange={(e) => setForm({ ...form, productivityLevel: Number(e.target.value) })}
              />
              <div className="slider-value">{form.productivityLevel}</div>
            </div>
          </div>

          <div className="field">
            <span>Planned Tasks</span>
            <textarea
              placeholder="What did you plan to work on today?"
              value={form.plannedTasks}
              onChange={(e) => setForm({ ...form, plannedTasks: e.target.value })}
            />
          </div>

          <div className="field">
            <span>Completed Tasks</span>
            <textarea
              placeholder="What did you actually accomplish?"
              value={form.completedTasks}
              onChange={(e) => setForm({ ...form, completedTasks: e.target.value })}
            />
          </div>

          <div className="field">
            <span>Distractions & Obstacles</span>
            <textarea
              placeholder="Any blockers, social media, meetings, or energy drains?"
              value={form.distractions}
              onChange={(e) => setForm({ ...form, distractions: e.target.value })}
            />
          </div>

          <div className="field">
            <span>Reflection Notes & Takeaways</span>
            <textarea
              placeholder="What did you learn today? What can be improved?"
              value={form.reflectionNotes}
              onChange={(e) => setForm({ ...form, reflectionNotes: e.target.value })}
            />
          </div>

          <button className="primary span-2" type="submit" style={{ marginTop: 8 }}>
            {editingId ? 'Update Log' : 'Save Log'}
          </button>
        </form>
      </section>

      {/* Filter and Search Bar */}
      <div className="panel" style={{ padding: 16, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(0,0,0,0.02)', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', flex: 1, minWidth: 260 }}>
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search tasks, notes, or dates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 0, padding: 0, background: 'transparent' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Filter size={16} style={{ color: 'var(--text-muted)' }} />
          <span>Filter by Mood:</span>
          <select
            value={moodFilter}
            onChange={(e) => setMoodFilter(e.target.value)}
            style={{ width: 'auto', padding: '6px 12px' }}
          >
            <option value="ALL">All Moods</option>
            {moodsMap.map(m => <option key={m.value} value={m.value}>{m.emoji} {m.label}</option>)}
          </select>
        </div>
      </div>

      {/* Historical Logs List */}
      <section className="panel">
        <h2>Logs History</h2>
        {loading ? (
          <p>Loading historical logs...</p>
        ) : filteredLogs.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No reflection logs match the criteria.</p>
        ) : (
          <div className="activity-list">
            {filteredLogs.map((log) => {
              const isExpanded = expandedId === log.id
              return (
                <article className={`activity-card ${isExpanded ? 'open' : ''}`} key={log.id}>
                  <button
                    className="activity-summary"
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 24 }}>{getMoodEmoji(log.mood)}</span>
                      <div>
                        <strong style={{ fontSize: 16 }}>{log.logDate}</strong>
                        <span style={{ fontSize: 13, display: 'flex', gap: 10, marginTop: 2 }}>
                          <span>Mood: {getMoodLabel(log.mood)}</span>
                          <span>|</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Zap size={13} style={{ color: 'var(--warning)' }} /> Energy: {log.energyLevel}/10</span>
                          <span>|</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Activity size={13} style={{ color: 'var(--primary)' }} /> Prod: {log.productivityLevel}/10</span>
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="badge">{isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="activity-details">
                      <div className="detail-box">
                        <span>Planned Tasks</span>
                        <p>{log.plannedTasks || 'No details entered.'}</p>
                      </div>
                      <div className="detail-box">
                        <span>Completed Tasks</span>
                        <p>{log.completedTasks || 'No details entered.'}</p>
                      </div>
                      <div className="detail-box">
                        <span>Distractions</span>
                        <p>{log.distractions || 'No details entered.'}</p>
                      </div>
                      <div className="detail-box">
                        <span>Reflection Notes</span>
                        <p>{log.reflectionNotes || 'No details entered.'}</p>
                      </div>
                      <div className="activity-details-full">
                        <button className="ghost" type="button" onClick={() => startEdit(log)}>
                          <Edit2 size={14} /> Edit Log
                        </button>
                        <button className="danger" type="button" onClick={() => openDelete(log)}>
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </section>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirm Log Deletion"
        footer={
          <>
            <button className="ghost" onClick={() => setIsDeleteOpen(false)}>Cancel</button>
            <button className="danger" onClick={handleDelete}>Delete Log</button>
          </>
        }
      >
        <p>Are you sure you want to delete your activity log for <strong>{logToDelete?.logDate}</strong>? This action cannot be undone.</p>
      </Modal>
    </div>
  )
}
