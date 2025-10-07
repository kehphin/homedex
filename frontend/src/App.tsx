// @ts-nocheck
import { AuthContextProvider } from './auth'
import Router from './Router'

const App: React.FC = () => {  return (
    <AuthContextProvider>
      <Router />
    </AuthContextProvider>
  )
}

export default App
