import { io } from 'socket.io-client'

const DEFAULT_SERVER_URL = 'http://localhost:4000'
const CONFIGURED_SERVER_URL = (import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_SERVER_URL || '').replace(/\/+$/,'')

const disabledSocket = {
  connected: false,
  connect() {
    return this
  },
  disconnect() {
    return this
  },
  emit() {
    return this
  },
  on() {
    return this
  },
  off() {
    return this
  },
}

let socket = null

export function getSocket() {
  return socket
}

/** Connect (idempotent). Safe to call after login or on app bootstrap. */
export function connectSocket() {
  if (!import.meta.env.DEV && !CONFIGURED_SERVER_URL) return disabledSocket

  if (socket) {
    if (!socket.connected) socket.connect()
    return socket
  }
  const url = import.meta.env.DEV ? DEFAULT_SERVER_URL : CONFIGURED_SERVER_URL
  socket = io(url, {
    withCredentials: true,
    autoConnect: true,
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
  })
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

/** Reconnect the existing socket so its handshake picks up a changed session cookie. */
export function refreshSocketAuthentication() {
  if (!socket) return connectSocket()
  socket.disconnect()
  socket.connect()
  return socket
}
