import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Star,
    Trash2,
    Plus,
    Search,
    Hash,
    CreditCard,
    ArrowLeftRight,
    DollarSign,
    AlignLeft,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import useFavoriteStore from '../store/favoriteStore'
import useAccountStore from '../../accounts/store/accountStore'
import FavoriteForm from './FavoriteForm'
import ConfirmDialog from '../../../shared/components/ui/ConfirmDialog'
import Modal from '../../../shared/components/ui/Modal'

const getTipoCuentaLabel = (tipoCuenta) => {
    if (tipoCuenta === 'monetaria') return 'Monetaria'
    if (tipoCuenta === 'ahorro') return 'Ahorro'
    return 'Sin tipo'
}

const getFavoriteAccountNumber = (favorite) => {
    return favorite?.numeroCuenta || favorite?.numeroCuentaDestino || favorite?.cuenta?.numeroCuenta || ''
}

const getFavoriteAccountType = (favorite) => {
    return favorite?.tipoCuenta || favorite?.cuenta?.tipoCuenta || ''
}

const getAccountId = (account) => {
    return account?._id || account?.id || account?.Id
}

const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-GT', {
        style: 'currency',
        currency: 'GTQ',
    }).format(Number(value || 0))
}

const getActiveAccounts = (accounts) => {
    return (accounts || []).filter((account) => account?.estado !== false && account?.tipoCuenta)
}

const buildFallbackAccounts = () => [
    {
        _id: 'monetaria',
        tipoCuenta: 'monetaria',
        numeroCuenta: 'Cuenta monetaria',
        saldo: 0,
    },
    {
        _id: 'ahorro',
        tipoCuenta: 'ahorro',
        numeroCuenta: 'Cuenta de ahorro',
        saldo: 0,
    },
]

const TransferFavoriteModal = ({ favorite, accounts, onClose, onTransferred }) => {
    const { transferToFavorite } = useFavoriteStore()

    const activeAccounts = useMemo(() => {
        const cuentasActivas = getActiveAccounts(accounts)
        return cuentasActivas.length > 0 ? cuentasActivas : buildFallbackAccounts()
    }, [accounts])

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            tipoCuentaOrigen: activeAccounts[0]?.tipoCuenta || 'monetaria',
            monto: '',
            descripcion: '',
        },
    })

    useEffect(() => {
        if (activeAccounts[0]?.tipoCuenta) {
            setValue('tipoCuentaOrigen', activeAccounts[0].tipoCuenta)
        }
    }, [activeAccounts, setValue])

    const onSubmit = async (data) => {
        const toastId = toast.loading('Procesando transferencia...')

        try {
            await transferToFavorite(favorite._id, {
                monto: Number(data.monto),
                tipoCuentaOrigen: data.tipoCuentaOrigen,
                descripcion: data.descripcion?.trim() || undefined,
            })

            toast.success('Transferencia realizada correctamente', { id: toastId })
            onTransferred()
        } catch (error) {
            toast.error(
                error?.response?.data?.message || 'Error al transferir al favorito',
                { id: toastId }
            )
        }
    }

    const inputClass =
        'w-full bg-zinc-900 border border-zinc-800 text-white rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all placeholder:text-zinc-600 text-sm'

    return (
        <Modal title="Transferir a favorito" onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">
                        Destino
                    </p>
                    <p className="text-white font-bold">{favorite.alias}</p>
                    <p className="text-zinc-400 text-sm font-mono mt-1">
                        {getFavoriteAccountNumber(favorite)}
                    </p>
                    <p className="text-zinc-500 text-xs mt-1">
                        Tipo de cuenta destino: {getTipoCuentaLabel(getFavoriteAccountType(favorite))}
                    </p>
                </div>

                <div>
                    <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <CreditCard size={11} /> Cuenta origen
                    </label>
                    <select
                        {...register('tipoCuentaOrigen', {
                            required: 'Seleccione la cuenta origen',
                        })}
                        className={`${inputClass} appearance-none`}
                        disabled={isSubmitting}
                    >
                        {activeAccounts.map((account) => (
                            <option key={getAccountId(account)} value={account.tipoCuenta}>
                                {getTipoCuentaLabel(account.tipoCuenta)} - {account.numeroCuenta}
                                {account.saldo !== undefined ? ` (${formatCurrency(account.saldo)})` : ''}
                            </option>
                        ))}
                    </select>
                    {errors.tipoCuentaOrigen && (
                        <p className="text-red-400 text-xs mt-1.5 ml-1">
                            {errors.tipoCuentaOrigen.message}
                        </p>
                    )}
                    <p className="text-zinc-500 text-xs mt-1.5 ml-1">
                        Esta es la cuenta desde donde saldrá el dinero.
                    </p>
                </div>

                <div>
                    <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <DollarSign size={11} /> Monto
                    </label>
                    <div className="relative">
                        <DollarSign
                            size={14}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                        />
                        <input
                            {...register('monto', {
                                required: 'El monto es requerido',
                                min: { value: 0.01, message: 'Mínimo Q0.01' },
                                max: { value: 2000, message: 'Máximo Q2,000 por transferencia' },
                            })}
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className={`${inputClass} pl-10`}
                            disabled={isSubmitting}
                        />
                    </div>
                    {errors.monto && (
                        <p className="text-red-400 text-xs mt-1.5 ml-1">
                            {errors.monto.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <AlignLeft size={11} /> Descripción opcional
                    </label>
                    <textarea
                        {...register('descripcion')}
                        rows={3}
                        placeholder="Motivo de la transferencia..."
                        className={`${inputClass} resize-none`}
                        disabled={isSubmitting}
                    />
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-4 rounded-2xl text-sm font-semibold transition-all disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl text-sm transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            'Procesando...'
                        ) : (
                            <>
                                <ArrowLeftRight size={17} />
                                Transferir
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    )
}

const FavoriteList = () => {
    const {
        favorites,
        loading,
        error,
        fetchFavorites,
        deleteFavorite,
    } = useFavoriteStore()

    const {
        accounts,
        fetchAccounts,
    } = useAccountStore()

    const [showForm, setShowForm] = useState(false)
    const [confirmId, setConfirmId] = useState(null)
    const [transferTarget, setTransferTarget] = useState(null)
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchFavorites()
        fetchAccounts()
    }, [fetchFavorites, fetchAccounts])

    const handleDelete = async () => {
        const toastId = toast.loading('Eliminando favorito...')

        try {
            await deleteFavorite(confirmId)
            setConfirmId(null)
            toast.success('Favorito eliminado correctamente', { id: toastId })
        } catch (error) {
            toast.error(
                error?.response?.data?.message || 'Error al eliminar el favorito',
                { id: toastId }
            )
        }
    }

    const handleTransferred = async () => {
        setTransferTarget(null)
        await fetchAccounts()
        await fetchFavorites()
    }

    const filtered = favorites.filter((favorite) => {
        const query = search.toLowerCase()
        const alias = favorite.alias || ''
        const numeroCuenta = getFavoriteAccountNumber(favorite)
        const tipoCuenta = getTipoCuentaLabel(getFavoriteAccountType(favorite))

        return (
            alias.toLowerCase().includes(query) ||
            numeroCuenta.toLowerCase().includes(query) ||
            tipoCuenta.toLowerCase().includes(query)
        )
    })

    const confirmTarget = favorites.find((favorite) => favorite._id === confirmId)

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pb-10">
            <AnimatePresence>
                {showForm && (
                    <FavoriteForm
                        onClose={() => {
                            setShowForm(false)
                            fetchFavorites()
                        }}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {transferTarget && (
                    <TransferFavoriteModal
                        favorite={transferTarget}
                        accounts={accounts}
                        onClose={() => setTransferTarget(null)}
                        onTransferred={handleTransferred}
                    />
                )}
            </AnimatePresence>

            {confirmId && (
                <ConfirmDialog
                    message={
                        confirmTarget
                            ? `¿Eliminar "${confirmTarget.alias}" (${getFavoriteAccountNumber(confirmTarget)})?`
                            : '¿Eliminar este favorito?'
                    }
                    onConfirm={handleDelete}
                    onCancel={() => setConfirmId(null)}
                />
            )}

            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <Star size={22} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white">Cuentas Favoritas</h1>
                        <p className="text-zinc-500 text-sm mt-0.5">
                            {favorites.length} {favorites.length === 1 ? 'favorito guardado' : 'favoritos guardados'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20"
                >
                    <Plus size={16} />
                    Agregar favorito
                </button>
            </div>

            <div className="relative mb-6">
                <Search
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
                />
                <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar por alias, número o tipo de cuenta..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm"
                />
            </div>

            {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-2xl px-6 py-4 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="h-20 bg-zinc-900 rounded-3xl animate-pulse" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-24 text-center"
                >
                    <div className="w-16 h-16 rounded-3xl bg-zinc-900 flex items-center justify-center mb-4">
                        <Star size={28} className="text-zinc-700" />
                    </div>
                    <p className="text-zinc-400 font-semibold text-lg">
                        {search ? 'Sin resultados' : 'No hay favoritos aún'}
                    </p>
                    <p className="text-zinc-600 text-sm mt-1">
                        {search
                            ? 'Intenta con otro alias, número o tipo de cuenta.'
                            : 'Agrega cuentas de destino frecuentes para transferir más rápido.'}
                    </p>
                    {!search && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="mt-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl text-sm font-bold transition-all"
                        >
                            <Plus size={16} /> Agregar mi primer favorito
                        </button>
                    )}
                </motion.div>
            ) : (
                <div className="bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden">
                    <div className="grid grid-cols-[1fr_1fr_150px_auto] bg-white/3 border-b border-white/5">
                        <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest px-8 py-4">
                            Alias
                        </span>
                        <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest px-8 py-4">
                            Número de cuenta
                        </span>
                        <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest px-8 py-4">
                            Tipo
                        </span>
                        <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest px-8 py-4">
                            Acciones
                        </span>
                    </div>

                    <AnimatePresence initial={false}>
                        {filtered.map((favorite, index) => (
                            <motion.div
                                key={favorite._id}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className={`grid grid-cols-[1fr_1fr_150px_auto] items-center hover:bg-white/3 transition-colors ${
                                    index !== filtered.length - 1 ? 'border-b border-white/5' : ''
                                }`}
                            >
                                <div className="px-8 py-5 flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                                        <Star size={15} className="text-amber-400" />
                                    </div>
                                    <span className="text-white font-semibold text-sm">{favorite.alias}</span>
                                </div>

                                <div className="px-8 py-5 flex items-center gap-2 text-zinc-400">
                                    <Hash size={13} className="text-zinc-600 shrink-0" />
                                    <span className="font-mono text-sm">{getFavoriteAccountNumber(favorite)}</span>
                                </div>

                                <div className="px-8 py-5 flex items-center gap-2 text-zinc-400">
                                    <CreditCard size={13} className="text-zinc-600 shrink-0" />
                                    <span className="text-xs font-bold uppercase tracking-wide bg-zinc-800 text-zinc-300 rounded-xl px-3 py-1">
                                        {getTipoCuentaLabel(getFavoriteAccountType(favorite))}
                                    </span>
                                </div>

                                <div className="px-8 py-5 flex items-center gap-4">
                                    <button
                                        onClick={() => setTransferTarget(favorite)}
                                        className="flex items-center gap-1.5 text-zinc-500 hover:text-blue-400 transition-colors text-xs font-bold group"
                                        title="Transferir a favorito"
                                    >
                                        <ArrowLeftRight
                                            size={15}
                                            className="group-hover:scale-110 transition-transform"
                                        />
                                        Transferir
                                    </button>

                                    <button
                                        onClick={() => setConfirmId(favorite._id)}
                                        className="flex items-center gap-1.5 text-zinc-500 hover:text-red-400 transition-colors text-xs font-bold group"
                                        title="Eliminar favorito"
                                    >
                                        <Trash2
                                            size={15}
                                            className="group-hover:scale-110 transition-transform"
                                        />
                                        Eliminar
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    )
}

export default FavoriteList