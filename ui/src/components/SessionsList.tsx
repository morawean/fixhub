import React, { useEffect, useState } from 'react'
import { getSessions, disconnectSession } from '../api'

interface Session {
  senderCompID: string
  targetCompID: string
  beginString: string
  toString: string
}

export default function SessionsList() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)

  const fetchSessions = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getSessions()
      setSessions(data || [])
      setLastUpdate(new Date())
    } catch (err) {
      setError('Failed to fetch sessions')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchSessions, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleDisconnect = async (sessionId: string) => {
    if (!confirm(`Disconnect session ${sessionId}?`)) return
    
    setDisconnecting(sessionId)
    try {
      await disconnectSession(sessionId)
      // Refresh sessions list after disconnect
      setTimeout(fetchSessions, 500)
    } catch (err) {
      alert('Failed to disconnect session')
      console.error(err)
    } finally {
      setDisconnecting(null)
    }
  }

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
        <h2>Active FIX Sessions</h2>
        <div>
          <button
            onClick={fetchSessions}
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {lastUpdate && (
        <div style={{ fontSize: '0.85em', color: '#666', marginBottom: 10 }}>
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      )}

      {error && (
        <div style={{
          padding: '10px',
          backgroundColor: '#ffebee',
          color: '#c62828',
          borderRadius: '4px',
          marginBottom: 15
        }}>
          {error}
        </div>
      )}

      {sessions.length === 0 ? (
        <div style={{
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          textAlign: 'center',
          color: '#999'
        }}>
          <p>No active sessions</p>
          <p style={{ fontSize: '0.9em', marginTop: 5 }}>
            Sessions will appear here when FIX clients connect to the hub
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '15px'
        }}>
          {sessions.map((session, idx) => (
            <div
              key={idx}
              style={{
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '15px',
                backgroundColor: '#fafafa',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{ marginBottom: '12px' }}>
                <div style={{
                  fontSize: '0.9em',
                  color: '#666',
                  marginBottom: '4px'
                }}>
                  Protocol Version
                </div>
                <div style={{
                  fontSize: '1.1em',
                  fontWeight: 'bold',
                  color: '#333',
                  fontFamily: 'monospace'
                }}>
                  {session.beginString}
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{
                  fontSize: '0.9em',
                  color: '#666',
                  marginBottom: '4px'
                }}>
                  Session ID
                </div>
                <div style={{
                  fontSize: '0.95em',
                  fontFamily: 'monospace',
                  backgroundColor: 'white',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #e0e0e0',
                  wordBreak: 'break-all'
                }}>
                  {session.toString}
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                marginBottom: '12px'
              }}>
                <div>
                  <div style={{
                    fontSize: '0.85em',
                    color: '#666',
                    marginBottom: '3px'
                  }}>
                    Sender Comp ID
                  </div>
                  <div style={{
                    fontSize: '0.95em',
                    fontWeight: '500',
                    color: '#2196f3',
                    fontFamily: 'monospace'
                  }}>
                    {session.senderCompID}
                  </div>
                </div>
                <div>
                  <div style={{
                    fontSize: '0.85em',
                    color: '#666',
                    marginBottom: '3px'
                  }}>
                    Target Comp ID
                  </div>
                  <div style={{
                    fontSize: '0.95em',
                    fontWeight: '500',
                    color: '#f57c00',
                    fontFamily: 'monospace'
                  }}>
                    {session.targetCompID}
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '8px',
                paddingTop: '10px',
                borderTop: '1px solid #e0e0e0'
              }}>
                <button
                  style={{
                    flex: 1,
                    padding: '8px',
                    backgroundColor: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9em',
                    fontWeight: '500'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#45a049')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#4caf50')}
                >
                  View Details
                </button>
                <button
                  onClick={() => handleDisconnect(session.toString)}
                  disabled={disconnecting === session.toString}
                  style={{
                    flex: 1,
                    padding: '8px',
                    backgroundColor: disconnecting === session.toString ? '#ccc' : '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: disconnecting === session.toString ? 'not-allowed' : 'pointer',
                    fontSize: '0.9em',
                    fontWeight: '500'
                  }}
                  onMouseOver={(e) => {
                    if (disconnecting !== session.toString) {
                      e.currentTarget.style.backgroundColor = '#da190b'
                    }
                  }}
                  onMouseOut={(e) => {
                    if (disconnecting !== session.toString) {
                      e.currentTarget.style.backgroundColor = '#f44336'
                    }
                  }}
                >
                  {disconnecting === session.toString ? 'Disconnecting...' : 'Disconnect'}
                </button>
              </div>

              <div style={{
                marginTop: '10px',
                fontSize: '0.85em',
                color: '#999',
                padding: '8px',
                backgroundColor: '#f0f0f0',
                borderRadius: '4px',
                textAlign: 'center'
              }}>
                Status: <span style={{ color: '#4caf50', fontWeight: 'bold' }}>● Connected</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#e3f2fd',
        borderRadius: '4px',
        fontSize: '0.9em',
        color: '#1565c0'
      }}>
        <strong>Info:</strong> Displaying {sessions.length} active FIX session{sessions.length !== 1 ? 's' : ''}. 
        Sessions are automatically refreshed every 5 seconds.
      </div>
    </div>
  )
}
