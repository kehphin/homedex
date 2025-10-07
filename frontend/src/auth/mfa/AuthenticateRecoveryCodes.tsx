import AuthenticateCode from './AuthenticateCode'
import { AuthenticatorType } from '../constants'

export default function AuthenticateRecoveryCodes () {
  return (
    <AuthenticateCode authenticatorType={AuthenticatorType.RECOVERY_CODES}>
      <p>Please enter a recovery code:</p>
    </AuthenticateCode>
  )
}
