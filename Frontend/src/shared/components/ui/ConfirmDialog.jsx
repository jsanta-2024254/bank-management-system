const ConfirmDialog = ({ message, onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-sm shadow-2xl p-8 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-center w-14 h-14 bg-red-500/10 rounded-2xl mx-auto mb-6">
                    <span className="text-red-400 text-2xl">⚠</span>
                </div>
                <h3 className="text-white font-bold text-xl text-center mb-2">¿Confirmar eliminación?</h3>
                <p className="text-zinc-400 text-sm text-center mb-8">{message}</p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 rounded-2xl border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 transition-all text-sm font-bold"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-all shadow-lg shadow-red-500/20"
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmDialog