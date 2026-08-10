import React, { useEffect, useState } from 'react'
import {
  Lightbulb,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sparkles,
  BookmarkCheck,
  Bookmark
} from 'lucide-react'
import { api, getErrorMessage } from '../api'
import { useToast } from '../components/Toast'

export default function Insights() {
  const { showToast } = useToast()
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [severityFilter, setSeverityFilter] = useState('ALL')

  useEffect(() => {
    loadInsights()
  }, [])

  const loadInsights = async () => {
    try {
      const { data } = await api.get('/insights')
      setInsights(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  // GENERATE INSIGHTS
  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const { data } = await api.post('/insights/generate')
      setInsights(data)
      showToast('Insights generated successfully!', 'success')
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setGenerating(false)
    }
  }

  // MARK AS READ
  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/insights/${id}/read`)
      showToast('Insight marked as read', 'success')
      await loadInsights()
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    }
  }

  // DELETE INSIGHT
  const handleDelete = async (id) => {
    try {
      await api.delete(`/insights/${id}`)
      showToast('Insight deleted', 'success')
      await loadInsights()
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    }
  }

  // Count unread insights
  const unreadCount = insights.filter(i => !i.isRead).length
  const totalCount = insights.length
  
  // Filter list
  const filteredInsights = insights.filter(i => {
    if (severityFilter === 'ALL') return true
    return i.severity === severityFilter
  })

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'HIGH':
        return <AlertTriangle size={22} style={{ color: 'var(--danger)' }} />
      case 'MEDIUM':
        return <Info size={22} style={{ color: 'var(--warning)' }} />
      case 'LOW':
      default:
        return <CheckCircle2 size={22} style={{ color: 'var(--success)' }} />
    }
  }

  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'HIGH':
        return 'high_severity'
      case 'MEDIUM':
        return 'medium_severity'
      case 'LOW':
      default:
        return 'low_severity'
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <span>Behavioral Analytics</span>
          <h1>Behavioral Insights</h1>
        </div>
        <button className="primary" onClick={handleGenerate} disabled={generating}>
          <RefreshCw size={16} className={generating ? 'animate-spin' : ''} />
          {generating ? 'Analyzing...' : 'Generate Insights'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {/* Overview Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="stat">
          <Lightbulb size={20} />
          <span>Total Insights</span>
          <strong>{totalCount}</strong>
        </div>
        <div className="stat">
          <Bookmark size={20} style={{ color: 'var(--warning)', backgroundColor: 'rgba(245, 158, 11, 0.1)' }} />
          <span>Unread Recommendations</span>
          <strong>{unreadCount}</strong>
        </div>
        <div className="stat">
          <Sparkles size={20} style={{ color: 'var(--success)', backgroundColor: 'rgba(16, 185, 129, 0.1)' }} />
          <span>Behavior Health Status</span>
          <strong>{unreadCount > 3 ? 'Needs Review' : 'Healthy'}</strong>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="panel" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div className="filters-bar" style={{ margin: 0 }}>
            <button
              className={`filter-tab ${severityFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setSeverityFilter('ALL')}
            >
              All Severities
            </button>
            <button
              className={`filter-tab ${severityFilter === 'HIGH' ? 'active' : ''}`}
              onClick={() => setSeverityFilter('HIGH')}
            >
              High Attention
            </button>
            <button
              className={`filter-tab ${severityFilter === 'MEDIUM' ? 'active' : ''}`}
              onClick={() => setSeverityFilter('MEDIUM')}
            >
              Medium Warnings
            </button>
            <button
              className={`filter-tab ${severityFilter === 'LOW' ? 'active' : ''}`}
              onClick={() => setSeverityFilter('LOW')}
            >
              Low / Success Suggestions
            </button>
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Showing {filteredInsights.length} of {totalCount} insights
          </span>
        </div>
      </div>

      {/* Insights List */}
      <section className="panel">
        {loading ? (
          <p>Analyzing behavior records...</p>
        ) : filteredInsights.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)' }}>
            <Sparkles size={42} style={{ margin: '0 auto 12px', opacity: 0.5, color: 'var(--primary)' }} />
            <h3>All Clear!</h3>
            <p style={{ marginTop: 6, maxWidth: 400, margin: '6px auto 0' }}>
              No warnings or alerts. Click <strong>Generate Insights</strong> above to run checkups against your latest activity, habits, and weekly self-assessments.
            </p>
          </div>
        ) : (
          <div className="insight-list">
            {filteredInsights.map((item) => (
              <article
                key={item.id}
                className={`insight ${getSeverityClass(item.severity)}`}
                style={{ opacity: item.isRead ? 0.7 : 1 }}
              >
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ marginTop: 4 }}>
                    {getSeverityIcon(item.severity)}
                  </div>
                  <div>
                    <span className="badge" style={{ backgroundColor: 'rgba(0,0,0,0.04)', fontSize: 10, fontWeight: 'bold' }}>
                      {item.insightType}
                    </span>
                    <h3 style={{ marginTop: 8, fontSize: 16, color: 'var(--text-main)', textDecoration: item.isRead ? 'none' : 'none' }}>
                      {item.message}
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      Generated: {new Date(item.generatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="row-actions">
                  {!item.isRead && (
                    <button
                      className="ghost"
                      onClick={() => handleMarkAsRead(item.id)}
                      title="Mark as Read"
                      style={{ height: 36, padding: '0 12px' }}
                    >
                      <BookmarkCheck size={16} /> Mark Read
                    </button>
                  )}
                  <button
                    className="icon-button"
                    style={{ color: 'var(--danger-text)' }}
                    onClick={() => handleDelete(item.id)}
                    title="Delete suggestion"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
