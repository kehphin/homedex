import AuthenticateCode from './AuthenticateCode'
import { AuthenticatorType } from '../constants'

export default function AuthenticateRecoveryCodes () {
  return (
    <AuthenticateCode authenticatorType={AuthenticatorType.TOTP}>
      <p>Please enter an authenticator code:</p>
    </AuthenticateCode>
  )
}
