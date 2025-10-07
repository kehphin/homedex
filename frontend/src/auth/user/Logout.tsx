import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AuthService } from "../AuthService";
import { StatusMessageResponse } from "../types";
import { REDIRECT_URLs } from "../constants";

const Logout: React.FC = () => {
  const navigate = useNavigate();

  const [response, setResponse] = useState<{
    fetching: boolean;
    content: StatusMessageResponse | null;
  }>({
    fetching: false,
    content: null,
  });

  const submit = async () => {
    setResponse((r) => ({ ...r, fetching: true }));
    try {
      const content = await AuthService.logout();
      setResponse((r) => ({ ...r, content }));
      dispatchEvent(new Event("allauth.auth.change"));
    } catch (e) {
      console.error(e);
    } finally {
      setResponse((r) => ({ ...r, fetching: false }));
      // navigate to login page after logout
      navigate("/");
    }
  };

  if (response.content) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center">
      <div className="card w-96 bg-base-100">
        <div className="card-body">
          <h1 className="card-title text-2xl font-bold mb-4">Logout</h1>
          <p className="mb-6">Are you sure you want to logout?</p>
          <div className="card-actions justify-end">
            <button
              className={`btn btn-primary ${
                response.fetching ? "loading" : ""
              }`}
              disabled={response.fetching}
              onClick={submit}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logout;
