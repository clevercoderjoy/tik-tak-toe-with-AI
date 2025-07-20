import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { IoMdCloseCircleOutline } from 'react-icons/io';

const Portal = ({ children, onClose }) => {
  const portalRoot = document.querySelector('.portal-root');

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target.id === 'modal-backdrop') {
      onClose();
    }
  };

  if (!portalRoot) return null;

  return createPortal(
    <div
      id="modal-backdrop"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-opacity"
    >
      <div className="relative bg-white rounded-xl shadow-xl p-8 min-w-[320px] max-w-[90%] border border-gray-300">
        {onClose && (
          <button
            className="absolute top-1 right-1 hover:text-white hover:bg-black rounded-full transition-colors"
            onClick={onClose}
            aria-label="Close Modal"
          >
            <IoMdCloseCircleOutline size={30} />
          </button>
        )}
        {children}
      </div>
    </div>,
    portalRoot
  );
};

export default Portal;
