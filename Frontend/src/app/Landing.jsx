import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { validateRoomName } from "../lib/roomSlug.js"

function Landing() {
  const navigate = useNavigate()
  const [ error, setError ] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    const username = e.target.username.value.trim()
    const roomInput = e.target.roomName.value

    if (!username) {
      setError("Please enter a username.")
      return
    }

    const result = validateRoomName(roomInput)
    if (!result.valid) {
      setError(result.error)
      return
    }

    setError("")
    navigate(`/${result.slug}?username=${encodeURIComponent(username)}`)
  }

  return (
    <main className="h-screen w-full bg-gray-950 flex gap-4 p-4 items-center justify-center">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white text-center">Join a Room</h1>
        <input
          type="text"
          placeholder="Enter your username"
          className="p-2 rounded-lg bg-gray-800 text-white"
          name="username"
          autoComplete="username"
        />
        <input
          type="text"
          placeholder="Room name (e.g. my-project)"
          className="p-2 rounded-lg bg-gray-800 text-white"
          name="roomName"
          autoComplete="off"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          className="p-2 rounded-lg bg-amber-50 text-gray-950 font-bold"
        >
          Create / Join Room
        </button>
      </form>
    </main>
  )
}

export default Landing
