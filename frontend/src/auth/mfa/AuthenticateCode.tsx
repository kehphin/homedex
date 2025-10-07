import { useState } from 'react'
import FormErrors from '../../components/FormErrors'
import { AuthService } from '../AuthService'
import { Flows, REDIRECT_URLs } from '../constants'
import { useAuthInfo } from '../hooks'
import { Navigate, useNavigate } from 'react-router-dom'
import AuthenticateFlow from './AuthenticateFlow'
import { AuthenticatorType, AuthState } from '../types'
import { pathForPendingFlow } from '../routing'

interface Response {
  fetching: boolean
  content: AuthState | null
}

interface AuthenticateCodeProps {
  authenticatorType?: AuthenticatorType
  children: React.ReactNode
}

export default function AuthenticateCode(props: AuthenticateCodeProps) {
  const [code, setCode] = useState('')
  const [response, setResponse] = useState<Response>({ fetching: false, content: null })
  const authInfo = useAuthInfo()
  const navigate = useNavigate()

  if (authInfo?.pendingFlow?.id !== Flows.MFA_AUTHENTICATE) {
    return <Navigate to='/' />
  }

  function submit() {
    setResponse({ ...response, fetching: true })
    AuthService.mfaAuthenticate(code).then((content) => {
      setResponse((r) => { return { ...r, content } })
      if (content.status === 200) {
        // Successful authentication
        navigate(REDIRECT_URLs.LOGIN_REDIRECT_URL)
      } else if (content.status === 401) {
        // Check for pending flow
        const pendingFlow = content.data?.flows?.find(flow => flow.is_pending)
        if (pendingFlow) {
          const path = pathForPendingFlow(content)
          if (path) {
            navigate(path)
          } else {
            console.error('No path found for pending flow:', pendingFlow)
          }
        }
      }

    }).catch((e) => {
      console.error(e)
    }).then(() => {
      setResponse((r) => { return { ...r, fetching: false } })
    })
  }

  return (
    <AuthenticateFlow>
      <div className="space-y-4">
        {props.children}
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Authentication Code</span>
          </label>
          <input 
            type="text" 
            placeholder="Enter your code" 
            className="input input-bordered w-full" 
            value={code} 
            onChange={(e) => setCode(e.target.value)} 
          />
          <FormErrors param='code' errors={response.content?.errors ?? []} />
        </div>

        <button 
          className={`btn btn-primary w-full ${response.fetching ? 'loading' : ''}`} 
          onClick={() => submit()} 
          disabled={response.fetching}
        >
          Sign In
        </button>
      </div>
    </AuthenticateFlow>
  )
}