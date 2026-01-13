import React, {useEffect, useState} from 'react'
import {isAuthenticated, getUsername, logout} from './api'
import Login from './components/Login'
import ConnectionsList from './components/ConnectionsList'
import SessionsList from './components/SessionsList'
import MessageStream from './components/MessageStream'
import RoutesList from './components/RoutesList'

export default function App(){
  const [authenticated, setAuthenticated] = useState(isAuthenticated())
  const [username, setUsername] = useState(getUsername() || 'User')

  useEffect(()=>{ 
    // Component mounted, user is authenticated
  },[authenticated])

  const handleLoginSuccess = (token: string) => {
    setAuthenticated(true)
    setUsername(getUsername() || 'User')
  }

  const handleLogout = () => {
    logout()
    setAuthenticated(false)
  }

  if (!authenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div style={{fontFamily:'Arial, sans-serif', minHeight: '100vh', backgroundColor: '#f5f7fa'}}>
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e0e0e0',
        padding: '15px 20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{margin: 0, color: '#1a237e', fontSize: '24px'}}>FIX Hub Dashboard</h1>
        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
          <span style={{color: '#666', fontSize: '14px'}}>Logged in as: <strong>{username}</strong></span>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#da190b')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#f44336')}
          >
            Logout
          </button>
        </div>
      </header>

      <div style={{padding:20, maxWidth: '1400px', margin: '0 auto'}}>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 30}}>
          <section style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <ConnectionsList />
          </section>
          <section style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <SessionsList />
          </section>
        </div>

        <section style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: 30,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <MessageStream />
        </section>

        <section style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <RoutesList />
        </section>
      </div>
    </div>
  )
}
