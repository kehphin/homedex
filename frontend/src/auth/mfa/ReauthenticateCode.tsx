import { useState } from 'react'
import FormErrors from '../../components/FormErrors'
import { AuthService } from '../AuthService'
import { ReauthenticateFlow } from '../user/Reauthenticate'
import Button from '../../components/Button'
import { AuthState } from '../types'

interface Response {
  fetching: boolean;
  content: AuthState | null;
}

export default function ReauthenticateCode (props: { children: React.ReactNode }) {
  const [code, setCode] = useState<string>('')
  const [response, setResponse] = useState<Response>({ fetching: false, content: null })

  function submit () {
    setResponse({ ...response, fetching: true })
    AuthService.mfaReauthenticate(code).then((content) => {
      setResponse((r) => { return { ...r, content } })
    }).catch((e) => {
      console.error(e)
      window.alert(e)
    }).then(() => {
      setResponse((r) => { return { ...r, fetching: false } })
    })
  }
  return (
    <ReauthenticateFlow>
      {props.children}

      <FormErrors errors={response.content?.errors ?? []} />

      <div><label>Code: <input value={code} onChange={(e) => setCode(e.target.value)} type='text' required /></label>
        <FormErrors param='code' errors={response.content?.errors ?? []} />
      </div>
      <Button disabled={response.fetching} onClick={() => submit()}>Confirm</Button>
    </ReauthenticateFlow>
  )
}
