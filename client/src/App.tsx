import { Route, Routes } from 'react-router';
import './App.css';
import HomeScreen from './components/HomeScreen';
import { useAuth } from './providers/AuthProvider';
import LoginScreen from './components/LoginScreen';
import AppScreen from './components/AppScreen';

function App() {
  const authState = useAuth();



  return (
    authState.authState.checkingSession ? (
      <AppScreen>
        <div>Checking session...</div>
      </AppScreen>
    ) :
      (
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/login" element={<LoginScreen />} />
        </Routes>
      )
  )
}

export default App
