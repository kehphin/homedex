import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import PaymentsService from './PaymentsService';

const Success = () => {
  const location = useLocation();
//   const history = useHistory();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const sessionId = query.get('session_id');
    console.log(sessionId)

    if (sessionId) {
      fetchSessionData(sessionId);
    }
  }, [location]);

  const fetchSessionData = async (sessionId: string) => {
    const response = await PaymentsService.getCheckoutSession(sessionId);
    const data = await response;
    setEmail(data.customer_email || '');
    console.log(data.customer_email)
    setLoading(false);
  };

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <Navigate to={'/account/signup?email=' + email} />
        </div>
      )}
    </div>
  );
};

export default Success;