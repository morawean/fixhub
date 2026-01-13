import React, { useEffect, useState } from 'react'
import { getRoutes, createRoute, updateRoute, deleteRoute } from '../api'

interface Route {
  from: string
  to: string
  conditionTag?: number
  conditionValue?: string
}

export default function RoutesList() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<Route>({
    from: '',
    to: '',
    conditionTag: undefined,
    conditionValue: ''
  })
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRoutes()
  }, [])

  async function fetchRoutes() {
    setLoading(true)
    try {
      const data = await getRoutes()
      setRoutes(data)
    } catch (e) {
      setError('Failed to load routes')
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setFormData({ from: '', to: '', conditionTag: undefined, conditionValue: '' })
    setEditingIndex(null)
    setError('')
  }

  function openEdit(index: number) {
    setEditingIndex(index)
    setFormData({ ...routes[index] })
    setShowForm(true)
  }

  function openCreate() {
    resetForm()
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!formData.from.trim() || !formData.to.trim()) {
      setError('From and To fields are required')
      return
    }

    try {
      if (editingIndex !== null) {
        await updateRoute(editingIndex, formData)
      } else {
        await createRoute(formData)
      }
      await fetchRoutes()
      setShowForm(false)
      resetForm()
    } catch (e: any) {
      setError(e.message || 'Operation failed')
    }
  }

  async function handleDelete(index: number) {
    if (!window.confirm('Delete this route?')) return
    try {
      await deleteRoute(index)
      await fetchRoutes()
    } catch (e: any) {
      setError(e.message || 'Delete failed')
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Routes ({routes.length})</h2>
        <button
          onClick={openCreate}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#45a049')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#4CAF50')}
        >
          + Add Route
        </button>
      </div>

      {loading && <p>Loading routes...</p>}
      {error && <div style={{ color: '#c62828', backgroundColor: '#ffebee', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} style={{
          backgroundColor: '#f9f9f9',
          padding: '20px',
          borderRadius: '6px',
          marginBottom: '20px',
          border: '1px solid #ddd'
        }}>
          <h3 style={{ marginTop: 0 }}>{editingIndex !== null ? 'Edit Route' : 'New Route'}</h3>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '5px' }}>From (Incoming)</label>
            <input
              type="text"
              value={formData.from}
              onChange={(e) => setFormData({ ...formData, from: e.target.value })}
              placeholder="e.g., CLIENT"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '5px' }}>To (Outgoing)</label>
            <input
              type="text"
              value={formData.to}
              onChange={(e) => setFormData({ ...formData, to: e.target.value })}
              placeholder="e.g., SERVER"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '5px' }}>Condition Tag (Optional)</label>
              <input
                type="number"
                value={formData.conditionTag || ''}
                onChange={(e) => setFormData({ ...formData, conditionTag: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="e.g., 35"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '5px' }}>Condition Value (Optional)</label>
              <input
                type="text"
                value={formData.conditionValue || ''}
                onChange={(e) => setFormData({ ...formData, conditionValue: e.target.value })}
                placeholder="e.g., D"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              style={{
                padding: '8px 16px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0b7dda')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#2196F3')}
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); resetForm() }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#555')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#666')}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div style={{
        border: '1px solid #ddd',
        borderRadius: '6px',
        overflow: 'hidden'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          backgroundColor: 'white'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>From</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>To</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Condition Tag</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Condition Value</th>
              <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {routes.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                  No routes configured
                </td>
              </tr>
            ) : (
              routes.map((route, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f9f9f9')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '12px' }}><strong>{route.from}</strong></td>
                  <td style={{ padding: '12px' }}><strong>{route.to}</strong></td>
                  <td style={{ padding: '12px', color: '#666' }}>{route.conditionTag || '-'}</td>
                  <td style={{ padding: '12px', color: '#666' }}>{route.conditionValue || '-'}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button
                      onClick={() => openEdit(idx)}
                      style={{
                        padding: '4px 12px',
                        backgroundColor: '#FF9800',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        marginRight: '8px',
                        fontSize: '12px'
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e68900')}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#FF9800')}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(idx)}
                      style={{
                        padding: '4px 12px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#da190b')}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#f44336')}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
