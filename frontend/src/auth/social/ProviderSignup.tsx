import { useState } from 'react'
import FormErrors from '../../components/FormErrors'
import { AuthService } from '../AuthService'
import { Link } from 'react-router-dom'
import Button from '../../components/Button'
import { AuthState } from '../types'

interface Response {
  fetching: boolean
  content: AuthState | null
}

export default function ProviderSignup () {
  const [email, setEmail] = useState<string>('')
  const [response, setResponse] = useState<Response>({ fetching: false, content: null })

  function submit () {
    setResponse({ ...response, fetching: true })
    AuthService.providerSignup({ email }).then((content) => {
      setResponse((r) => { return { ...r, content } })
    }).catch((e) => {
      console.error(e)
      window.alert(e)
    }).then(() => {
      setResponse((r) => { return { ...r, fetching: false } })
    })
  }

  return (
    <div>
      <h1>Sign Up</h1>
      <p>
        Already have an account? <Link to='/account/login'>Login here.</Link>
      </p>

      <FormErrors errors={response.content?.errors ?? []} />

      <div><label>Email <input value={email} onChange={(e) => setEmail(e.target.value)} type='email' required /></label>
        <FormErrors param='email' errors={response.content?.errors ?? []} />
      </div>
      <Button disabled={response.fetching} onClick={() => submit()}>Sign Up</Button>
    </div>
  )
}
