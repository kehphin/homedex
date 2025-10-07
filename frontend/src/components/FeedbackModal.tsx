import React, { useState } from 'react';

export const FeedbackModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [feedback, setFeedback] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ feedback });
    setFeedback('');
    onClose();
  };

  return (
    <dialog id="feedback_modal" className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg">Submit Feedback</h3>
        <p className="py-4">Got a bug or problem to report? Let us know!</p>
        <form onSubmit={handleFormSubmit}>
          <textarea
            className="textarea textarea-bordered w-full"
            placeholder="Enter feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required
          ></textarea>
          <div className="modal-action">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};