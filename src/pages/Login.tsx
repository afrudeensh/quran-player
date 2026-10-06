import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [msg, setMsg] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    const { error } =
      mode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })
    if (error) return setMsg(error.message)
    if (mode === 'signup') return setMsg('Check your email to confirm, then log in.')
    nav('/')
  }

  return (
    <div className="app-bg flex min-h-dvh items-center justify-center p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 shadow-xl"
      >
        <h1 className="text-2xl font-bold text-emerald-800">
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h1>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded-lg border p-3"
        />
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-lg border p-3"
        />
        <button className="w-full rounded-lg bg-emerald-600 p-3 font-semibold text-white hover:bg-emerald-700">
          {mode === 'login' ? 'Log in' : 'Sign up'}
        </button>
        {msg && <p className="text-sm text-rose-600">{msg}</p>}
        <button
          type="button"
          className="text-sm text-emerald-700 underline"
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
        >
          {mode === 'login' ? 'New here? Create an account' : 'Have an account? Log in'}
        </button>
      </form>
    </div>
  )
}