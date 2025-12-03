import React, { useState } from "react";
import { sendFeedback } from "./FeedbackService";

export const FeedbackModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await sendFeedback({ name, email, message });
      setName("");
      setEmail("");
      setMessage("");
      onClose();
    } catch (error: any) {
      setError(error.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <dialog
      id="feedback_modal"
      className={`modal ${isOpen ? "modal-open" : ""}`}
    >
      <div className="modal-box border border-slate-200 shadow-sm">
        <h3 className="font-bold text-lg">Submit Feedback</h3>
        <p className="py-4">Got a bug or issue to report? Let us know!</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleFormSubmit}>
          <input
            type="text"
            placeholder="Name"
            className="input input-bordered w-full mb-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="input input-bordered w-full mb-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <textarea
            className="textarea textarea-bordered w-full"
            placeholder="Enter feedback"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          ></textarea>
          <div className="modal-action">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onClose}>
          close
        </button>
      </form>
    </dialog>
  );
};
