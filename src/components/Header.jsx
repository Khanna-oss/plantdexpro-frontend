import React, { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function Header(){
  const [dark, setDark] = useState(false)
  useEffect(()=> {
    if (dark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [dark])

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm py-4 mb-4">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌿</span>
          <h1 className="text-xl font-semibold">PlantDexPro</h1>
        </div>
        <button
          aria-label="Toggle dark mode"
          onClick={()=>setDark(!dark)}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {dark ? <Sun /> : <Moon />}
        </button>
      </div>
    </header>
  )
}
