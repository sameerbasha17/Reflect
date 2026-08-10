import React, { useEffect, useState } from 'react'
import {
  BookOpenCheck,
  Calendar,
  Edit2,
  Plus,
  Trash2,
  Activity,
  Award,
  BookOpen,
  HelpCircle
} from 'lucide-react'
import { api, getErrorMessage } from '../api'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'

const scoreKeys = [
  { key: 'consistencyScore', label: 'Consistency', desc: 'How steady were your daily actions and habits?' },
  { key: 'disciplineScore', label: 'Discipline', desc: 'Did you resist distractions and follow through on plans?' },
  { key: 'productivityScore', label: 'Productivity', desc: 'How much quality work did you produce?' },
  { key: 'motivationScore', label: 'Motivation', desc: 'How driven and energetic did you feel this week?' },
  { key: 'goalClarityScore', label: 'Goal Clarity', desc: 'How well do your daily actions align with long-term goals?' }
]

export default function SelfAssessment() {
  const { showToast } = useToast()
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Form states
  const emptyForm = {
    assessmentDate: new Date().toISOString().slice(0, 10),
    weekStartDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // 6 days ago
    weekEndDate: new Date().toISOString().slice(0, 10),
    consistencyScore: 5,
    disciplineScore: 5,
    productivityScore: 5,
    motivationScore: 5,
    goalClarityScore: 5,
    notes: '',
  }
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  
  // Selected detail modal
  const [selectedAssessment, setSelectedAssessment] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Delete modal
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [assessmentToDelete, setAssessmentToDelete] = useState(null)

  useEffect(() => {
    loadAssessments()
  }, [])

  const loadAssessments = async () => {
    try {
      const { data } = await api.get('/self-assessments')
      setAssessments(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  // Calculate live total score
  const calculateTotal = (f) => {
    return (
      Number(f.consistencyScore) +
      Number(f.disciplineScore) +
      Number(f.productivityScore) +
      Number(f.motivationScore) +
      Number(f.goalClarityScore)
    )
  }

  // CREATE OR UPDATE ASSESSMENT
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...form,
        consistencyScore: Number(form.consistencyScore),
        disciplineScore: Number(form.disciplineScore),
        productivityScore: Number(form.productivityScore),
        motivationScore: Number(form.motivationScore),
        goalClarityScore: Number(form.goalClarityScore),
      }

      if (editingId) {
        await api.put(`/self-assessments/${editingId}`, payload)
        showToast('Self-assessment updated successfully!', 'success')
      } else {
        await api.post('/self-assessments', payload)
        showToast('Self-assessment saved successfully!', 'success')
      }

      resetForm()
      await loadAssessments()
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    }
  }

  // EDIT LOG
  const startEdit = (e, item) => {
    e.stopPropagation() // Prevent row click opening detail modal
    setEditingId(item.id)
    setForm({
      assessmentDate: item.assessmentDate,
      weekStartDate: item.weekStartDate,
      weekEndDate: item.weekEndDate,
      consistencyScore: item.consistencyScore,
      disciplineScore: item.disciplineScore,
      productivityScore: item.productivityScore,
      motivationScore: item.motivationScore,
      goalClarityScore: item.goalClarityScore,
      notes: item.notes || '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetForm = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  // DELETE OPEN
  const openDelete = (e, item) => {
    e.stopPropagation()
    setAssessmentToDelete(item)
    setIsDeleteOpen(true)
  }

  // DELETE SUBMIT
  const handleDelete = async () => {
    if (!assessmentToDelete) return
    try {
      await api.delete(`/self-assessments/${assessmentToDelete.id}`)
      setIsDeleteOpen(false)
      setAssessmentToDelete(null)
      showToast('Assessment deleted successfully', 'success')
      await loadAssessments()
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    }
  }

  // DETAIL OPEN
  const openDetail = (item) => {
    setSelectedAssessment(item)
    setIsDetailOpen(true)
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <span>Weekly Behavioral Growth</span>
          <h1>Self-Assessment</h1>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="two-column" style={{ gridTemplateColumns: '1.2fr 1fr' }}>
        {/* Weekly Form Panel */}
        <section className="panel" style={{ borderLeft: editingId ? '5px solid var(--warning)' : '5px solid var(--success)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2>{editingId ? 'Edit Self-Assessment' : 'Weekly Behavior Assessment'}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
                {editingId ? 'Updating scores for a previously submitted week.' : 'Submit a score for the week based on 5 metrics.'}
              </p>
            </div>
            {editingId && (
              <button className="ghost" type="button" onClick={resetForm}>Cancel Edit</button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="stack" style={{ marginTop: 12 }}>
            <div className="form-grid">
              <div className="field">
                <span>Assessment Date *</span>
                <input
                  type="date"
                  value={form.assessmentDate}
                  onChange={(e) => setForm({ ...form, assessmentDate: e.target.value })}
                  required
                />
              </div>
              <div className="field">
                <span>Week Start Date *</span>
                <input
                  type="date"
                  value={form.weekStartDate}
                  onChange={(e) => setForm({ ...form, weekStartDate: e.target.value })}
                  required
                />
              </div>
              <div className="field span-2">
                <span>Week End Date *</span>
                <input
                  type="date"
                  value={form.weekEndDate}
                  onChange={(e) => setForm({ ...form, weekEndDate: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Sliders for the 5 behavioral dimensions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, borderTop: '1px solid var(--border-color)', paddingTop: 16, marginTop: 8 }}>
              {scoreKeys.map(({ key, label, desc }) => (
                <div key={key} className="field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 'bold' }}>{label}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{desc}</span>
                  </div>
                  <div className="slider-container">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })}
                    />
                    <div className="slider-value" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                      {form[key]}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Live Score Display */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.02)', padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div>
                <strong style={{ fontSize: 16, display: 'block' }}>Calculated Total Score</strong>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sum of consistency, discipline, productivity, motivation, and clarity.</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--success)' }}>
                {calculateTotal(form)} <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 'bold' }}>/50</span>
              </div>
            </div>

            <div className="field">
              <span>Weekly takeaways & Reflections</span>
              <textarea
                placeholder="What went well? Where did things fall off? Focus areas for next week..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>

            <button className="primary" type="submit">
              {editingId ? 'Update Assessment' : 'Submit Assessment'}
            </button>
          </form>
        </section>

        {/* History List Panel */}
        <section className="panel">
          <h2>Weekly Submissions</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Click on a row to inspect metric breakdowns and notes.</p>
          {loading ? (
            <p>Loading weekly assessments...</p>
          ) : assessments.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No weekly assessments submitted yet.</p>
          ) : (
            <div className="list">
              {assessments.map((item) => (
                <div
                  key={item.id}
                  className="row"
                  onClick={() => openDetail(item)}
                  style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    <strong>Week: {item.weekStartDate} to {item.weekEndDate}</strong>
                    <span style={{ display: 'block', fontSize: 12, marginTop: 4, color: 'var(--text-muted)' }}>
                      Submitted on: {item.assessmentDate}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ fontSize: 16, fontWeight: 'bold', color: 'var(--success)' }}>
                      {item.totalScore} <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/50</span>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
                      <button className="icon-button" onClick={(e) => startEdit(e, item)} title="Edit Assessment"><Edit2 size={14} /></button>
                      <button className="icon-button" style={{ color: 'var(--danger-text)' }} onClick={(e) => openDelete(e, item)} title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* --- MODALS --- */}

      {/* Detail Breakdown Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Weekly Score Detail"
      >
        {selectedAssessment && (
          <div className="stack">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.02)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div>
                <strong>Week Range</strong>
                <span style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                  {selectedAssessment.weekStartDate} to {selectedAssessment.weekEndDate}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong>Total Score</strong>
                <span style={{ display: 'block', fontSize: 20, fontWeight: 900, color: 'var(--success)' }}>
                  {selectedAssessment.totalScore} / 50
                </span>
              </div>
            </div>

            {/* Score Breakdowns */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
              {scoreKeys.map(({ key, label }) => {
                const val = selectedAssessment[key]
                const percentage = (val / 10) * 100
                return (
                  <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span>{label}</span>
                      <strong>{val} / 10</strong>
                    </div>
                    <div className="progress">
                      <div className="progress-bar" style={{ width: `${percentage}%`, backgroundColor: 'var(--success)' }}></div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Notes */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 14, marginTop: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>WEEKLY REFLECTIONS</span>
              <p style={{ marginTop: 6, fontSize: 14, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                {selectedAssessment.notes || 'No notes logged for this week.'}
              </p>
            </div>

            <div className="modal-footer" style={{ border: 0, padding: 0, marginTop: 12 }}>
              <button className="primary" onClick={() => setIsDetailOpen(false)}>Done</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirm Assessment Deletion"
        footer={
          <>
            <button className="ghost" onClick={() => setIsDeleteOpen(false)}>Cancel</button>
            <button className="danger" onClick={handleDelete}>Delete</button>
          </>
        }
      >
        <p>Are you sure you want to delete the self-assessment submitted for the week <strong>{assessmentToDelete?.weekStartDate} to {assessmentToDelete?.weekEndDate}</strong>?</p>
      </Modal>
    </div>
  )
}
