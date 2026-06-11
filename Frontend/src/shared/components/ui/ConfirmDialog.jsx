const ConfirmDialog = ({ message, onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-[#2f1f0b]/35 p-4 backdrop-blur-sm duration-200 fade-in">
            <div className="premium-marble-surface premium-soft-shadow w-full max-w-sm animate-in rounded-4xl border border-[#d7bc73]/50 p-8 duration-200 zoom-in-95">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl border border-red-200 bg-red-50/80 shadow-[0_14px_30px_rgba(185,28,28,0.1)]">
                    <span className="text-3xl text-red-700">⚠</span>
                </div>

                <h3 className="mb-2 text-center text-xl font-black text-[#3f2c12]">
                    ¿Confirmar eliminación?
                </h3>

                <p className="mb-8 text-center text-sm leading-6 text-[#7a6849]">
                    {message}
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 rounded-2xl border border-[#d7bc73]/55 bg-white/45 py-3 text-sm font-black text-[#6f5a33] transition-all hover:bg-white/85 hover:text-[#3f2c12]"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={onConfirm}
                        className="flex-1 rounded-2xl bg-red-700 py-3 text-sm font-black text-white shadow-[0_14px_30px_rgba(185,28,28,0.22)] transition-all hover:bg-red-800"
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmDialog