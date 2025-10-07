import React from 'react';
import {
  Navigate,
  useLocation,
  Link
} from 'react-router-dom';
import { pathForPendingFlow, useAuthStatus } from '..';
import { REDIRECT_URLs } from '../constants';

const ProviderCallback: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const error = params.get('error');
  const [auth, status] = useAuthStatus();

  let url: string = REDIRECT_URLs.LOGIN_URL;
  if (status.isAuthenticated) {
    url = REDIRECT_URLs.LOGIN_REDIRECT_URL;
  } else if (auth) {
      url = pathForPendingFlow(auth) || url;
  }

  if (!error) {
    return <Navigate to={url} />;
  }

  return (
    <>
      <h1>Third-Party Login Failure</h1>
      <p>Something went wrong.</p>
      <Link to={url}>Continue</Link>
    </>
  );
};

export default ProviderCallback;