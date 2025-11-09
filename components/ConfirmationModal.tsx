import React from 'react';
import Modal from './Modal';
import { ExclamationTriangleIcon } from './icons/Icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message?: string;
  children?: React.ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message, children }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex items-start">
        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-destructive/10 sm:mx-0 sm:h-10 sm:w-10">
          <ExclamationTriangleIcon className="h-6 w-6 text-destructive" />
        </div>
        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <p className="text-lg leading-6 font-medium text-foreground">{title}</p>
          <div className="mt-2">
            {children ? children : <p className="text-sm text-muted-foreground">{message}</p>}
          </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        <button
          type="button"
          className="inline-flex w-full justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-destructive text-base font-medium text-destructive-foreground hover:bg-destructive/90 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
          onClick={async () => {
            await onConfirm();
            onClose();
          }}
        >
          Confirm
        </button>
        <button
          type="button"
          className="mt-3 inline-flex w-full justify-center rounded-md border border-input bg-background px-4 py-2 text-base font-medium text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;