import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Rating,
  CardMedia,
  IconButton
} from '@mui/material'
import { Edit, Delete } from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const MovieCard = ({ movie, onDelete }) => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString()
  }

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRadius: 4,
        overflow: 'hidden',
        backgroundColor: 'background.paper',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          borderColor: 'primary.main',
          '& .MuiCardMedia-root': {
            transform: 'scale(1.05)'
          }
        }
      }}
      onClick={() => navigate(`/movie/${movie._id}`)}
    >
      <Box sx={{ position: 'relative', overflow: 'hidden', paddingTop: '150%' }}>
        <CardMedia
          component="img"
          image={movie.poster || 'https://via.placeholder.com/400x600?text=No+Image'}
          alt={movie.title}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
          }}
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://via.placeholder.com/400x600?text=No+Image' }}
        />
        
        <Box sx={{ 
          position: 'absolute', 
          top: 10, 
          left: 10, 
          bgcolor: 'rgba(0,0,0,0.7)', 
          backdropFilter: 'blur(4px)', 
          px: 1.5, 
          py: 0.5, 
          borderRadius: '8px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 0.5 
        }}>
          <Rating value={1} max={1} readOnly size="small" sx={{ color: '#ffd700' }} />
          <Typography variant="caption" sx={{ color: '#fff', fontWeight: 700 }}>{movie.rating}</Typography>
        </Box>

        {user?.role === 'admin' && (
          <Box sx={{ 
            position: 'absolute', 
            top: 10, 
            right: 10, 
            display: 'flex', 
            gap: 1,
            opacity: 0, 
            transition: 'opacity 0.2s', 
            '.MuiCard-root:hover &': { opacity: 1 } 
          }}>
            <IconButton 
              size="small" 
              sx={{ bgcolor: 'rgba(255,255,255,0.9)', color: 'primary.main', '&:hover': { bgcolor: '#fff' } }} 
              onClick={(e) => { e.stopPropagation(); navigate(`/admin/edit-movie/${movie._id}`) }}
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              sx={{ bgcolor: 'rgba(255,255,255,0.9)', color: 'error.main', '&:hover': { bgcolor: '#fff' } }} 
              onClick={(e) => { e.stopPropagation(); onDelete(movie._id) }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography variant="h6" component="h3" sx={{ 
          fontSize: '1rem', 
          fontWeight: 700, 
          lineHeight: 1.2,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          mb: 0.5
        }}>
          {movie.title}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', bgcolor: 'rgba(255,255,255,0.05)', px: 1, py: 0.5, borderRadius: 1 }}>
            {new Date(movie.releaseDate).getFullYear() || 'N/A'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {formatDuration(movie.duration)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default MovieCard
