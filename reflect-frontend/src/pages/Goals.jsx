import React, { useEffect, useState } from 'react'
import {
  Calendar,
  CheckCircle2,
  Circle,
  Edit2,
  Filter,
  Goal,
  Plus,
  Search,
  Trash2
} from 'lucide-react'
import { api, getErrorMessage } from '../api'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'

const categories = ['ACADEMIC', 'CAREER', 'HEALTH', 'SKILL', 'PERSONAL', 'FINANCE']
const priorities = ['LOW', 'MEDIUM', 'HIGH']
const goalStatuses = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'PAUSED']

export default function Goals() {
  const { showToast } = useToast()
  
  // Goals and Selection State
  const [goals, setGoals] = useState([])
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [milestones, setMilestones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')

  // Forms State
  const initialGoalForm = {
    title: '',
    description: '',
    category: 'CAREER',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    startDate: new Date().toISOString().slice(0, 10),
    targetDate: '',
  }
  const [createForm, setCreateForm] = useState(initialGoalForm)
  const [editGoalForm, setEditGoalForm] = useState(null)
  
  const initialMilestoneForm = { title: '', description: '', dueDate: '' }
  const [milestoneForm, setMilestoneForm] = useState(initialMilestoneForm)
  const [editMilestoneForm, setEditMilestoneForm] = useState(null)

  // Modal open states
  const [isEditGoalOpen, setIsEditGoalOpen] = useState(false)
  const [isDeleteGoalOpen, setIsDeleteGoalOpen] = useState(false)
  const [isEditMilestoneOpen, setIsEditMilestoneOpen] = useState(false)
  const [isDeleteMilestoneOpen, setIsDeleteMilestoneOpen] = useState(false)
  const [milestoneToDelete, setMilestoneToDelete] = useState(null)

  useEffect(() => {
    loadGoals()
  }, [])

  useEffect(() => {
    if (selectedGoal?.id) {
      loadMilestones(selectedGoal.id)
    } else {
      setMilestones([])
    }
  }, [selectedGoal?.id])

  const loadGoals = async (selectId = null) => {
    try {
      const { data } = await api.get('/goals')
      setGoals(data)
      if (data.length > 0) {
        if (selectId) {
          const match = data.find(g => g.id === selectId)
          setSelectedGoal(match || data[0])
        } else if (!selectedGoal) {
          setSelectedGoal(data[0])
        } else {
          // Keep current selection updated
          const match = data.find(g => g.id === selectedGoal.id)
          setSelectedGoal(match || data[0])
        }
      } else {
        setSelectedGoal(null)
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const loadMilestones = async (goalId) => {
    try {
      const { data } = await api.get(`/goals/${goalId}/milestones`)
      setMilestones(data)
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    }
  }

  // CREATE GOAL
  const handleCreateGoal = async (e) => {
    e.preventDefault()
    if (!createForm.title.trim()) {
      showToast('Goal title is required', 'error')
      return
    }
    try {
      const { data } = await api.post('/goals', createForm)
      setCreateForm(initialGoalForm)
      showToast('Goal created successfully!', 'success')
      await loadGoals(data.id)
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    }
  }

  // EDIT GOAL
  const openEditGoal = () => {
    if (!selectedGoal) return
    setEditGoalForm({
      title: selectedGoal.title,
      description: selectedGoal.description || '',
      category: selectedGoal.category,
      priority: selectedGoal.priority,
      status: selectedGoal.status,
      startDate: selectedGoal.startDate || '',
      targetDate: selectedGoal.targetDate || '',
    })
    setIsEditGoalOpen(true)
  }

  const handleUpdateGoal = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.put(`/goals/${selectedGoal.id}`, editGoalForm)
      setIsEditGoalOpen(false)
      showToast('Goal updated successfully!', 'success')
      await loadGoals(data.id)
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    }
  }

  // DELETE GOAL
  const handleDeleteGoal = async () => {
    try {
      await api.delete(`/goals/${selectedGoal.id}`)
      setIsDeleteGoalOpen(false)
      showToast('Goal deleted successfully', 'success')
      setSelectedGoal(null)
      await loadGoals()
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    }
  }

  // CREATE MILESTONE
  const handleAddMilestone = async (e) => {
    e.preventDefault()
    if (!milestoneForm.title.trim()) {
      showToast('Milestone title is required', 'error')
      return
    }
    try {
      await api.post(`/goals/${selectedGoal.id}/milestones`, milestoneForm)
      setMilestoneForm(initialMilestoneForm)
      showToast('Milestone added!', 'success')
      await loadMilestones(selectedGoal.id)
      await loadGoals(selectedGoal.id)
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    }
  }

  // TOGGLE MILESTONE STATUS
  const handleToggleMilestone = async (m) => {
    const action = m.status === 'COMPLETED' ? 'pending' : 'complete'
    try {
      await api.patch(`/goals/${selectedGoal.id}/milestones/${m.id}/${action}`)
      showToast(m.status === 'COMPLETED' ? 'Milestone set to pending' : 'Milestone completed!', 'success')
      await loadMilestones(selectedGoal.id)
      await loadGoals(selectedGoal.id)
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    }
  }

  // EDIT MILESTONE
  const openEditMilestone = (m) => {
    setEditMilestoneForm({
      id: m.id,
      title: m.title,
      description: m.description || '',
      dueDate: m.dueDate || '',
    })
    setIsEditMilestoneOpen(true)
  }

  const handleUpdateMilestone = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/goals/${selectedGoal.id}/milestones/${editMilestoneForm.id}`, {
        title: editMilestoneForm.title,
        description: editMilestoneForm.description,
        dueDate: editMilestoneForm.dueDate,
      })
      setIsEditMilestoneOpen(false)
      showToast('Milestone updated!', 'success')
      await loadMilestones(selectedGoal.id)
      await loadGoals(selectedGoal.id)
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    }
  }

  // DELETE MILESTONE
  const openDeleteMilestone = (m) => {
    setMilestoneToDelete(m)
    setIsDeleteMilestoneOpen(true)
  }

  const handleDeleteMilestone = async () => {
    if (!milestoneToDelete) return
    try {
      await api.delete(`/goals/${selectedGoal.id}/milestones/${milestoneToDelete.id}`)
      setIsDeleteMilestoneOpen(false)
      setMilestoneToDelete(null)
      showToast('Milestone deleted', 'success')
      await loadMilestones(selectedGoal.id)
      await loadGoals(selectedGoal.id)
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    }
  }

  // Filter & Search computation
  const filteredGoals = goals.filter((g) => {
    const matchesSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'ALL' || g.category === categoryFilter
    const matchesPriority = priorityFilter === 'ALL' || g.priority === priorityFilter
    return matchesSearch && matchesCategory && matchesPriority
  })

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <span>Strategic Alignment</span>
          <h1>Goals & Milestones</h1>
        </div>
      </div>

      <div className="two-column">
        {/* Left Column: List and Filters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Search Panel */}
          <div className="panel" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(0,0,0,0.02)', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <Search size={18} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search goals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: 0, padding: 0, background: 'transparent' }}
              />
            </div>
            
            {/* Category Filter */}
            <div style={{ marginTop: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>CATEGORY</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{ marginTop: 4 }}
              >
                <option value="ALL">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Priority Filter */}
            <div style={{ marginTop: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>PRIORITY</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                style={{ marginTop: 4 }}
              >
                <option value="ALL">All Priorities</option>
                {priorities.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Goal List Panel */}
          <div className="panel" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            <h2><Goal size={18} /> Goal List</h2>
            {loading ? (
              <p>Loading goals...</p>
            ) : filteredGoals.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No goals match criteria.</p>
            ) : (
              <div className="list">
                {filteredGoals.map((goal) => (
                  <button
                    className={`list-item ${selectedGoal?.id === goal.id ? 'selected' : ''}`}
                    key={goal.id}
                    onClick={() => setSelectedGoal(goal)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <strong style={{ fontSize: 15 }}>{goal.title}</strong>
                      <span className={`badge ${goal.priority.toLowerCase()}`}>{goal.priority}</span>
                    </div>
                    <span style={{ display: 'block', fontSize: 12, marginTop: 4 }}>
                      Category: {goal.category} | Status: {goal.status}
                    </span>
                    <div className="progress-container" style={{ marginTop: 8 }}>
                      <div className="progress">
                        <div className="progress-bar" style={{ width: `${goal.progressPercentage || 0}%` }}></div>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 'bold' }}>{goal.progressPercentage.toFixed(0)}%</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Goal Detail view & Create Goal */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {selectedGoal ? (
            /* Selected Goal Details panel */
            <div className="panel" style={{ borderLeft: '5px solid var(--primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <h2>{selectedGoal.title}</h2>
                    <span className={`badge ${selectedGoal.status.toLowerCase()}`}>{selectedGoal.status}</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>{selectedGoal.description || 'No description provided.'}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="icon-button" onClick={openEditGoal} title="Edit Goal"><Edit2 size={16} /></button>
                  <button className="icon-button" style={{ color: 'var(--danger-text)' }} onClick={() => setIsDeleteGoalOpen(true)} title="Delete Goal"><Trash2 size={16} /></button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginTop: 12, padding: 12, background: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 'bold', color: 'var(--text-muted)', display: 'block' }}>CATEGORY</span>
                  <strong>{selectedGoal.category}</strong>
                </div>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 'bold', color: 'var(--text-muted)', display: 'block' }}>PRIORITY</span>
                  <strong>{selectedGoal.priority}</strong>
                </div>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 'bold', color: 'var(--text-muted)', display: 'block' }}>START DATE</span>
                  <strong>{selectedGoal.startDate || 'N/A'}</strong>
                </div>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 'bold', color: 'var(--text-muted)', display: 'block' }}>TARGET DATE</span>
                  <strong>{selectedGoal.targetDate || 'N/A'}</strong>
                </div>
              </div>

              {/* Milestones Header */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16, marginTop: 12 }}>
                <h3>Milestones Tracking</h3>
                
                {/* Add Milestone Form */}
                <form className="inline-form" onSubmit={handleAddMilestone} style={{ marginTop: 12 }}>
                  <div className="field">
                    <input
                      type="text"
                      placeholder="Add milestone title..."
                      value={milestoneForm.title}
                      onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <input
                      type="date"
                      value={milestoneForm.dueDate}
                      onChange={(e) => setMilestoneForm({ ...milestoneForm, dueDate: e.target.value })}
                    />
                  </div>
                  <button className="primary" type="submit"><Plus size={16} /> Add</button>
                </form>

                {/* Milestones List */}
                <div className="table-list" style={{ marginTop: 14 }}>
                  {milestones.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No milestones added to this goal yet.</p>
                  ) : (
                    milestones.map((m) => (
                      <div className="row" key={m.id} style={{ opacity: m.status === 'COMPLETED' ? 0.75 : 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <button
                            type="button"
                            onClick={() => handleToggleMilestone(m)}
                            style={{ background: 'none', border: 0, padding: 0, color: m.status === 'COMPLETED' ? 'var(--success)' : 'var(--text-muted)' }}
                            title={m.status === 'COMPLETED' ? 'Mark as Pending' : 'Mark as Complete'}
                          >
                            {m.status === 'COMPLETED' ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                          </button>
                          <div>
                            <strong style={{ textDecoration: m.status === 'COMPLETED' ? 'line-through' : 'none' }}>{m.title}</strong>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, marginTop: 2 }}>
                              <Calendar size={12} /> Due: {m.dueDate || 'No due date'}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="icon-button" onClick={() => openEditMilestone(m)} title="Edit Milestone"><Edit2 size={14} /></button>
                          <button className="icon-button" style={{ color: 'var(--danger-text)' }} onClick={() => openDeleteMilestone(m)} title="Delete Milestone"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="panel" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <Goal size={48} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <p>Select a goal from the list to view milestones, edit details, and track progress.</p>
            </div>
          )}

          {/* Create Goal Form Panel */}
          <div className="panel">
            <h2>Create New Goal</h2>
            <form onSubmit={handleCreateGoal} className="form-grid">
              <div className="field span-2">
                <span>Goal Title *</span>
                <input
                  type="text"
                  placeholder="e.g., Earn AWS Cloud Practitioner Certification"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                />
              </div>
              <div className="field span-2">
                <span>Description</span>
                <textarea
                  placeholder="Summarize what success looks like..."
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
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="field">
                <span>Priority</span>
                <select
                  value={createForm.priority}
                  onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                >
                  {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="field">
                <span>Start Date</span>
                <input
                  type="date"
                  value={createForm.startDate}
                  onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                />
              </div>
              <div className="field">
                <span>Target Date</span>
                <input
                  type="date"
                  value={createForm.targetDate}
                  onChange={(e) => setCreateForm({ ...createForm, targetDate: e.target.value })}
                />
              </div>
              <button className="primary span-2" type="submit"><Plus size={16} /> Create Goal</button>
            </form>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Edit Goal Modal */}
      <Modal
        isOpen={isEditGoalOpen}
        onClose={() => setIsEditGoalOpen(false)}
        title="Edit Goal Details"
      >
        {editGoalForm && (
          <form onSubmit={handleUpdateGoal} className="form-grid">
            <div className="field span-2">
              <span>Goal Title *</span>
              <input
                type="text"
                value={editGoalForm.title}
                onChange={(e) => setEditGoalForm({ ...editGoalForm, title: e.target.value })}
                required
              />
            </div>
            <div className="field span-2">
              <span>Description</span>
              <textarea
                value={editGoalForm.description}
                onChange={(e) => setEditGoalForm({ ...editGoalForm, description: e.target.value })}
              />
            </div>
            <div className="field">
              <span>Category</span>
              <select
                value={editGoalForm.category}
                onChange={(e) => setEditGoalForm({ ...editGoalForm, category: e.target.value })}
              >
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <span>Priority</span>
              <select
                value={editGoalForm.priority}
                onChange={(e) => setEditGoalForm({ ...editGoalForm, priority: e.target.value })}
              >
                {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="field">
              <span>Status</span>
              <select
                value={editGoalForm.status}
                onChange={(e) => setEditGoalForm({ ...editGoalForm, status: e.target.value })}
              >
                {goalStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="field">
              <span>Start Date</span>
              <input
                type="date"
                value={editGoalForm.startDate}
                onChange={(e) => setEditGoalForm({ ...editGoalForm, startDate: e.target.value })}
              />
            </div>
            <div className="field span-2">
              <span>Target Date</span>
              <input
                type="date"
                value={editGoalForm.targetDate}
                onChange={(e) => setEditGoalForm({ ...editGoalForm, targetDate: e.target.value })}
              />
            </div>
            <div className="modal-footer span-2" style={{ border: 0, padding: 0 }}>
              <button className="ghost" type="button" onClick={() => setIsEditGoalOpen(false)}>Cancel</button>
              <button className="primary" type="submit">Save Changes</button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Goal Confirmation Modal */}
      <Modal
        isOpen={isDeleteGoalOpen}
        onClose={() => setIsDeleteGoalOpen(false)}
        title="Confirm Goal Deletion"
        footer={
          <>
            <button className="ghost" onClick={() => setIsDeleteGoalOpen(false)}>Cancel</button>
            <button className="danger" onClick={handleDeleteGoal}>Delete Goal</button>
          </>
        }
      >
        <p>Are you sure you want to delete the goal <strong>"{selectedGoal?.title}"</strong>? This will permanently delete all associated milestones.</p>
      </Modal>

      {/* Edit Milestone Modal */}
      <Modal
        isOpen={isEditMilestoneOpen}
        onClose={() => setIsEditMilestoneOpen(false)}
        title="Edit Milestone"
      >
        {editMilestoneForm && (
          <form onSubmit={handleUpdateMilestone} className="stack">
            <div className="field">
              <span>Milestone Title *</span>
              <input
                type="text"
                value={editMilestoneForm.title}
                onChange={(e) => setEditMilestoneForm({ ...editMilestoneForm, title: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <span>Due Date</span>
              <input
                type="date"
                value={editMilestoneForm.dueDate}
                onChange={(e) => setEditMilestoneForm({ ...editMilestoneForm, dueDate: e.target.value })}
              />
            </div>
            <div className="modal-footer" style={{ border: 0, padding: 0 }}>
              <button className="ghost" type="button" onClick={() => setIsEditMilestoneOpen(false)}>Cancel</button>
              <button className="primary" type="submit">Save Milestone</button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Milestone Confirmation Modal */}
      <Modal
        isOpen={isDeleteMilestoneOpen}
        onClose={() => setIsDeleteMilestoneOpen(false)}
        title="Confirm Milestone Deletion"
        footer={
          <>
            <button className="ghost" onClick={() => setIsDeleteMilestoneOpen(false)}>Cancel</button>
            <button className="danger" onClick={handleDeleteMilestone}>Delete</button>
          </>
        }
      >
        <p>Are you sure you want to delete the milestone <strong>"{milestoneToDelete?.title}"</strong>?</p>
      </Modal>
    </div>
  )
}
