import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Grid,
  Typography,
  Pagination,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Container
} from '@mui/material'
import { toast } from 'react-toastify'
import MovieCard from '../components/MovieCard'
import api from '../services/api'

const Home = () => {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState('')
  

  const fetchMovies = async (pageNum = 1) => {
    try {
      setLoading(true)
      const response = await api.get(`/movies?page=${pageNum}&limit=12`)
      setMovies(response.data.movies)
      setTotalPages(response.data.pagination.pages)
      setError('')
    } catch (err) {
      setError('Failed to fetch movies')
    } finally {
      setLoading(false)
    }
  }

  const fetchSortedMovies = async () => {
    if (!sortBy) return
    
    try {
      setLoading(true)
      const response = await api.get(`/movies/sorted?sortBy=${sortBy}&order=asc`)
      setMovies(response.data.movies)
      setError('')
    } catch (err) {
      setError('Failed to sort movies')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMovie = async (movieId) => {
    if (!window.confirm('Are you sure you want to delete this movie?')) return

    try {
      await api.delete(`/movies/${movieId}`)
      setMovies(movies.filter(movie => movie._id !== movieId))
      toast.success('Movie deleted successfully')
    } catch (err) {
      setError('Failed to delete movie')
    }
  }

  useEffect(() => {
    fetchMovies()
  }, [])

  useEffect(() => {
    if (sortBy) {
      fetchSortedMovies()
    } else {
      fetchMovies(page)
    }
  }, [sortBy])

  useEffect(() => {
    if (error) {
      toast.error(error)
      setError('')
    }
  }, [error])

  const location = useLocation()

  useEffect(() => {
    let intervalId

    const fetchMoviesSilent = async () => {
      try {
        let url = `/movies?page=${page}&limit=12`
        if (sortBy) {
          url = `/movies/sorted?sortBy=${sortBy}&order=asc`
        }
        const response = await api.get(url)
        setMovies(response.data.movies)
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.pages)
        }
      } catch (err) {
        console.error('Silent fetch failed', err)
      }
    }

    const checkQueueAndRefresh = async () => {
      try {
        const qRes = await api.get('/movies/debug/queue')
        const counts = qRes.data.counts
        const activeOrWaiting = (counts.active || 0) + (counts.waiting || 0)
        
        if (activeOrWaiting > 0) {
          await fetchMoviesSilent()
        } else {
          // Queue empty, fetch one last time and stop
          await fetchMoviesSilent()
          clearInterval(intervalId)
          if (location.state?.importing) {
             // Clearing interval for this mount.
             toast.success('Import completed!')
          }
        }
      } catch (err) {
        clearInterval(intervalId)
      }
    }

    if (location.state?.importing) {
      intervalId = setInterval(checkQueueAndRefresh, 2000)
      checkQueueAndRefresh()
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [location.state, page, sortBy])

  const handlePageChange = (event, value) => {
    setPage(value)
    fetchMovies(value)
  }

  if (loading && movies.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress color="secondary" />
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ 
        position: 'relative', 
        height: { xs: 300, md: 400 }, 
        borderRadius: 6, 
        overflow: 'hidden', 
        mb: 6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #3f51b5 100%)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <Box sx={{ textAlign: 'center', zIndex: 1, px: 2 }}>
          <Typography variant="h2" sx={{ fontWeight: 800, color: '#fff', mb: 2, letterSpacing: '-0.05em', fontSize: { xs: '2rem', md: '3.5rem' } }}>
            Discover Cinematic Masterpieces
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', maxWidth: 600, mx: 'auto', fontWeight: 400 }}>
            Explore our curated collection of top-rated movies.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.025em', mb: 0.5 }}>
            Trending Now
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Most watched movies this week
          </Typography>
        </Box>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            label="Sort By"
            onChange={(e) => setSortBy(e.target.value)}
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="">Default</MenuItem>
            <MenuItem value="title">Title</MenuItem>
            <MenuItem value="rating">Rating</MenuItem>
            <MenuItem value="releaseDate">Release Date</MenuItem>
            <MenuItem value="duration">Duration</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {movies.map((movie) => (
          <Grid item xs={6} sm={4} md={3} lg={2.4} key={movie._id}>
            <MovieCard movie={movie} onDelete={handleDeleteMovie} />
          </Grid>
        ))}
      </Grid>

      {!sortBy && totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6, mb: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
            shape="rounded"
          />
        </Box>
      )}
    </Box>
  )
}

export default Home