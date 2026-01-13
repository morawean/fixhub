import React, { useEffect, useState, useRef } from 'react'
import { connectWebSocket } from '../api'

interface FIXMessage {
  type: string
  sessionId: string
  senderCompID: string
  targetCompID: string
  messageType: string
  messageBody: string
  timestamp: number
  direction: string
}

export default function MessageStream() {
  const [messages, setMessages] = useState<FIXMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [maxMessages] = useState(100)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    wsRef.current = connectWebSocket(
      (data: FIXMessage) => {
        setMessages(prev => {
          const updated = [data, ...prev]
          return updated.slice(0, maxMessages)
        })
      },
      () => setIsConnected(true),
      () => setIsConnected(false)
    )

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [maxMessages])

  const clearMessages = () => setMessages([])

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case 'FROM_CLIENT':
        return '#e8f5e9'
      case 'TO_CLIENT':
        return '#fff3e0'
      case 'FROM_SERVER':
        return '#e3f2fd'
      case 'TO_SERVER':
        return '#f3e5f5'
      default:
        return '#f5f5f5'
    }
  }

  return (
    <div style={{ marginTop: 20 }}>
      <h2>
        Message Stream
        <span style={{
          marginLeft: 10,
          fontSize: '0.8em',
          color: isConnected ? '#4caf50' : '#f44336'
        }}>
          {isConnected ? '● Connected' : '● Disconnected'}
        </span>
      </h2>
      
      <div style={{ marginBottom: 10 }}>
        <button 
          onClick={clearMessages}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Clear Messages ({messages.length})
        </button>
      </div>

      <div style={{
        maxHeight: '600px',
        overflowY: 'auto',
        border: '1px solid #ddd',
        borderRadius: '4px',
        padding: '10px',
        backgroundColor: '#fafafa'
      }}>
        {messages.length === 0 ? (
          <p style={{ color: '#999', textAlign: 'center' }}>
            {isConnected ? 'Waiting for messages...' : 'Connecting...'}
          </p>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                padding: '10px',
                marginBottom: '8px',
                backgroundColor: getDirectionColor(msg.direction),
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '12px',
                fontFamily: 'monospace'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <strong>{msg.direction}</strong>
                <span style={{ color: '#666' }}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div style={{ marginBottom: '5px', color: '#333' }}>
                <strong>Type:</strong> {msg.messageType} | 
                <strong> Session:</strong> {msg.sessionId}
              </div>
              <div style={{ marginBottom: '5px', color: '#555' }}>
                <strong>{msg.senderCompID}</strong> → <strong>{msg.targetCompID}</strong>
              </div>
              <details style={{ marginTop: '8px' }}>
                <summary style={{ cursor: 'pointer', color: '#2196f3' }}>
                  Message Body
                </summary>
                <div style={{
                  marginTop: '8px',
                  padding: '8px',
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '3px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all'
                }}>
                  {msg.messageBody}
                </div>
              </details>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
