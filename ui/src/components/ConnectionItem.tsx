import React from 'react'

export default function ConnectionItem({conn, onEdit, onDelete}:{conn:any, onEdit:()=>void, onDelete:()=>void}){
  return (
    <tr style={{borderBottom: '1px solid #eee'}}>
      <td style={{padding: '12px', color: '#333', fontWeight: '500'}}>{conn.name}</td>
      <td style={{padding: '12px', color: '#666', fontFamily: 'monospace'}}>{conn.host}</td>
      <td style={{padding: '12px', color: '#666', fontFamily: 'monospace'}}>{conn.port}</td>
      <td style={{padding: '12px', color: '#666', fontSize: '0.9em'}}>{conn.settingsFile}</td>
      <td style={{padding: '12px'}}>
        <button 
          onClick={onEdit}
          style={{
            marginRight: 8,
            padding: '6px 12px',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9em'
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#1976d2')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#2196f3')}
        >
          Edit
        </button>
        <button 
          onClick={onDelete}
          style={{
            padding: '6px 12px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9em'
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#da190b')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#f44336')}
        >
          Delete
        </button>
      </td>
    </tr>
  )
}
