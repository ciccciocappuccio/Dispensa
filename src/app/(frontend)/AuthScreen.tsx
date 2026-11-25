'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Leaf, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { loginAction, signupAction } from './actions'

export function AuthScreen() {
  const router = useRouter()
  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setPending(true)
    const result = mode === 'signup'
      ? await signupAction({ name, email, password })
      : await loginAction({ email, password })
    setPending(false)

    if (!result.ok) {
      setError(result.error)
      return
    }
    router.refresh()
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-copy">
          <div className="brand">
            <span className="brand-mark"><Leaf /></span>
            <span>dispensa</span>
          </div>
          <div className="auth-heading">
            <p className="eyebrow">{mode === 'signup' ? 'Crea il tuo spazio' : 'Bentornato'}</p>
            <h1>{mode === 'signup' ? 'La tua dispensa, sempre con te.' : 'Rientra nella tua dispensa.'}</h1>
            <p>
              {mode === 'signup'
                ? 'Salva prodotti, scadenze e preferenze e ritrovali su ogni dispositivo.'
                : 'Accedi con le tue credenziali per ritrovare prodotti e storico.'}
            </p>
          </div>

          <form className="auth-form" onSubmit={submit}>
            {mode === 'signup' && (
              <label>
                <span>Come vuoi essere chiamato</span>
                <div><UserRound /><input value={name} onChange={(event) => setName(event.target.value)} maxLength={40} placeholder="es. Marco" autoComplete="given-name" required /></div>
              </label>
            )}
            <label>
              <span>Email</span>
              <div><Mail /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nome@esempio.it" autoComplete="email" required /></div>
            </label>
            <label>
              <span>Password</span>
              <div><LockKeyhole /><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} placeholder="Almeno 8 caratteri" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required /></div>
            </label>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="primary-button auth-submit" type="submit" disabled={pending}>
              {pending ? 'Attendi…' : mode === 'signup' ? 'Crea account' : 'Accedi'}
              {!pending && <ChevronRight />}
            </button>
          </form>

          <button
            className="auth-switch"
            type="button"
            onClick={() => {
              setError('')
              setMode(mode === 'signup' ? 'login' : 'signup')
            }}
          >
            {mode === 'signup' ? 'Hai già un account? Accedi' : 'Non hai un account? Registrati'}
          </button>
        </div>
        <aside className="auth-visual" aria-hidden="true">
          <div className="visual-center"><Leaf /></div>
          <p>Quello che hai.<br />Prima che scada.</p>
        </aside>
      </section>
    </main>
  )
}
