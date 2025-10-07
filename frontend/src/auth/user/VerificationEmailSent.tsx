export default function VerificationEmailSent() {
  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center">
      <div className="card w-96 bg-base-100 border border-gray-200">
        <div className="card-body items-center text-center">
          <h1 className="card-title text-2xl font-bold mb-4">
            Confirm Email Address
          </h1>
          <div className="alert alert-info">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>
              Please check your email inbox and confirm your email address.
            </span>
          </div>
          <p className="mt-4">
            A verification link has been sent to your email address. Please
            click on the link to complete the verification process.
          </p>
        </div>
      </div>
    </div>
  );
}
