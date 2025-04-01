import { Route, Routes } from 'react-router';
import HomeScreen from './components/HomeScreen';
import { useAuth } from './providers/AuthProvider';
import LoginScreen from './components/LoginScreen';
import AppScreen from './components/AppScreen';
import { ChatScreen } from './components/ChatScreen';

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
          <Route path="/chat/:id" element={<ChatScreen/>} />
        </Routes>
      )
  )
}

export default App
