import { useState, useEffect } from "react";
import { AuthService } from "../AuthService";
import { AuthProcess } from "../constants";
import ProviderList from "./ProviderList";
import FormErrors from "../../components/FormErrors";
import { ProviderAccount, ProviderAccountsResponse } from "../types";

interface Response {
  fetching: boolean;
  content: ProviderAccountsResponse;
}

export default function ManageProviders() {
  const [accounts, setAccounts] = useState<ProviderAccount[]>([]);
  const [response, setResponse] = useState<Response>({
    fetching: false,
    content: { status: 200, data: [] },
  });

  useEffect(() => {
    setResponse((r) => {
      return { ...r, fetching: true };
    });
    AuthService.getProviderAccounts()
      .then((resp) => {
        if (resp.status === 200) {
          setAccounts(resp.data);
        }
      })
      .then(() => {
        setResponse((r) => {
          return { ...r, fetching: false };
        });
      });
  }, []);

  function disconnect(account: ProviderAccount) {
    setResponse({ ...response, fetching: true });
    AuthService.disconnectProviderAccount(account.provider.id, account.uid)
      .then((resp) => {
        setResponse((r) => {
          return { ...r, content: resp };
        });
        if (resp.status === 200) {
          setAccounts(resp.data);
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
    <div className="p-4 mx-auto min-h-screen bg-base-100 mt-10">
      <h1 className="text-3xl font-bold mb-6">Providers</h1>

      <div className="bg-base-100 rounded-lg overflow-x-auto mb-8">
        <table className="table w-full">
          <thead>
            <tr>
              <th>UID</th>
              <th>Account</th>
              <th>Provider</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.uid}>
                <td>{account.uid}</td>
                <td>{account.display}</td>
                <td>{account.provider.name}</td>
                <td>
                  <button
                    className={`btn btn-sm btn-error ${
                      response.fetching ? "loading" : ""
                    }`}
                    onClick={() => disconnect(account)}
                    disabled={response.fetching}
                  >
                    Disconnect
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <FormErrors errors={response.content?.errors ?? []} />

      <div className="bg-base-100 rounded-lg p-6 mt-8">
        <h2 className="text-2xl font-bold mb-4">Connect</h2>
        <ProviderList
          callbackURL="/account/providers"
          process={AuthProcess.CONNECT}
        />
      </div>
    </div>
  );
}
