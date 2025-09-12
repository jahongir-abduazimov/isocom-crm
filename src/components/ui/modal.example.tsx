import React, { useState } from "react";
import Modal from "../ui/modal";

const ModalExample: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => setIsOpen(true)}
      >
        Open Modal
      </button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Example Modal"
        footer={
          <button
            className="px-4 py-2 bg-gray-200 rounded"
            onClick={() => setIsOpen(false)}
          >
            Close
          </button>
        }
      >
        <p>This is a reusable modal component.</p>
      </Modal>
    </div>
  );
};

export default ModalExample;
