import { BrowserRouter, Routes, Route } from 'react-router-dom'
import TabBar from '@/components/TabBar'
import Home from '@/pages/Home'
import Practice from '@/pages/Practice'
import PracticeDetail from '@/pages/PracticeDetail'
import PracticeResult from '@/pages/PracticeDetail/result'
import Wrong from '@/pages/Wrong'
import Profile from '@/pages/Profile'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/practice/:category" element={<PracticeDetail />} />
        <Route path="/practice/result" element={<PracticeResult />} />
        <Route path="/wrong" element={<Wrong />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      <TabBar />
    </BrowserRouter>
  )
}

export default App
