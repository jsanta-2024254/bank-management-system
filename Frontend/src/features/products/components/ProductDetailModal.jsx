import Modal from '../../../shared/components/ui/Modal'
import { CheckCircle2, Info } from 'lucide-react'

const ProductDetailModal = ({ product, onClose }) => {
    if (!product) return null

    return (
        <Modal title={product.nombre || product.name} onClose={onClose}>
            <div className="space-y-8">
                {/* Header Info */}
                <div className="flex flex-wrap gap-3">
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider">
                        {product.tipo || product.type}
                    </span>
                    {product.estado !== undefined && (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            product.estado ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                            {product.estado ? 'Disponible' : 'No disponible'}
                        </span>
                    )}
                </div>

                {/* Description */}
                <div>
                    <h4 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <Info size={14} /> Descripción del Producto
                    </h4>
                    <p className="text-white leading-relaxed">
                        {product.descripcion || product.description}
                    </p>
                </div>

                {/* Grid Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {(product.tasaInteres || product.interestRate) && (
                        <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Tasa de Interés</p>
                            <p className="text-emerald-400 font-black text-3xl">{product.tasaInteres || product.interestRate}%</p>
                        </div>
                    )}
                    {(product.montoMinimo || product.minAmount) && (
                        <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Inversión Mínima</p>
                            <p className="text-white font-black text-2xl">Q{product.montoMinimo || product.minAmount}</p>
                        </div>
                    )}
                </div>

                {/* Requirements / Benefits Placeholder (if needed) */}
                <div className="space-y-4">
                    <h4 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Beneficios Principales</h4>
                    <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center gap-3 text-zinc-300 text-sm">
                            <CheckCircle2 size={16} className="text-blue-500" />
                            Gestión 100% digital desde tu banca en línea.
                        </div>
                        <div className="flex items-center gap-3 text-zinc-300 text-sm">
                            <CheckCircle2 size={16} className="text-blue-500" />
                            Sin cobros ocultos por mantenimiento de cuenta.
                        </div>
                        <div className="flex items-center gap-3 text-zinc-300 text-sm">
                            <CheckCircle2 size={16} className="text-blue-500" />
                            Seguridad garantizada por nuestro sistema de protección.
                        </div>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20"
                >
                    Entendido
                </button>
            </div>
        </Modal>
    )
}

export default ProductDetailModal
