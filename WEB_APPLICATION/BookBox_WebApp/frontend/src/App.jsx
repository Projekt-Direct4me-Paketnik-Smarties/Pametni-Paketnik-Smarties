import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [words, setWords] = useState("")

  useEffect(() => {
    getWord();
  }, []);

   async function getWord(){ 
    const res = await fetch(`http://localhost:5000/`);
    console.log(res)
    const data = await res.json();
    setWords(data.message)
    console.log(data)
  }
    
  return (
    <p>{words}</p>
  )
}

export default App
