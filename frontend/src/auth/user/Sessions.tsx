import { useState, useEffect } from "react";
import { useConfig } from "../../auth";
import { AuthService } from "../AuthService";
import { SessionsResponse, Session } from "../types";

interface Response {
  fetching: boolean;
  content: SessionsResponse;
}

export default function Sessions() {
  const config = useConfig();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [response, setResponse] = useState<Response>({
    fetching: false,
    content: { status: 200, data: [] },
  });

  useEffect(() => {
    setResponse((r) => {
      return { ...r, fetching: true };
    });
    AuthService.getSessions()
      .then((resp) => {
        if (resp.status === 200) {
          setSessions(resp.data);
        }
      })
      .then(() => {
        setResponse((r) => {
          return { ...r, fetching: false };
        });
      });
  }, []);

  const otherSessions = sessions.filter((session) => !session.is_current);

  function logout(sessions: Session[]) {
    setResponse({ ...response, fetching: true });
    AuthService.endSessions(sessions.map((s) => s.id))
      .then((resp) => {
        setResponse((r) => {
          return { ...r, content: resp };
        });
        if (resp.status === 200) {
          setSessions(resp.data);
        }
      })
      .catch((e) => {
        console.error(e);
        window.alert(e);
      })
      .then(() => {
        setResponse((r) => {
          return { ...r, fetching: false };
        });
      });
  }

  return (
    <div className="min-h-screen bg-base-100 p-4">
      <div className="mx-auto mt-10">
        <h1 className="text-3xl font-bold mb-6">Sessions</h1>

        <div className="bg-base-100 rounded-lg overflow-x-auto mb-8">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Started At</th>
                <th>IP Address</th>
                <th>Browser</th>
                {config?.data.usersessions.track_activity && (
                  <th>Last Seen At</th>
                )}
                <th>Current</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session, i) => (
                <tr key={i}>
                  <td>{new Date(session.created_at).toLocaleString()}</td>
                  <td>{session.ip}</td>
                  <td>{session.user_agent}</td>
                  {config?.data.usersessions.track_activity && (
                    <td>{session.last_seen_at}</td>
                  )}
                  <td>{session.is_current ? "⭐" : ""}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-error"
                      onClick={() => logout([session])}
                    >
                      Logout
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <button
            className={`btn btn-primary ${response.fetching ? "loading" : ""}`}
            disabled={otherSessions.length <= 1 || response.fetching}
            onClick={() => logout(otherSessions)}
          >
            Logout elsewhere
          </button>
        </div>
      </div>
    </div>
  );
}
