import { motion } from 'framer-motion'
import {
    Landmark,
    CreditCard,
    TrendingUp,
    Package,
    ChevronRight,
    BadgeDollarSign,
    CalendarDays,
    Percent,
} from 'lucide-react'

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

const ProductIcon = ({ type, esCredito }) => {
    if (type.includes('cuenta') || type.includes('ahorro')) {
        return <Landmark size={26} className="text-[#5b3a0d]" />
    }

    if (type.includes('tarjeta') || esCredito) {
        return <CreditCard size={26} className="text-[#5b3a0d]" />
    }

    if (type.includes('inversion')) {
        return <TrendingUp size={26} className="text-[#5b3a0d]" />
    }

    return <Package size={26} className="text-[#5b3a0d]" />
}

const ProductCard = ({ product, onViewDetail }) => {
    const type = normalizarTexto(product.tipo || product.type)
    const esCredito = type.includes('credito') || type.includes('prestamo')
    const esSuscripcion = type.includes('suscripcion')
    const esInversion = type.includes('inversion')
    const montoMinimo = Number(product.montoMinimo || 0)
    const montoMaximo = Number(product.montoMaximo || 0)
    const plazoMinimo = Number(product.plazoMesesMinimo || 0)
    const plazoMaximo = Number(product.plazoMesesMaximo || 0)
    const tasaInteres = product.tasaInteres ?? product.interestRate
    const precio = Number(product.precio || 0)
    const descuento = Number(product.descuentoAppPorcentaje || 0)
    const precioFinal = precio - precio * (descuento / 100)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="group relative flex h-full flex-col overflow-hidden rounded-4xl border border-[#d7bc73]/45 bg-[#fffaf0]/72 p-6 shadow-[0_20px_55px_rgba(92,64,19,0.1)] backdrop-blur-xl transition-all duration-300 hover:border-[#b98219]/55 hover:bg-white/78 hover:shadow-[0_26px_70px_rgba(92,64,19,0.16)]"
        >
            <div className="pointer-events-none absolute -right-14 -top-14 h-32 w-32 rounded-full bg-[#d9b45e]/16 blur-3xl transition-all duration-300 group-hover:bg-[#d9b45e]/25" />
            <div className="premium-gold-line absolute left-8 right-8 top-0 h-px" />

            <div className="relative mb-6 flex items-start justify-between gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-[#c89b3c]/50 bg-linear-to-br from-[#fff8df] via-[#ead190] to-[#9a6b16] shadow-[0_16px_34px_rgba(154,107,22,0.22)]">
                    <ProductIcon type={type} esCredito={esCredito} />
                </div>

                <span className="rounded-full border border-[#d7bc73]/50 bg-[#fff8df] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#8a611b]">
                    {product.tipo || product.type}
                </span>
            </div>

            <h3 className="relative mb-2 text-xl font-black leading-tight text-[#3f2c12]">
                {product.nombre || product.name}
            </h3>

            <p className="relative mb-6 line-clamp-3 flex-1 text-sm leading-6 text-[#7a6849]">
                {product.descripcion || product.description}
            </p>

            {esCredito ? (
                <div className="relative mb-6 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-[#d7bc73]/40 bg-white/42 p-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#8a611b]/70">
                                Mínimo
                            </p>

                            <p className="mt-1 text-sm font-black text-[#3f2c12]">
                                {formatearMoneda(montoMinimo)}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-[#d7bc73]/40 bg-white/42 p-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#8a611b]/70">
                                Máximo
                            </p>

                            <p className="mt-1 text-sm font-black text-[#3f2c12]">
                                {formatearMoneda(montoMaximo)}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#d7bc73]/45 bg-[#fff8df]/65 p-4">
                        <p className="mb-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-[#8a611b]/70">
                            <BadgeDollarSign size={13} />
                            Rango permitido
                        </p>

                        <p className="text-sm leading-6 text-[#7a6849]">
                            Solicite entre{' '}
                            <span className="font-black text-[#3f2c12]">
                                {formatearMoneda(montoMinimo)}
                            </span>{' '}
                            y{' '}
                            <span className="font-black text-[#3f2c12]">
                                {formatearMoneda(montoMaximo)}
                            </span>
                            .
                        </p>

                        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-[#8a6a3a]">
                            <span className="inline-flex items-center gap-1">
                                <CalendarDays size={12} />
                                {formatearPlazo(plazoMinimo, plazoMaximo)}
                            </span>

                            <span className="inline-flex items-center gap-1">
                                <Percent size={12} />
                                {Number(tasaInteres || 0)}% anual
                            </span>
                        </p>
                    </div>
                </div>
            ) : (
                <div className="relative mb-6 space-y-3">
                    <div className="rounded-2xl border border-[#d7bc73]/40 bg-white/42 p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#8a611b]/70">
                            {esSuscripcion ? 'Pago mensual' : esInversion ? 'Monto de inversión' : 'Precio'}
                        </p>

                        <p className="mt-1 text-2xl font-black text-[#3f2c12]">
                            {formatearMoneda(precioFinal)}
                        </p>

                        {descuento > 0 && (
                            <p className="mt-1 text-xs font-black text-emerald-700">
                                {descuento}% de descuento app
                            </p>
                        )}
                    </div>

                    {tasaInteres !== undefined && tasaInteres !== null && Number(tasaInteres) > 0 && (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/85 p-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-700">
                                Tasa de interés
                            </p>

                            <p className="mt-1 text-2xl font-black text-emerald-700">
                                {tasaInteres}%
                            </p>
                        </div>
                    )}
                </div>
            )}

            <button
                onClick={() => onViewDetail(product)}
                className="relative mt-auto flex w-full items-center justify-center gap-2 rounded-2xl border border-[#d7bc73]/55 bg-white/55 py-4 text-sm font-black text-[#6f4d13] shadow-[0_12px_26px_rgba(92,64,19,0.08)] transition-all hover:border-[#b98219]/60 hover:bg-linear-to-r hover:from-[#b98219] hover:via-[#d9b45e] hover:to-[#8a611b] hover:text-white"
            >
                Más información
                <ChevronRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                />
            </button>
        </motion.div>
    )
}

export default ProductCard