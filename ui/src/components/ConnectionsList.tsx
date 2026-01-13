import React, {useEffect, useState} from 'react'
import {getConnections, createConnection, updateConnection, deleteConnection} from '../api'
import ConnectionForm from './ConnectionForm'
import ConnectionItem from './ConnectionItem'

export default function ConnectionsList(){
  const [connections, setConnections] = useState<any[]>([])
  const [editing, setEditing] = useState<any|null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(()=>{ fetchList() }, [])

  async function fetchList(){
    setLoading(true)
    try {
      const c = await getConnections()
      setConnections(c || [])
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd(data:any){
    try {
      await createConnection(data)
      setShowForm(false)
      fetchList()
    } catch (err) {
      alert('Failed to create connection')
    }
  }

  async function handleUpdate(id:string, data:any){
    try {
      await updateConnection(id, data)
      setEditing(null)
      setShowForm(false)
      fetchList()
    } catch (err) {
      alert('Failed to update connection')
    }
  }

  async function handleDelete(id:string){
    if(!confirm('Delete connection?')) return
    try {
      await deleteConnection(id)
      fetchList()
    } catch (err) {
      alert('Failed to delete connection')
    }
  }

  return (
    <div style={{marginTop: 20}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 15}}>
        <h2 style={{margin: 0}}>Connections</h2>
        <button 
          onClick={()=>{ setEditing(null); setShowForm(true) }}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#45a049')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#4caf50')}
        >
          + Add Connection
        </button>
      </div>

      {showForm && (
        <div style={{marginBottom: 20, padding: 15, backgroundColor: '#f5f5f5', borderRadius: 8}}>
          <ConnectionForm
            initialData={editing}
            onCancel={()=>{ setShowForm(false); setEditing(null) }}
            onSubmit={(data:any)=> editing ? handleUpdate(editing.id, data) : handleAdd(data)}
          />
        </div>
      )}

      {loading ? (
        <div style={{textAlign: 'center', color: '#999', padding: 20}}>Loading connections...</div>
      ) : connections.length === 0 ? (
        <div style={{
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          textAlign: 'center',
          color: '#999'
        }}>
          No connections configured
        </div>
      ) : (
        <div style={{overflowX: 'auto'}}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: 'white',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}>
            <thead>
              <tr style={{backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd'}}>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333'}}>Name</th>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333'}}>Host</th>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333'}}>Port</th>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333'}}>Settings File</th>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {connections.map((c)=> (
                <ConnectionItem
                  key={c.id || `${c.name}-${c.host}-${c.port}`}
                  conn={c}
                  onEdit={()=>{ setEditing(c); setShowForm(true) }}
                  onDelete={()=>handleDelete(c.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{
        marginTop: '15px',
        padding: '10px',
        backgroundColor: '#e8f5e9',
        borderRadius: '4px',
        fontSize: '0.9em',
        color: '#2e7d32'
      }}>
        <strong>Total:</strong> {connections.length} connection{connections.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}
