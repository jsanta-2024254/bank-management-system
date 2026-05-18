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
    Send,
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
    return (
        favorite?.numeroCuenta ||
        favorite?.numeroCuentaDestino ||
        favorite?.cuenta?.numeroCuenta ||
        ''
    )
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
    return (accounts || []).filter(
        (account) => account?.estado !== false && account?.tipoCuenta
    )
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

const TransferFavoriteModal = ({
    favorite,
    accounts,
    onClose,
    onTransferred,
}) => {
    const { transferToFavorite } = useFavoriteStore()

    const activeAccounts = useMemo(() => {
        const cuentasActivas = getActiveAccounts(accounts)
        return cuentasActivas.length > 0
            ? cuentasActivas
            : buildFallbackAccounts()
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
            await transferToFavorite(favorite._id || favorite.id, {
                monto: Number(data.monto),
                tipoCuentaOrigen: data.tipoCuentaOrigen,
                descripcion: data.descripcion?.trim() || undefined,
            })

            toast.success('Transferencia realizada correctamente', {
                id: toastId,
            })

            onTransferred()
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                    'Error al transferir al favorito',
                { id: toastId }
            )
        }
    }

    const inputClass =
        'w-full rounded-2xl border border-[#d7bc73]/50 bg-white/58 px-5 py-3.5 text-sm font-semibold text-[#3b2a14] placeholder-[#a89365] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition-all focus:border-[#b98219]/70 focus:bg-white/80 focus:outline-none focus:ring-4 focus:ring-[#d9b45e]/18 disabled:cursor-not-allowed disabled:opacity-60'

    const labelClass =
        'mb-3 ml-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/75'

    const errorClass = 'mt-2 ml-1 text-xs font-semibold text-red-700'

    return (
        <Modal title="Transferir a favorito" onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="rounded-3xl border border-[#d7bc73]/40 bg-white/38 p-5">
                    <p className="mb-1 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                        Destino
                    </p>

                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#d7bc73]/45 bg-[#fff8df] text-[#8a611b] shadow-[0_12px_24px_rgba(154,107,22,0.12)]">
                            <Star size={19} />
                        </div>

                        <div className="min-w-0">
                            <p className="truncate text-sm font-black text-[#3f2c12]">
                                {favorite.alias}
                            </p>

                            <p className="mt-1 font-mono text-sm font-semibold text-[#7a6849]">
                                {getFavoriteAccountNumber(favorite)}
                            </p>

                            <p className="mt-1 text-xs font-semibold text-[#8a6a3a]">
                                Tipo de cuenta destino:{' '}
                                {getTipoCuentaLabel(
                                    getFavoriteAccountType(favorite)
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                <div>
                    <label className={labelClass}>
                        <CreditCard size={11} />
                        Cuenta origen
                    </label>

                    <select
                        {...register('tipoCuentaOrigen', {
                            required: 'Seleccione la cuenta origen',
                        })}
                        className={`${inputClass} appearance-none`}
                        disabled={isSubmitting}
                    >
                        {activeAccounts.map((account) => (
                            <option
                                key={getAccountId(account)}
                                value={account.tipoCuenta}
                            >
                                {getTipoCuentaLabel(account.tipoCuenta)} -{' '}
                                {account.numeroCuenta}
                                {account.saldo !== undefined
                                    ? ` (${formatCurrency(account.saldo)})`
                                    : ''}
                            </option>
                        ))}
                    </select>

                    {errors.tipoCuentaOrigen && (
                        <p className={errorClass}>
                            {errors.tipoCuentaOrigen.message}
                        </p>
                    )}

                    <p className="mt-2 ml-1 text-xs font-semibold text-[#8a6a3a]">
                        Esta es la cuenta desde donde saldrá el dinero.
                    </p>
                </div>

                <div>
                    <label className={labelClass}>
                        <DollarSign size={11} />
                        Monto
                    </label>

                    <div className="relative">
                        <DollarSign
                            size={14}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a6b16]/70"
                        />

                        <input
                            {...register('monto', {
                                required: 'El monto es requerido',
                                min: {
                                    value: 0.01,
                                    message: 'Mínimo Q0.01',
                                },
                                max: {
                                    value: 2000,
                                    message:
                                        'Máximo Q2,000 por transferencia',
                                },
                            })}
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className={`${inputClass} pl-10`}
                            disabled={isSubmitting}
                        />
                    </div>

                    {errors.monto && (
                        <p className={errorClass}>{errors.monto.message}</p>
                    )}
                </div>

                <div>
                    <label className={labelClass}>
                        <AlignLeft size={11} />
                        Descripción opcional
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
                        className="flex-1 rounded-2xl border border-[#d7bc73]/55 bg-white/45 py-4 text-sm font-black text-[#6f5a33] transition-all hover:bg-white/85 hover:text-[#3f2c12] disabled:cursor-not-allowed disabled:opacity-55"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[#c89b3c]/50 bg-linear-to-r from-[#b98219] via-[#d9b45e] to-[#8a611b] py-4 text-sm font-black text-white shadow-[0_18px_36px_rgba(154,107,22,0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(154,107,22,0.32)] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0"
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
    const { favorites, loading, error, fetchFavorites, deleteFavorite } =
        useFavoriteStore()

    const { accounts, fetchAccounts } = useAccountStore()

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
                error?.response?.data?.message ||
                    'Error al eliminar el favorito',
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

    const confirmTarget = favorites.find(
        (favorite) => favorite._id === confirmId || favorite.id === confirmId
    )

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pb-10"
        >
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

            <div className="mb-8 overflow-hidden rounded-4xl border border-[#d7bc73]/45 bg-[#fffaf0]/62 px-6 py-6 shadow-[0_22px_60px_rgba(92,64,19,0.1)] backdrop-blur-xl md:px-8">
                <div className="premium-gold-line mb-6 h-px w-full" />

                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-[#c89b3c]/50 bg-linear-to-br from-[#fff8df] via-[#ead190] to-[#9a6b16] shadow-[0_18px_38px_rgba(154,107,22,0.24)]">
                            <Star size={28} className="text-[#5b3a0d]" />
                        </div>

                        <div>
                            <p className="mb-1 text-[10px] font-black uppercase tracking-[0.28em] text-[#9a6b16]/75">
                                Transferencias frecuentes
                            </p>

                            <h1 className="text-3xl font-black tracking-tight text-[#3f2c12] md:text-4xl">
                                Cuentas Favoritas
                            </h1>

                            <p className="mt-1 text-sm font-semibold text-[#7a6849]">
                                {favorites.length}{' '}
                                {favorites.length === 1
                                    ? 'favorito guardado'
                                    : 'favoritos guardados'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowForm(true)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#c89b3c]/55 bg-linear-to-r from-[#b98219] via-[#d9b45e] to-[#8a611b] px-6 py-3.5 text-sm font-black text-white shadow-[0_18px_36px_rgba(154,107,22,0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(154,107,22,0.32)] active:scale-95 sm:w-auto"
                    >
                        <Plus size={16} />
                        Agregar favorito
                    </button>
                </div>
            </div>

            <div className="relative mb-6">
                <Search
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9a6b16]/70"
                />

                <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar por alias, número o tipo de cuenta..."
                    className="w-full rounded-2xl border border-[#d7bc73]/50 bg-white/58 py-3.5 pl-10 pr-4 text-sm font-semibold text-[#3b2a14] placeholder-[#a89365] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition-all focus:border-[#b98219]/70 focus:bg-white/80 focus:outline-none focus:ring-4 focus:ring-[#d9b45e]/18"
                />
            </div>

            {error && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50/80 px-6 py-4 text-sm font-semibold text-red-700">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div
                            key={index}
                            className="h-20 animate-pulse rounded-3xl border border-[#d7bc73]/35 bg-[#ead9ad]/55"
                        />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center rounded-4xl border border-[#d7bc73]/45 bg-[#fffaf0]/68 px-6 py-24 text-center shadow-[0_22px_60px_rgba(92,64,19,0.1)] backdrop-blur-xl"
                >
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-[#d7bc73]/45 bg-[#fff8df] text-[#8a611b]">
                        <Star size={28} />
                    </div>

                    <p className="text-lg font-black text-[#3f2c12]">
                        {search ? 'Sin resultados' : 'No hay favoritos aún'}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#8a6a3a]">
                        {search
                            ? 'Intenta con otro alias, número o tipo de cuenta.'
                            : 'Agrega cuentas de destino frecuentes para transferir más rápido.'}
                    </p>

                    {!search && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-[#c89b3c]/55 bg-linear-to-r from-[#b98219] via-[#d9b45e] to-[#8a611b] px-5 py-3 text-sm font-black text-white shadow-[0_18px_36px_rgba(154,107,22,0.25)] transition-all hover:-translate-y-0.5"
                        >
                            <Plus size={16} />
                            Agregar mi primer favorito
                        </button>
                    )}
                </motion.div>
            ) : (
                <div className="relative overflow-hidden rounded-4xl border border-[#d7bc73]/45 bg-[#fffaf0]/68 shadow-[0_22px_60px_rgba(92,64,19,0.1)] backdrop-blur-xl">
                    <div className="premium-gold-line absolute left-8 right-8 top-0 h-px" />

                    <div className="custom-scrollbar overflow-x-auto">
                        <div className="min-w-215">
                            <div className="grid grid-cols-[1fr_1fr_150px_240px] border-b border-[#d7bc73]/28 bg-[#ead9ad]/22">
                                <span className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                    Alias
                                </span>

                                <span className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                    Número de cuenta
                                </span>

                                <span className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                    Tipo
                                </span>

                                <span className="px-8 py-4 text-right text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                    Acciones
                                </span>
                            </div>

                            <AnimatePresence initial={false}>
                                {filtered.map((favorite, index) => (
                                    <motion.div
                                        key={favorite._id || favorite.id}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className={`grid grid-cols-[1fr_1fr_150px_240px] items-center transition-colors hover:bg-white/35 ${
                                            index !== filtered.length - 1
                                                ? 'border-b border-[#d7bc73]/28'
                                                : ''
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 px-8 py-5">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#d7bc73]/45 bg-[#fff8df] text-[#8a611b] shadow-[0_12px_24px_rgba(154,107,22,0.12)]">
                                                <Star size={16} />
                                            </div>

                                            <span className="text-sm font-black text-[#3f2c12]">
                                                {favorite.alias}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 px-8 py-5 text-[#7a6849]">
                                            <Hash
                                                size={13}
                                                className="shrink-0 text-[#9a6b16]/70"
                                            />

                                            <span className="font-mono text-sm font-semibold">
                                                {getFavoriteAccountNumber(
                                                    favorite
                                                )}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 px-8 py-5">
                                            <CreditCard
                                                size={13}
                                                className="shrink-0 text-[#9a6b16]/70"
                                            />

                                            <span className="rounded-full border border-[#d7bc73]/50 bg-[#fff8df] px-3 py-1 text-xs font-black uppercase tracking-wide text-[#8a611b]">
                                                {getTipoCuentaLabel(
                                                    getFavoriteAccountType(
                                                        favorite
                                                    )
                                                )}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-end gap-2 px-8 py-5">
                                            <button
                                                onClick={() =>
                                                    setTransferTarget(favorite)
                                                }
                                                className="inline-flex items-center gap-1.5 rounded-xl border border-[#d7bc73]/45 bg-white/50 px-3 py-2 text-xs font-black text-[#8a611b] transition-all hover:bg-[#fff8df] hover:text-[#3f2c12]"
                                                title="Transferir a favorito"
                                            >
                                                <Send size={14} />
                                                Transferir
                                            </button>

                                            <button
                                                onClick={() =>
                                                    setConfirmId(
                                                        favorite._id ||
                                                            favorite.id
                                                    )
                                                }
                                                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/80 px-3 py-2 text-xs font-black text-red-700 transition-all hover:bg-red-100"
                                                title="Eliminar favorito"
                                            >
                                                <Trash2 size={14} />
                                                Eliminar
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    )
}

export default FavoriteList