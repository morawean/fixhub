import React, {useState, useEffect} from 'react'

export default function ConnectionForm({initialData, onSubmit, onCancel}:{initialData?:any, onSubmit:(data:any)=>void, onCancel:()=>void}){
  const [name, setName] = useState('')
  const [host, setHost] = useState('')
  const [port, setPort] = useState(9878)
  const [settingsFile, setSettingsFile] = useState('')

  useEffect(()=>{
    if(initialData){
      setName(initialData.name || '')
      setHost(initialData.host || '')
      setPort(initialData.port || 9878)
      setSettingsFile(initialData.settingsFile || '')
    }
  },[initialData])

  function submit(e:any){
    e.preventDefault()
    if(!name) { alert('Name is required'); return }
    onSubmit({ name, host, port, settingsFile })
  }

  return (
    <form onSubmit={submit} className="connection-form">
      <div className="form-row">
        <label>Name</label>
        <input value={name} onChange={e=>setName(e.target.value)} />
      </div>
      <div className="form-row">
        <label>Host</label>
        <input value={host} onChange={e=>setHost(e.target.value)} placeholder="0.0.0.0" />
      </div>
      <div className="form-row">
        <label>Port</label>
        <input type="number" value={port} onChange={e=>setPort(Number(e.target.value))} />
      </div>
      <div className="form-row">
        <label>Settings File</label>
        <input value={settingsFile} onChange={e=>setSettingsFile(e.target.value)} placeholder="conf/acceptor-1.cfg" />
      </div>
      <div style={{marginTop:8}}>
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel} style={{marginLeft:8}}>Cancel</button>
      </div>
    </form>
  )
}
