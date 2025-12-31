import { useState, useEffect, useRef } from 'react'
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  InputAdornment,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material'
import { Search as SearchIcon } from '@mui/icons-material'
import MovieCard from '../components/MovieCard'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'


const Search = () => {
  const [query, setQuery] = useState('')
  const [movies, setMovies] = useState([])
  const [allResults, setAllResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  const { user } = useAuth()
  const [sortBy, setSortBy] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const LIMIT = 12

  const handleSearch = async (e) => {
    if (e) e.preventDefault()
    if (!query.trim()) {
      await doSearch('', 1)
      return
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }

    await doSearch(query, 1)
  }

  const handleDeleteMovie = async (movieId) => {
    if (!window.confirm('Are you sure you want to delete this movie?')) return

    try {
      await api.delete(`/movies/${movieId}`)
      setMovies(movies.filter(movie => movie._id !== movieId))
    } catch (err) {
      setError('Failed to delete movie')
    }
  }

  const debounceRef = useRef(null)
  const cancelRef = useRef(null)

  const doSearch = async (q, pageNum = 1) => {
    try {
      if (cancelRef.current) cancelRef.current.abort()
      cancelRef.current = new AbortController()

      setLoading(true)
      setError('')

      if (!q || !q.trim()) {
        
        if (sortBy) {
          // If sorting is active, fetch sorted list 
          const res = await api.get(`/movies/sorted?sortBy=${sortBy}&order=asc`, { signal: cancelRef.current.signal })
          setMovies(res.data.movies || [])
          setTotalPages(1)
        } else {
          // Default: fetch paginated list
          const res = await api.get(`/movies?page=${pageNum}&limit=${LIMIT}`, { signal: cancelRef.current.signal })
          setMovies(res.data.movies || [])
          setTotalPages(res.data.pagination?.pages || 1)
        }
        setPage(pageNum)
        setAllResults([])
        setSearched(false)
      } else {
        // Search query active
        const response = await api.get(`/movies/search?q=${encodeURIComponent(q)}`, { signal: cancelRef.current.signal })
        const results = response.data.movies || []
        setAllResults(results)
        
        let processed = results
        if (sortBy) processed = sortClientSide(results, sortBy, 'asc')
        
        const pages = Math.max(1, Math.ceil(processed.length / LIMIT))
        setTotalPages(pages)
        setPage(pageNum)
        const start = (pageNum - 1) * LIMIT
        setMovies(processed.slice(start, start + LIMIT))
        setSearched(true)
      }
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return
      setError('Failed to search movies')
    } finally {
      setLoading(false)
    }
  }

  const sortClientSide = (arr, field, order) => {
    const sorted = [...arr].sort((a, b) => {
      let av = a[field]
      let bv = b[field]
      if (field === 'title') {
        av = (av || '').toString().toLowerCase()
        bv = (bv || '').toString().toLowerCase()
        if (av < bv) return order === 'asc' ? -1 : 1
        if (av > bv) return order === 'asc' ? 1 : -1
        return 0
      }
      if (field === 'releaseDate') {
        av = av ? new Date(av) : new Date(0)
        bv = bv ? new Date(bv) : new Date(0)
        return order === 'asc' ? av - bv : bv - av
      }
      av = Number(av) || 0
      bv = Number(bv) || 0
      return order === 'asc' ? av - bv : bv - av
    })
    return sorted
  }

  const sortMovies = (arr) => arr

  useEffect(() => {
    if (error) {
      toast.error(error)
      setError('')
    }
  }, [error])

  // Handle Sort changes
  useEffect(() => {
    if (searched) {
      // Client-side sort for existing search results
      let processed = allResults
      if (sortBy) processed = sortClientSide(allResults, sortBy, 'asc')
      
      // Reset to page 1 on sort change
      setPage(1)
      setTotalPages(Math.max(1, Math.ceil(processed.length / LIMIT)))
      setMovies(processed.slice(0, LIMIT))
    } else {
      // Server-side fetch for empty query (browse mode)
      doSearch('', 1)
    }
  }, [sortBy])

  const handlePageChange = (e, value) => {
    if (searched) {
      setPage(value)
      let processed = allResults
      if (sortBy) processed = sortClientSide(allResults, sortBy, 'asc')
      const start = (value - 1) * LIMIT
      setMovies(processed.slice(start, start + LIMIT))
    } else {
      doSearch('', value)
    }
  }

  // Live debounced search
  useEffect(() => {
    // If query is empty, doSearch is handled immediately or by sort effect, 
    
    if (!query.trim()) {
      doSearch('', 1)
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)

    const delay = query.trim().length >= 3 ? 400 : 600
    debounceRef.current = setTimeout(() => {
      doSearch(query, 1)
      debounceRef.current = null
    }, delay)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
        debounceRef.current = null
      }
    }
  }, [query])

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
        p: 5, 
        mb: 6, 
        borderRadius: 4, 
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        border: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <Typography variant="h3" sx={{ mb: 3, fontWeight: 800, textAlign: 'center' }}>
          Search Movies
        </Typography>

        <Box component="form" onSubmit={handleSearch} sx={{ maxWidth: 800, mx: 'auto' }}>
          <TextField
            fullWidth
            placeholder="Search by movie title or description..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              sx: { 
                bgcolor: 'background.paper',
                borderRadius: 3,
                fontSize: '1.1rem',
                pl: 2,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }
            }}
          />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {searched ? (
            movies.length > 0 
              ? `Found ${movies.length} result${movies.length !== 1 ? 's' : ''}`
              : `No results for "${query}"`
          ) : (
            'All Movies'
          )}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
      </Box>

      <Grid container spacing={3}>
        {sortMovies(movies).map((movie) => (
          <Grid item xs={6} sm={4} md={3} lg={2} key={movie._id}>
            <MovieCard 
              movie={movie} 
              onDelete={user?.role === 'admin' ? handleDeleteMovie : undefined} 
            />
          </Grid>
        ))}
      </Grid>

      {totalPages > 1 && (
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

export default Search