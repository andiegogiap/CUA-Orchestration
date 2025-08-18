import React from 'react';

interface ModalProps {
    title: string;
    message: string;
    isOpen: boolean;
    onClose: () => void;
    isError?: boolean;
}

const Modal: React.FC<ModalProps> = ({ title, message, isOpen, onClose, isError = false }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="glass neon p-8 max-w-sm w-full text-center">
                <h3 className={`text-2xl font-bold mb-4 ${isError ? 'text-red-400' : 'text-white'}`}>{title}</h3>
                <p className="text-gray-200 mb-6">{message}</p>
                <button 
                    onClick={onClose} 
                    className={`font-bold py-2 px-4 rounded ${isError ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white`}
                >
                    OK
                </button>
            </div>
        </div>
    );
};

export default Modal;