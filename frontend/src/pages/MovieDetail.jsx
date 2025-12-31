import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Grid,
  Typography,
  Chip,
  Rating,
  Button,
  Container,
  CircularProgress,
  IconButton
} from '@mui/material'
import { ArrowBack, CalendarToday, AccessTime, Person } from '@mui/icons-material'
import api from '../services/api'

const MovieDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await api.get(`/movies/${id}`)
        setMovie(res.data.movie)
      } catch (err) {
        setError('Failed to load movie')
      } finally {
        setLoading(false)
      }
    }
    fetchMovie()
  }, [id])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress color="secondary" />
      </Box>
    )
  }

  if (error || !movie) {
    return (
      <Box sx={{ textAlign: 'center', mt: 10 }}>
        <Typography color="error" variant="h5" sx={{ mb: 2 }}>{error || 'Movie not found'}</Typography>
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate(-1)}>Back to Home</Button>
      </Box>
    )
  }

  return (
    <Box sx={{ position: 'relative', minHeight: '80vh', overflow: 'hidden' }}>
      {/* Background Backdrop */}
      <Box sx={{
        position: 'absolute',
        top: -100,
        left: -100,
        right: -100,
        height: '80vh',
        backgroundImage: `url(${movie.poster})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(60px) brightness(0.2)',
        zIndex: 0,
        maskImage: 'linear-gradient(to bottom, black 20%, transparent 100%)',
        opacity: 0.8
      }} />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pt: 4, pb: 8 }}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate(-1)} 
          sx={{ mb: 4, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
        >
          Back
        </Button>

        <Grid container spacing={6} alignItems="flex-start">
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              borderRadius: 4, 
              overflow: 'hidden', 
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.1)',
              position: 'relative'
            }}>
              <img 
                src={movie.poster} 
                alt={movie.title} 
                style={{ width: '100%', display: 'block', height: 'auto' }} 
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Typography variant="h2" sx={{ 
              fontWeight: 800, 
              lineHeight: 1.1, 
              mb: 2, 
              letterSpacing: '-0.025em',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)'
            }}>
              {movie.title}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Rating value={movie.rating / 2} precision={0.1} readOnly sx={{ color: '#ffd700' }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffd700' }}>{movie.rating}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                <AccessTime fontSize="small" />
                <Typography>{Math.floor(movie.duration/60)}h {movie.duration%60}m</Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                <CalendarToday fontSize="small" />
                <Typography>{new Date(movie.releaseDate).getFullYear()}</Typography>
              </Box>

              {movie.imdbRank && (
                <Chip 
                  label={`IMDb Top #${movie.imdbRank}`} 
                  color="secondary" 
                  size="small" 
                  sx={{ fontWeight: 700, borderRadius: 1 }} 
                />
              )}
            </Box>

            <Box sx={{ mb: 4 }}>
              {movie.genre.map((g) => (
                <Chip 
                  key={g} 
                  label={g} 
                  sx={{ 
                    mr: 1, 
                    mb: 1, 
                    bgcolor: 'rgba(255,255,255,0.1)', 
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    '&:hover': { bgcolor: 'primary.main', color: '#fff' }
                  }} 
                  clickable
                />
              ))}
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>Overview</Typography>
            <Typography variant="body1" sx={{ 
              mb: 4, 
              fontSize: '1.1rem', 
              lineHeight: 1.7, 
              color: 'text.secondary',
              maxWidth: '65ch'
            }}>
              {movie.description}
            </Typography>

            <Grid container spacing={4}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person fontSize="small" color="primary" /> Director
                </Typography>
                <Typography variant="body2" color="text.secondary">{movie.director}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person fontSize="small" color="secondary" /> Cast
                </Typography>
                <Typography variant="body2" color="text.secondary">{movie.cast?.join(', ')}</Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default MovieDetail
