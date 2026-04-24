const ConfirmModal = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-3">
      
      <div
        className="
          bg-white w-full 
          sm:max-w-sm 
          rounded-t-2xl sm:rounded-xl 
          shadow-lg 
          p-5
        "
      >
        <h2 className="text-lg font-semibold mb-3">
          Confirm Delete
        </h2>

        <p className="text-gray-600 mb-5 text-sm sm:text-base">
          Are you sure you want to delete this employee? This action cannot be undone.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onCancel}
            className="w-full border p-2 rounded hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;