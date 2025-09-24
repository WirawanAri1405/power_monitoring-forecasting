import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
       <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-800">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">
        Hello Tailwind + React + TS 🚀
      </h1>
      <p className="text-lg mb-6">
        Kalau kamu lihat teks ini berwarna biru dan layout rapi, berarti Tailwind sudah jalan.
      </p>

      <div className="flex gap-4">
        <button className="px-4 py-2 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700">
          Primary
        </button>
        <button className="px-4 py-2 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300">
          Secondary
        </button>
      </div>
    </div>
    </>
  )
}

export default App
