import React, { useEffect, useState } from 'react'
import {
  Calendar,
  Check,
  Flame,
  Plus,
  RefreshCw,
  Trash2,
  X,
  Edit2
} from 'lucide-react'
import { api, getErrorMessage } from '../api'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'

const categories = ['ACADEMIC', 'CAREER', 'HEALTH', 'SKILL', 'PERSONAL', 'FINANCE']
const habitFrequencies = ['DAILY', 'WEEKLY']
const habitStatuses = ['ACTIVE', 'PAUSED', 'COMPLETED']

export default function Habits() {
  const { showToast } = useToast()
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Forms State
  const initialHabitForm = { title: '', description: '', category: 'PERSONAL', frequency: 'DAILY', status: 'ACTIVE' }
  const [createForm, setCreateForm] = useState(initialHabitForm)
  const [editHabitForm, setEditHabitForm] = useState(null)
  const [selectedHabit, setSelectedHabit] = useState(null)

  // Modals
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  // 7-day grid configuration
  const [daysList, setDaysList] = useState([])

  useEffect(() => {
    // Generate last 7 days list (including today)
    const list = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().slice(0, 10)
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' })
      const dayNum = d.getDate()
      list.push({ dateStr, dayName, dayNum })
    }
    setDaysList(list)
    loadHabits()
  }, [])

  const loadHabits = async () => {
    setLoading(true)
    setError('')
    try {
      const { data: habitsList } = await api.get('/habits')
      
      // Fetch logs for each habit
      const habitsWithLogs = await Promise.all(
        habitsList.map(async (habit) => {
          try {
            const { data: logs } = await api.get(`/habits/${habit.id}/logs`)
            return { ...habit, logs }
          } catch {
            return { ...habit, logs: [] }
          }
        })
      )
      setHabits(habitsWithLogs)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  // CREATE HABIT
  const handleCreate = async (e) => {
    e.preventDefault()
    if (!createForm.title.trim()) {
      showToast('Habit title is required', 'error')
      return
    }
    try {
      await api.post('/habits', createForm)
      setCreateForm(initialHabitForm)
      showToast('Habit created successfully!', 'success')
      await loadHabits()
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    }
  }

  // OPEN EDIT MODAL
  const openEdit = (habit) => {
    setSelectedHabit(habit)
    setEditHabitForm({
      title: habit.title,
      description: habit.description || '',
      category: habit.category,
      frequency: habit.frequency,
      status: habit.status,
    })
    setIsEditOpen(true)
  }

  // UPDATE HABIT
  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/habits/${selectedHabit.id}`, editHabitForm)
      setIsEditOpen(false)
      showToast('Habit updated successfully', 'success')
      await loadHabits()
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    }
  }

  // OPEN DELETE MODAL
  const openDelete = (habit) => {
    setSelectedHabit(habit)
    setIsDeleteOpen(true)
  }

  // DELETE HABIT
  const handleDelete = async () => {
    try {
      await api.delete(`/habits/${selectedHabit.id}`)
      setIsDeleteOpen(false)
      showToast('Habit deleted successfully', 'success')
      await loadHabits()
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    }
  }

  // TOGGLE HABIT DATE COMPLETION
  const toggleHabitDate = async (habitId, dateStr, currentStatus) => {
    let action = 'complete'
    if (currentStatus === 'complete') {
      action = 'missed'
    } else if (currentStatus === 'missed') {
      action = 'complete' // Cycle back
    }
    
    try {
      await api.patch(`/habits/${habitId}/logs/${dateStr}/${action}`)
      // Reload habits and logs
      const { data: updatedLogs } = await api.get(`/habits/${habitId}/logs`)
      
      // Update local state without full list reload for performance
      setHabits(prevHabits => prevHabits.map(h => {
        if (h.id === habitId) {
          // Re-calculate some metrics locally if possible, or just merge logs
          return { ...h, logs: updatedLogs }
        }
        return h
      }))
      
      showToast(`Logged as ${action === 'complete' ? 'completed' : 'missed'}`, 'success')
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    }
  }

  const getCellStatus = (logs, dateStr) => {
    const log = logs?.find(l => l.logDate === dateStr)
    if (!log) return 'empty'
    return log.completed ? 'complete' : 'missed'
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <span>Consistency Analytics</span>
          <h1>Habits Tracker</h1>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="two-column">
        {/* Create Habit panel */}
        <section className="panel">
          <h2>Create New Habit</h2>
          <form className="stack" onSubmit={handleCreate}>
            <div className="field">
              <span>Habit Title *</span>
              <input
                type="text"
                placeholder="e.g., Read for 30 minutes"
                value={createForm.title}
                onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <span>Description</span>
              <textarea
                placeholder="Why do you want to build this habit?"
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              />
            </div>
            <div className="field">
              <span>Category</span>
              <select
                value={createForm.category}
                onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <span>Frequency</span>
              <select
                value={createForm.frequency}
                onChange={(e) => setCreateForm({ ...createForm, frequency: e.target.value })}
              >
                {habitFrequencies.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="field">
              <span>Status</span>
              <select
                value={createForm.status}
                onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
              >
                {habitStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <button className="primary" type="submit"><Plus size={16} /> Add Habit</button>
          </form>
        </section>

        {/* Habit List with 7-day visual grids */}
        <section className="panel">
          <h2><Flame size={18} style={{ color: 'var(--warning)' }} /> Habit Consistency Grid</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 12 }}>
            Click on any day in the last 7 days to toggle completion. Green means completed, red means missed, and transparent/gray is unlogged.
          </p>

          {loading && habits.length === 0 ? (
            <p>Loading consistency data...</p>
          ) : habits.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
              <Calendar size={36} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
              <p>No habits created yet. Set up your first habit to track streaks.</p>
            </div>
          ) : (
            <div className="list">
              {habits.map((habit) => (
                <div key={habit.id} className="list-item" style={{ cursor: 'default' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start' }}>
                    <div>
                      <strong style={{ fontSize: 16 }}>{habit.title}</strong>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4 }}>
                        <span className={`badge ${habit.status.toLowerCase()}`}>{habit.status}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {habit.category} | {habit.frequency}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--warning)', fontWeight: 'bold' }}>
                        <Flame size={18} fill="var(--warning)" />
                        <span>{habit.currentStreak || 0}d streak</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 'bold' }}>
                        {Number(habit.completionPercentage || 0).toFixed(0)}% Done
                      </span>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="icon-button" onClick={() => openEdit(habit)} title="Edit Habit"><Edit2 size={14} /></button>
                        <button className="icon-button" style={{ color: 'var(--danger-text)' }} onClick={() => openDelete(habit)} title="Delete Habit"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>

                  {habit.description && (
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>{habit.description}</p>
                  )}

                  {/* 7-Day interactive Grid */}
                  <div className="habit-calendar-row">
                    {daysList.map((day) => {
                      const cellStatus = getCellStatus(habit.logs, day.dateStr)
                      return (
                        <div
                          key={day.dateStr}
                          className={`habit-day-cell ${cellStatus}`}
                          onClick={() => toggleHabitDate(habit.id, day.dateStr, cellStatus)}
                          title={`Toggle ${habit.title} for ${day.dateStr}`}
                        >
                          <span className="day-name">{day.dayName}</span>
                          <span style={{ fontSize: 13 }}>{day.dayNum}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* --- MODALS --- */}

      {/* Edit Habit Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Habit Settings"
      >
        {editHabitForm && (
          <form onSubmit={handleUpdate} className="stack">
            <div className="field">
              <span>Habit Title *</span>
              <input
                type="text"
                value={editHabitForm.title}
                onChange={(e) => setEditHabitForm({ ...editHabitForm, title: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <span>Description</span>
              <textarea
                value={editHabitForm.description}
                onChange={(e) => setEditHabitForm({ ...editHabitForm, description: e.target.value })}
              />
            </div>
            <div className="field">
              <span>Category</span>
              <select
                value={editHabitForm.category}
                onChange={(e) => setEditHabitForm({ ...editHabitForm, category: e.target.value })}
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <span>Frequency</span>
              <select
                value={editHabitForm.frequency}
                onChange={(e) => setEditHabitForm({ ...editHabitForm, frequency: e.target.value })}
              >
                {habitFrequencies.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="field">
              <span>Status</span>
              <select
                value={editHabitForm.status}
                onChange={(e) => setEditHabitForm({ ...editHabitForm, status: e.target.value })}
              >
                {habitStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="modal-footer" style={{ border: 0, padding: 0 }}>
              <button className="ghost" type="button" onClick={() => setIsEditOpen(false)}>Cancel</button>
              <button className="primary" type="submit">Save Changes</button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Habit Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Habit"
        footer={
          <>
            <button className="ghost" onClick={() => setIsDeleteOpen(false)}>Cancel</button>
            <button className="danger" onClick={handleDelete}>Delete Habit</button>
          </>
        }
      >
        <p>Are you sure you want to delete the habit <strong>"{selectedHabit?.title}"</strong>? This will permanently delete its completion history.</p>
      </Modal>
    </div>
  )
}
