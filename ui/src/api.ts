import axios from 'axios'

// Setup axios interceptor for JWT token
const setupInterceptor = () => {
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )
}

setupInterceptor()

// Authentication
export async function login(username: string, password: string) {
  try {
    const r = await axios.post('/api/auth/login', { username, password })
    return r.data
  } catch (e) {
    console.error(e)
    throw e
  }
}

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  axios.defaults.headers.common['Authorization'] = ''
}

export function isAuthenticated() {
  return !!localStorage.getItem('token')
}

export function getUsername() {
  return localStorage.getItem('username')
}

// WebSocket message stream
export function connectWebSocket(onMessage: (data: any) => void, onOpen?: () => void, onClose?: () => void) {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const ws = new WebSocket(`${protocol}//${window.location.host}/ws/messages`)
  
  ws.onopen = () => {
    console.log('WebSocket connected')
    onOpen?.()
  }
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      onMessage(data)
    } catch(e) {
      console.error('Failed to parse WebSocket message:', e)
    }
  }
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error)
  }
  
  ws.onclose = () => {
    console.log('WebSocket closed')
    onClose?.()
  }
  
  return ws
}

export async function getSessions(){
  try{
    const r = await axios.get('/api/sessions')
    return r.data
  }catch(e){
    console.error(e)
    return []
  }
}

export async function disconnectSession(sessionId: string){
  try{
    const r = await axios.post(`/api/sessions/${encodeURIComponent(sessionId)}/disconnect`)
    return r.data
  }catch(e){
    console.error(e)
    throw e
  }
}

export async function getRoutes(){
  try{
    const r = await axios.get('/api/routes')
    return r.data || []
  }catch(e){
    console.error(e)
    return []
  }
}

export async function createRoute(route: any) {
  try {
    const r = await axios.post('/api/routes', route)
    return r.data
  } catch(e) {
    console.error(e)
    throw e
  }
}

export async function updateRoute(index: number, route: any) {
  try {
    const r = await axios.put(`/api/routes/${index}`, route)
    return r.data
  } catch(e) {
    console.error(e)
    throw e
  }
}

export async function deleteRoute(index: number) {
  try {
    await axios.delete(`/api/routes/${index}`)
  } catch(e) {
    console.error(e)
    throw e
  }
}

// Connections (CRUD)
export async function getConnections(){
  try{
    const r = await axios.get('/api/connections')
    return r.data
  }catch(e){
    console.error(e)
    return []
  }
}

export async function createConnection(payload:any){
  try{
    const r = await axios.post('/api/connections', payload)
    return r.data
  }catch(e){ console.error(e); throw e }
}

export async function updateConnection(id:string, payload:any){
  try{
    const r = await axios.put(`/api/connections/${id}`, payload)
    return r.data
  }catch(e){ console.error(e); throw e }
}

export async function deleteConnection(id:string){
  try{
    const r = await axios.delete(`/api/connections/${id}`)
    return r.data
  }catch(e){ console.error(e); throw e }
}
