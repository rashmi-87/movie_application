import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  OutlinedInput,
  Select,
  MenuItem
} from '@mui/material'
import { toast } from 'react-toastify'
import api from '../services/api'

const GENRES = [
  'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 'Horror',
  'Music', 'Mystery', 'Romance', 'Sci-Fi', 'Sport', 'Thriller', 'War', 'Western'
]

const AddMovie = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rating: '',
    releaseDate: '',
    duration: '',
    genre: [],
    director: '',
    cast: '',
    poster: '',
    imdbRank: ''
  })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const validate = (name, value) => {
    let tempError = ''
    switch (name) {
      case 'title':
        if (!value.trim()) tempError = 'Title is required'
        break
      case 'description':
        if (!value.trim()) tempError = 'Description is required'
        else if (value.trim().length < 10) tempError = 'Description must be at least 10 characters'
        break
      case 'rating':
        if (value === '' || value < 0 || value > 10) tempError = 'Rating must be between 0 and 10'
        break
      case 'duration':
        if (!value || value <= 0) tempError = 'Duration must be a positive number'
        break
      case 'releaseDate':
        if (!value) tempError = 'Release date is required'
        break
      case 'genre':
        if (!value || value.length === 0) tempError = 'Select at least one genre'
        break
      case 'director':
        if (!value.trim()) tempError = 'Director is required'
        break
      case 'cast':
        if (!value.trim()) tempError = 'Cast is required'
        break
      default:
        break
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

  const handleGenreChange = (event) => {
    const value = event.target.value
    const newGenres = typeof value === 'string' ? value.split(',') : value
    setFormData({
      ...formData,
      genre: newGenres
    })
    setTouched(prev => ({ ...prev, genre: true }))
    if (newGenres.length === 0) {
      setErrors(prev => ({ ...prev, genre: 'Select at least one genre' }))
    } else {
      setErrors(prev => ({ ...prev, genre: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validate all fields
    const newErrors = {}
    let isValid = true
    Object.keys(formData).forEach(key => {
      if (key !== 'imdbRank' && key !== 'poster') {
        const error = validate(key, formData[key])
        if (error) {
          newErrors[key] = error
          isValid = false
        }
      }
    })

    if (!isValid) {
      setErrors(newErrors)
      setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}))
      toast.error('Please fix the errors in the form')
      return
    }

    try {
      setLoading(true)
      
      const movieData = {
        ...formData,
        rating: parseFloat(formData.rating),
        duration: parseInt(formData.duration),
        cast: formData.cast.split(',').map(c => c.trim()).filter(c => c),
        imdbRank: formData.imdbRank ? parseInt(formData.imdbRank) : null
      }

      await api.post('/movies', movieData)
      setSuccess('Movie added successfully! It will be processed shortly.')
      
      
      setFormData({
        title: '',
        description: '',
        rating: '',
        releaseDate: '',
        duration: '',
        genre: [],
        director: '',
        cast: '',
        poster: '',
        imdbRank: ''
      })
      setTouched({})
      setErrors({})

      setTimeout(() => {
        navigate('/')
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add movie')
    } finally {
      setLoading(false)
    }
  }
  const [error, setError] = useState('')

  useEffect(() => {
    if (error) {
      toast.error(error)
      setError('')
    }
  }, [error])

  useEffect(() => {
    if (success) {
      toast.success(success)
      setSuccess('')
    }
  }, [success])

  return (
    <Paper elevation={0} sx={{ 
      p: 4, 
      background: 'rgba(15, 23, 42, 0.6)', 
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: 4
    }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, background: 'linear-gradient(to right, #fff, #94a3b8)', backgroundClip: 'text', textFillColor: 'transparent', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 4 }}>
        Add New Movie
      </Typography>

      {/* errors/success */}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              error={touched.title && !!errors.title}
              helperText={touched.title && errors.title}
              InputProps={{
                sx: { borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)' }
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              onBlur={handleBlur}
              multiline
              rows={4}
              required
              error={touched.description && !!errors.description}
              helperText={touched.description && errors.description}
              InputProps={{
                sx: { borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)' }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Rating (0-10)"
              name="rating"
              type="number"
              value={formData.rating}
              onChange={handleChange}
              onBlur={handleBlur}
              inputProps={{ min: 0, max: 10, step: 0.1 }}
              required
              error={touched.rating && !!errors.rating}
              helperText={touched.rating && errors.rating}
              InputProps={{
                sx: { borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)' }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Duration (minutes)"
              name="duration"
              type="number"
              value={formData.duration}
              onChange={handleChange}
              onBlur={handleBlur}
              inputProps={{ min: 1 }}
              required
              error={touched.duration && !!errors.duration}
              helperText={touched.duration && errors.duration}
              InputProps={{
                sx: { borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)' }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Release Date"
              name="releaseDate"
              type="date"
              value={formData.releaseDate}
              onChange={handleChange}
              onBlur={handleBlur}
              InputLabelProps={{ shrink: true }}
              required
              error={touched.releaseDate && !!errors.releaseDate}
              helperText={touched.releaseDate && errors.releaseDate}
              InputProps={{
                sx: { borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)' }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="IMDb Rank (optional)"
              name="imdbRank"
              type="number"
              value={formData.imdbRank}
              onChange={handleChange}
              onBlur={handleBlur}
              inputProps={{ min: 1, max: 250 }}
              InputProps={{
                sx: { borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)' }
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth error={touched.genre && !!errors.genre}>
              <InputLabel>Genres</InputLabel>
              <Select
                multiple
                value={formData.genre}
                onChange={handleGenreChange}
                onBlur={() => setTouched(prev => ({ ...prev, genre: true }))}
                input={<OutlinedInput label="Genres" sx={{ borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)' }} />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {GENRES.map((genre) => (
                  <MenuItem key={genre} value={genre}>
                    {genre}
                  </MenuItem>
                ))}
              </Select>
              {touched.genre && errors.genre && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {errors.genre}
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Director"
              name="director"
              value={formData.director}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              error={touched.director && !!errors.director}
              helperText={touched.director && errors.director}
              InputProps={{
                sx: { borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)' }
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Cast (comma-separated)"
              name="cast"
              value={formData.cast}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Actor 1, Actor 2, Actor 3"
              required
              error={touched.cast && !!errors.cast}
              helperText={touched.cast && errors.cast}
              InputProps={{
                sx: { borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)' }
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Poster URL (optional)"
              name="poster"
              value={formData.poster}
              onChange={handleChange}
              onBlur={handleBlur}
              InputProps={{
                sx: { borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)' }
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ 
                mr: 2,
                px: 4,
                py: 1.5,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #115e59 0%, #7c3aed 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0f524d 0%, #6d28d9 100%)',
                  boxShadow: '0 0 20px rgba(124, 58, 237, 0.4)'
                }
              }}
            >
              {loading ? 'Adding Movie...' : 'Add Movie'}
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/')}
              sx={{ 
                px: 4,
                py: 1.5,
                borderRadius: 2,
                borderColor: 'rgba(255,255,255,0.2)',
                color: 'text.secondary',
                '&:hover': {
                  borderColor: '#fff',
                  color: '#fff'
                }
              }}
            >
              Cancel
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  )
}

export default AddMovie