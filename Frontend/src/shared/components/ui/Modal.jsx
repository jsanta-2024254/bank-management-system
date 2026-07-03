const Modal = ({ title, onClose, children }) => {
    return (
        <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-[#2f1f0b]/35 p-4 backdrop-blur-sm duration-200 fade-in">
            <div className="premium-marble-surface premium-soft-shadow flex max-h-[90vh] w-full max-w-xl animate-in flex-col overflow-hidden rounded-4xl border border-[#d7bc73]/50 duration-200 zoom-in-95">
                <div className="relative flex shrink-0 items-center justify-between border-b border-[#d7bc73]/38 px-7 py-5">
                    <div className="premium-gold-line absolute bottom-0 left-8 right-8 h-px" />

                    <h2 className="text-2xl font-black tracking-tight text-[#3f2c12]">
                        {title}
                    </h2>

                    <button
                        onClick={onClose}
                        className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#d7bc73]/45 bg-white/45 text-[#8a611b] transition-all hover:bg-white/85 hover:text-[#3f2c12]"
                    >
                        ✕
                    </button>
                </div>

                <div className="custom-scrollbar overflow-y-auto">
                    <div className="p-7">{children}</div>
                </div>
            </div>
        </div>
    )
}

export default Modal