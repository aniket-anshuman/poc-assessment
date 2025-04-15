import { useState } from 'react'
import './App.css'
import LayoutCreateEmptyTemplate from './components/LayoutEditor'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <LayoutCreateEmptyTemplate />
    </>
  )
}

export default App
