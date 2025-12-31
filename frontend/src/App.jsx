import { Routes, Route, Navigate } from 'react-router-dom'
import { Container, Box } from '@mui/material'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Search from './pages/Search'
import Login from './pages/Login'
import Register from './pages/Register'
import AddMovie from './pages/AddMovie'
import EditMovie from './pages/EditMovie'
import ProtectedRoute from './components/ProtectedRoute'
import MovieDetail from './pages/MovieDetail'
import { useAuth } from './context/AuthContext'
import { CircularProgress } from '@mui/material'

function App() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <CircularProgress />
        </Box>
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </>
    )
  }

  const content = !isAuthenticated ? (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Container>
    </Box>
  ) : (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route 
            path="/admin/add-movie" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AddMovie />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/edit-movie/:id" 
            element={
              <ProtectedRoute requiredRole="admin">
                <EditMovie />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Container>
    </Box>
  )

  return (
    <>
      {content}
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  )
}

export default App
