import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Editor from './pages/Editor'
import { Toaster } from 'react-hot-toast';

function App() {

  return (
    <>
      <div>
        <Toaster position='top-right'/>
      </div>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home/>} />
          <Route path='/editor/:roomId' element={<Editor/>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
