import React from 'react';

interface ModalConfirmacionProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    mensaje: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
}

const ModalConfirmacion: React.FC<ModalConfirmacionProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'CONFIRMAR ACCIÓN',
    mensaje,
    confirmText = 'CONFIRMAR',
    cancelText = 'CANCELAR',
    isDestructive = true
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-2xl p-4 sm:p-6 max-w-md w-full mx-auto sm:mx-4 transform transition-all scale-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    {isDestructive && <span className="mr-2 text-2xl">⚠️</span>}
                    {title}
                </h3>

                <div className="text-gray-600 mb-8 text-lg">
                    {mensaje}
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-bold uppercase tracking-wide"
                        type="button"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`px-5 py-2.5 text-white rounded-lg transition-colors font-bold uppercase tracking-wide shadow-md ${isDestructive
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        type="button"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalConfirmacion;
