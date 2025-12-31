import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
  MenuItem,
  CircularProgress
} from '@mui/material'
import { toast } from 'react-toastify'
import api from '../services/api'

const GENRES = [
  'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 'Horror',
  'Music', 'Mystery', 'Romance', 'Sci-Fi', 'Sport', 'Thriller', 'War', 'Western'
]

const EditMovie = () => {
  const { id } = useParams()
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
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchMovie()
  }, [id])

  const fetchMovie = async () => {
    try {
    
      const response = await api.get('/movies')
      const movie = response.data.movies.find(m => m._id === id)
      
      if (!movie) {
        setError('Movie not found')
        return
      }

      setFormData({
        title: movie.title,
        description: movie.description,
        rating: movie.rating.toString(),
        releaseDate: movie.releaseDate.split('T')[0],
        duration: movie.duration.toString(),
        genre: movie.genre,
        director: movie.director,
        cast: movie.cast.join(', '),
        poster: movie.poster || '',
        imdbRank: movie.imdbRank?.toString() || ''
      })
    } catch (err) {
      setError('Failed to fetch movie details')
    } finally {
      setFetchLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleGenreChange = (event) => {
    const value = event.target.value
    setFormData({
      ...formData,
      genre: typeof value === 'string' ? value.split(',') : value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (formData.rating < 0 || formData.rating > 10) {
      setError('Rating must be between 0 and 10')
      return
    }

    if (formData.duration <= 0) {
      setError('Duration must be a positive number')
      return
    }

    if (formData.genre.length === 0) {
      setError('Please select at least one genre')
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

      await api.put(`/movies/${id}`, movieData)
      setSuccess('Movie updated successfully!')
      
      setTimeout(() => {
        navigate('/')
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update movie')
    } finally {
      setLoading(false)
    }
  }
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

  if (fetchLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    )
  }
  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Edit Movie
      </Typography>

      {/* errors/success */}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
              required
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
              inputProps={{ min: 0, max: 10, step: 0.1 }}
              required
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
              inputProps={{ min: 1 }}
              required
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
              InputLabelProps={{ shrink: true }}
              required
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
              inputProps={{ min: 1, max: 250 }}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Genres</InputLabel>
              <Select
                multiple
                value={formData.genre}
                onChange={handleGenreChange}
                input={<OutlinedInput label="Genres" />}
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
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Director"
              name="director"
              value={formData.director}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Cast (comma-separated)"
              name="cast"
              value={formData.cast}
              onChange={handleChange}
              placeholder="Actor 1, Actor 2, Actor 3"
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Poster URL (optional)"
              name="poster"
              value={formData.poster}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mr: 2 }}
            >
              {loading ? 'Updating Movie...' : 'Update Movie'}
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/')}
            >
              Cancel
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  )
}

export default EditMovie