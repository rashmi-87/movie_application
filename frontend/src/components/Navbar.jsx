import { AppBar, Toolbar, Typography, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Drawer, List, ListItemButton, ListItemText, Divider } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { toast } from 'react-toastify'
import { useState } from 'react'
import MenuIcon from '@mui/icons-material/Menu'

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleBulkImport = async () => {
    setConfirmOpen(true)
  }

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const confirmImport = async () => {
    setConfirmOpen(false)
    try {
      const response = await api.post('/movies/import')
      toast.info(response.data.message || 'Import started — movies will be added shortly', { autoClose: false })
      // Navigate to home so user can watch the collection
      navigate('/', { state: { importing: true } })
    } catch (error) {
      toast.error('Import failed: ' + (error.response?.data?.message || 'Unknown error'), { autoClose: 8000 })
    }
  }

  return (
    <>
    <AppBar position="sticky" sx={{ background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)', boxShadow: 'none' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, minHeight: 70 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 800, letterSpacing: '-0.025em' }}>
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
              <Box sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: '12px', 
                background: 'linear-gradient(135deg, #3f51b5 0%, #f50057 100%)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontWeight: 800, 
                fontSize: '1.2rem',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(63, 81, 181, 0.3)'
              }}>M</Box>
              <Box>
                <span style={{ background: 'linear-gradient(to right, #fff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MovieWind</span>
              </Box>
            </Link>
          </Typography>
        </Box>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
          <Button color="inherit" component={Link} to="/" sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'rgba(63, 81, 181, 0.08)' } }}>Home</Button>
          <Button color="inherit" component={Link} to="/search" sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'rgba(63, 81, 181, 0.08)' } }}>Search</Button>
          {isAuthenticated ? (
            <>
              {user?.role === 'admin' && (
                <>
                  <Button variant="outlined" color="primary" component={Link} to="/admin/add-movie" sx={{ borderColor: 'rgba(255,255,255,0.2)' }}>Add Movie</Button>
                  <Button variant="contained" color="secondary" onClick={handleBulkImport} sx={{ px: 3, borderRadius: '50px' }}>Import</Button>
                </>
              )}
              <Button color="inherit" onClick={handleLogout} sx={{ ml: 1, color: 'text.secondary' }}>Logout</Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login" sx={{ color: 'text.secondary' }}>Login</Button>
              <Button variant="contained" color="primary" component={Link} to="/register" sx={{ borderRadius: '50px', px: 3 }}>Register</Button>
            </>
          )}
        </Box>
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <IconButton color="inherit" onClick={() => setMobileOpen(true)}>
            <MenuIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>

    <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)}>
      <Box sx={{ width: 260 }}>
        <List>
          <ListItemButton component={Link} to="/" onClick={() => setMobileOpen(false)}>
            <ListItemText primary="Home" />
          </ListItemButton>
          <ListItemButton component={Link} to="/search" onClick={() => setMobileOpen(false)}>
            <ListItemText primary="Search" />
          </ListItemButton>
          {isAuthenticated ? (
            <>
              {user?.role === 'admin' && (
                <>
                  <ListItemButton component={Link} to="/admin/add-movie" onClick={() => setMobileOpen(false)}>
                    <ListItemText primary="Add Movie" />
                  </ListItemButton>
                  <ListItemButton onClick={() => { setMobileOpen(false); handleBulkImport() }}>
                    <ListItemText primary="Import Top 250" />
                  </ListItemButton>
                </>
              )}
              <Divider />
              <ListItemButton onClick={() => { setMobileOpen(false); handleLogout() }}>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </>
          ) : (
            <>
              <Divider />
              <ListItemButton component={Link} to="/login" onClick={() => setMobileOpen(false)}>
                <ListItemText primary="Login" />
              </ListItemButton>
              <ListItemButton component={Link} to="/register" onClick={() => setMobileOpen(false)}>
                <ListItemText primary="Register" />
              </ListItemButton>
            </>
          )}
        </List>
      </Box>
    </Drawer>

    <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
      <DialogTitle>Import IMDb Top 250</DialogTitle>
      <DialogContent>
        Import IMDb Top 250 movies? This will add movies to the queue.
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
        <Button onClick={confirmImport} autoFocus>Import</Button>
      </DialogActions>
    </Dialog>
    </>
  )
}

export default Navbar
