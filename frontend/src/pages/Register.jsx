import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  InputAdornment,
  IconButton,
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button
} from '@mui/material'
import { Visibility, VisibilityOff, Email, Lock, Person } from '@mui/icons-material'
import { toast } from 'react-toastify'
import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false
  })
  const [error, setError] = useState('')
  const { register, loading } = useAuth()
  const navigate = useNavigate()

  const validate = (name, value) => {
    let tempError = ''
    if (name === 'name') {
      if (!value.trim()) tempError = 'Name is required'
      else if (value.length < 2) tempError = 'Name must be at least 2 characters'
    }
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!value) tempError = 'Email is required'
      else if (!emailRegex.test(value)) tempError = 'Invalid email format'
    }
    if (name === 'password') {
      if (!value) tempError = 'Password is required'
      else if (value.length < 6) tempError = 'Password must be at least 6 characters'
    }
    setErrors(prev => ({ ...prev, [name]: tempError }))
    return tempError
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    if (touched[name]) {
      validate(name, value)
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    validate(name, value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const nameError = validate('name', formData.name)
    const emailError = validate('email', formData.email)
    const passwordError = validate('password', formData.password)

    if (nameError || emailError || passwordError) return

    const result = await register(formData)
    
    if (result.success) {
      toast.success('Welcome!')
      navigate('/')
    } else {
      setError(result.message)
    }
  }

  useEffect(() => {
    if (error) {
      toast.error(error)
      setError('')
    }
  }, [error])

  return (
    <Container maxWidth="xs" sx={{ height: 'calc(100vh - 100px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper elevation={0} sx={{ 
        p: 4, 
        width: '100%', 
        background: 'rgba(15, 23, 42, 0.6)', 
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 4,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Box sx={{ 
            width: 60, 
            height: 60, 
            borderRadius: '16px', 
            background: 'linear-gradient(135deg, #0f172a 0%, #115e59 40%, #7c3aed 100%)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            mb: 2,
            boxShadow: '0 0 20px rgba(124, 58, 237, 0.5)'
          }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff' }}>M</Typography>
          </Box>
          <Typography component="h1" variant="h4" sx={{ fontWeight: 700, background: 'linear-gradient(to right, #fff, #94a3b8)', backgroundClip: 'text', textFillColor: 'transparent', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Create Account
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            Join MovieWind today
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            margin="normal"
            required
            error={!!errors.name}
            helperText={errors.name}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              sx: { 
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.03)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
              }
            }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            margin="normal"
            required
            error={!!errors.email}
            helperText={errors.email}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              sx: { 
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.03)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
              }
            }}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            margin="normal"
            required
            error={!!errors.password}
            helperText={errors.password}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{ color: 'text.secondary' }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              sx: { 
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.03)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
              }
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ 
              mt: 4, 
              mb: 3, 
              py: 1.5, 
              borderRadius: 2, 
              fontSize: '1rem',
              background: 'linear-gradient(135deg, #115e59 0%, #7c3aed 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0f524d 0%, #6d28d9 100%)',
                boxShadow: '0 0 20px rgba(124, 58, 237, 0.4)'
              }
            }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </Button>

          <Typography align="center" variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link to="/login" style={{ textDecoration: 'none', color: '#7c3aed', fontWeight: 600 }}>
              Login here
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  )
}

export default Register
