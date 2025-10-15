export default function VerificationEmailSent() {
  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center">
      <div className="card w-96 bg-base-100 border border-gray-200">
        <div className="card-body items-center text-center">
          <h1 className="card-title text-2xl font-bold mb-4">
            Confirm Email Address
          </h1>

          <p className="mt-4">
            A verification link has been sent to your email address. Please
            click on the link to complete the verification process.
          </p>
        </div>
      </div>
    </div>
  );
}
