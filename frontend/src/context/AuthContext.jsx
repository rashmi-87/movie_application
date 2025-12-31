import { createContext, useContext, useReducer, useEffect } from 'react'
import jwtDecode from 'jwt-decode'
import api from '../services/api'

const AuthContext = createContext()

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false
      }
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      }
    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    loading: true
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const decoded = jwtDecode(token)
        if (decoded.exp * 1000 > Date.now()) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              token,
              user: JSON.parse(localStorage.getItem('user') || '{}')
            }
          })
        } else {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      } catch (error) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    dispatch({ type: 'SET_LOADING', payload: false })
  }, [])

  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await api.post('/auth/login', { email, password })
      const { token, user } = response.data

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { token, user }
      })

      return { success: true }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false })
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      }
    }
  }

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await api.post('/auth/register', userData)
      const { token, user } = response.data

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { token, user }
      })

      return { success: true }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false })
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
    dispatch({ type: 'LOGOUT' })
  }

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}