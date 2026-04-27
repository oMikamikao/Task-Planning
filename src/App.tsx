import { Routes, Route } from 'react-router'
import Sidebar from '@/components/Sidebar'
import Home from './pages/Home'
import Tasks from './pages/Tasks'
import Events from './pages/Events'

export default function App() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-cream">
      <Sidebar />
      <main className="flex-1 h-full overflow-hidden ml-[220px]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/events" element={<Events />} />
        </Routes>
      </main>
    </div>
  )
}
