import "./App.css"
import { Editor } from "@monaco-editor/react"
import { MonacoBinding } from "y-monaco"
import { useRef, useMemo, useState, useEffect } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import * as Y from "yjs"
import { SocketIOProvider } from "y-socket.io"

function App() {
  const { roomName } = useParams()
  const [ searchParams, setSearchParams ] = useSearchParams()
  const editorRef = useRef(null)
  const bindingRef = useRef(null)

  const [ username, setUsername ] = useState(() => searchParams.get("username") || "")
  const [ users, setUsers ] = useState([])
  const [ copied, setCopied ] = useState(false)

  const ydoc = useMemo(() => new Y.Doc(), [ roomName ])
  const yText = useMemo(() => ydoc.getText("monaco"), [ ydoc ])

  const handleMount = (editor) => {
    editorRef.current = editor
    editor.focus()

    bindingRef.current = new MonacoBinding(
      yText,
      editorRef.current.getModel(),
      new Set([ editorRef.current ]),
    )
  }

  const handleJoin = (e) => {
    e.preventDefault()
    const name = e.target.username.value.trim()
    if (!name) return

    setUsername(name)
    setSearchParams({ username: name })
  }

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/${roomName}`
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    if (!username || !roomName) return

    const provider = new SocketIOProvider("/", roomName, ydoc, {
      autoConnect: true,
    })

    provider.awareness.setLocalStateField("user", { username })

    const updateUsers = () => {
      const states = Array.from(provider.awareness.getStates().values())
      setUsers(states.filter(state => state.user?.username).map(state => state.user))
    }

    updateUsers()

    provider.awareness.on("change", updateUsers)

    function handleBeforeUnload() {
      provider.awareness.setLocalStateField("user", null)
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      bindingRef.current?.destroy()
      bindingRef.current = null
      provider.disconnect()
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [ username, roomName, ydoc ])

  if (!username) {
    return (
      <main className="h-screen w-full bg-gray-950 flex gap-4 p-4 items-center justify-center">
        <form onSubmit={handleJoin} className="flex flex-col gap-4 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-white text-center">Join {roomName}</h1>
          <input
            type="text"
            placeholder="Enter your username"
            className="p-2 rounded-lg bg-gray-800 text-white"
            name="username"
            autoComplete="username"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                e.currentTarget.form?.requestSubmit()
              }
            }}
          />
          <button
            type="submit"
            className="p-2 rounded-lg bg-amber-50 text-gray-950 font-bold"
          >
            Join Room
          </button>
        </form>
      </main>
    )
  }

  return (
    <main className="h-screen w-full bg-gray-950 flex gap-4 p-4">
      <aside className="h-full w-1/4 bg-amber-50 rounded-lg flex flex-col">
        <div className="p-4 border-b border-gray-300">
          <h2 className="text-lg font-bold text-gray-900">{roomName}</h2>
          <button
            type="button"
            onClick={handleCopyLink}
            className="mt-2 text-sm px-3 py-1 rounded bg-gray-800 text-white hover:bg-gray-700"
          >
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
        <h2 className="text-2xl font-bold p-4 border-b border-gray-300">Users</h2>
        <ul className="p-4 overflow-y-auto">
          {users.map((user, index) => (
            <li key={index} className="p-2 bg-gray-800 text-white rounded mb-2">
              {user.username}
            </li>
          ))}
        </ul>
      </aside>
      <section className="w-3/4 bg-neutral-800 rounded-lg overflow-hidden">
        <Editor
          key={roomName}
          height="100%"
          defaultLanguage="javascript"
          defaultValue="// some comment"
          theme="vs-dark"
          onMount={handleMount}
        />
      </section>
    </main>
  )
}

export default App
