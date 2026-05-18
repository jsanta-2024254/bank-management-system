import { motion } from 'framer-motion'
import { Landmark, CreditCard, TrendingUp, Package, ChevronRight } from 'lucide-react'

const normalizarTexto = (valor) =>
    String(valor || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()

const formatearMoneda = (valor) =>
    new Intl.NumberFormat('es-GT', {
        style: 'currency',
        currency: 'GTQ',
    }).format(Number(valor || 0))

const formatearPlazo = (minimo, maximo) => {
    if (minimo && maximo && minimo !== maximo) return `${minimo} a ${maximo} meses`
    if (minimo || maximo) return `${minimo || maximo} meses`
    return 'No definido'
}

const ProductCard = ({ product, onViewDetail }) => {
    const type = normalizarTexto(product.tipo || product.type)
    const esCredito = type.includes('credito') || type.includes('prestamo')
    const montoMinimo = Number(product.montoMinimo || 0)
    const montoMaximo = Number(product.montoMaximo || 0)
    const plazoMinimo = Number(product.plazoMesesMinimo || 0)
    const plazoMaximo = Number(product.plazoMesesMaximo || 0)
    const tasaInteres = product.tasaInteres ?? product.interestRate

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
                ) : type.includes('tarjeta') || esCredito ? (
                    <CreditCard size={28} className="text-blue-500" />
                ) : type.includes('inversion') ? (
                    <TrendingUp size={28} className="text-blue-500" />
                ) : (
                    <Package size={28} className="text-blue-500" />
                )}
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
                {product.nombre || product.name}
            </h3>

            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 mb-4 self-start capitalize">
                {product.tipo || product.type}
            </div>

            <p className="text-zinc-400 text-sm line-clamp-3 mb-6 flex-1">
                {product.descripcion || product.description}
            </p>

            {esCredito ? (
                <div className="mb-6 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-3">
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                                Mínimo
                            </p>
                            <p className="text-white font-black text-sm mt-1">
                                {formatearMoneda(montoMinimo)}
                            </p>
                        </div>

                        <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-3">
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                                Máximo
                            </p>
                            <p className="text-white font-black text-sm mt-1">
                                {formatearMoneda(montoMaximo)}
                            </p>
                        </div>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-3">
                        <p className="text-blue-300 text-[10px] font-black uppercase tracking-widest">
                            Rango permitido
                        </p>
                        <p className="text-zinc-200 text-sm mt-1">
                            Solicite entre <strong>{formatearMoneda(montoMinimo)}</strong> y{' '}
                            <strong>{formatearMoneda(montoMaximo)}</strong>.
                        </p>
                        <p className="text-zinc-400 text-xs mt-1">
                            Plazo: {formatearPlazo(plazoMinimo, plazoMaximo)} · Tasa anual:{' '}
                            {Number(tasaInteres || 0)}%
                        </p>
                    </div>
                </div>
            ) : (
                tasaInteres !== undefined &&
                tasaInteres !== null && (
                    <div className="mb-6">
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                            Tasa de interés
                        </p>
                        <p className="text-emerald-400 font-black text-2xl">
                            {tasaInteres}%
                        </p>
                    </div>
                )
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