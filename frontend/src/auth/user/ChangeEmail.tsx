import React, { useState, useEffect } from "react";
import FormErrors from "../../components/FormErrors";
import { AuthService } from "../AuthService";
import {
  EmailAddress,
  EmailAddressesResponse,
  StatusMessageResponse,
} from "../types";

const ChangeEmail: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [emailAddresses, setEmailAddresses] = useState<EmailAddress[]>([]);
  const [response, setResponse] = useState<{
    fetching: boolean;
    content: EmailAddressesResponse | StatusMessageResponse;
  }>({
    fetching: false,
    content: { status: 200, data: [] },
  });

  useEffect(() => {
    const fetchEmailAddresses = async () => {
      setResponse((r) => ({ ...r, fetching: true }));
      try {
        const resp = await AuthService.getEmailAddresses();
        setResponse((r) => ({ ...r, content: resp }));
        if (resp.status === 200) {
          setEmailAddresses(resp.data);
        }
      } catch (error) {
        console.error("Failed to fetch email addresses:", error);
        setResponse((r) => ({
          ...r,
          content: {
            status: 400,
            errors: [
              { param: null, message: "Failed to fetch email addresses" },
            ],
          },
        }));
      } finally {
        setResponse((r) => ({ ...r, fetching: false }));
      }
    };

    fetchEmailAddresses();
  }, []);

  const addEmail = async () => {
    setResponse((r) => ({ ...r, fetching: true }));
    try {
      const resp = await AuthService.addEmail(email);
      setResponse((r) => ({ ...r, content: resp }));
      if (resp.status === 200) {
        setEmailAddresses(resp.data);
        setEmail("");
      }
    } catch (error) {
      console.error("Failed to add email:", error);
      setResponse((r) => ({
        ...r,
        content: {
          status: 400,
          errors: [{ param: null, message: "Failed to add email" }],
        },
      }));
    } finally {
      setResponse((r) => ({ ...r, fetching: false }));
    }
  };

  const requestEmailVerification = async (email: string) => {
    setResponse((r) => ({ ...r, fetching: true }));
    try {
      const resp = await AuthService.requestEmailVerification(email);
      setResponse((r) => ({ ...r, content: resp }));
    } catch (error) {
      console.error("Failed to request email verification:", error);
      setResponse((r) => ({
        ...r,
        content: {
          status: 400,
          errors: [
            { param: null, message: "Failed to request email verification" },
          ],
        },
      }));
    } finally {
      setResponse((r) => ({ ...r, fetching: false }));
    }
  };

  const deleteEmail = async (email: string) => {
    setResponse((r) => ({ ...r, fetching: true }));
    try {
      const resp = await AuthService.deleteEmail(email);
      setResponse((r) => ({ ...r, content: resp }));
      if (resp.status === 200) {
        setEmailAddresses(resp.data);
      }
    } catch (error) {
      console.error("Failed to delete email:", error);
      setResponse((r) => ({
        ...r,
        content: {
          status: 400,
          errors: [{ param: null, message: "Failed to delete email" }],
        },
      }));
    } finally {
      setResponse((r) => ({ ...r, fetching: false }));
    }
  };

  const markAsPrimary = async (email: string) => {
    setResponse((r) => ({ ...r, fetching: true }));
    try {
      const resp = await AuthService.markEmailAsPrimary(email);
      setResponse((r) => ({ ...r, content: resp }));
      if (resp.status === 200) {
        setEmailAddresses(resp.data);
      }
    } catch (error) {
      console.error("Failed to mark email as primary:", error);
      setResponse((r) => ({
        ...r,
        content: {
          status: 400,
          errors: [{ param: null, message: "Failed to mark email as primary" }],
        },
      }));
    } finally {
      setResponse((r) => ({ ...r, fetching: false }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 mx-auto">
      <div className="mt-10">
        <h1 className="text-3xl font-bold mb-6">Change Email</h1>

        <div className="bg-base-100 rounded-box border border-gray-200 overflow-hidden mb-8">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Email</th>
                <th>Verified</th>
                <th>Primary</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {emailAddresses.map((ea) => (
                <tr key={ea.email}>
                  <td>{ea.email}</td>
                  <td>{ea.verified ? "✅" : "❌"}</td>
                  <td>
                    <input
                      type="radio"
                      className="radio radio-primary"
                      checked={ea.primary}
                      onChange={() => markAsPrimary(ea.email)}
                    />
                  </td>
                  <td>
                    {!ea.verified && (
                      <button
                        className="btn btn-sm btn-outline mr-2"
                        onClick={() => requestEmailVerification(ea.email)}
                        disabled={response.fetching}
                      >
                        Resend
                      </button>
                    )}
                    {!ea.primary && (
                      <button
                        className="btn btn-sm btn-error"
                        onClick={() => deleteEmail(ea.email)}
                        disabled={response.fetching}
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-base-100 p-6 rounded-box border border-gray-200">
          <h2 className="text-2xl font-bold mb-4">Add Email</h2>

          <FormErrors errors={response.content.errors ?? []} />

          <div className="form-control">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              placeholder="Enter new email"
              className="input input-bordered"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <FormErrors param="email" errors={response.content.errors ?? []} />
          </div>
          <button
            className={`btn btn-primary mt-4 ${
              response.fetching ? "loading" : ""
            }`}
            disabled={response.fetching}
            onClick={addEmail}
          >
            Add Email
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeEmail;
