import { motion } from 'framer-motion'
import { Landmark, CreditCard, TrendingUp, Package, ChevronRight } from 'lucide-react'

const ProductCard = ({ product, onViewDetail }) => {
    const type = (product.tipo || product.type || '').toLowerCase()

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="bg-zinc-900/60 border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-all flex flex-col h-full"
        >
            <div className="w-14 h-14 rounded-2xl bg-blue-600/10 flex items-center justify-center mb-6">
                {type.includes('cuenta') || type.includes('ahorro') ? (
                    <Landmark size={28} className="text-blue-500" />
                ) : type.includes('tarjeta') || type.includes('credito') ? (
                    <CreditCard size={28} className="text-blue-500" />
                ) : type.includes('inversión') || type.includes('prestamo') ? (
                    <TrendingUp size={28} className="text-blue-500" />
                ) : (
                    <Package size={28} className="text-blue-500" />
                )}
            </div>

            <h3 className="text-xl font-bold text-white mb-2">{product.nombre || product.name}</h3>
            
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 mb-4 self-start capitalize">
                {product.tipo || product.type}
            </div>

            <p className="text-zinc-400 text-sm line-clamp-3 mb-6 flex-1">
                {product.descripcion || product.description}
            </p>

            {(product.tasaInteres || product.interestRate) && (
                <div className="mb-6">
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Tasa de interés</p>
                    <p className="text-emerald-400 font-black text-2xl">
                        {product.tasaInteres || product.interestRate}%
                    </p>
                </div>
            )}

            <button
                onClick={() => onViewDetail(product)}
                className="w-full py-4 bg-zinc-800 hover:bg-blue-600 text-white rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 group"
            >
                Más información
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
        </motion.div>
    )
}

export default ProductCard
