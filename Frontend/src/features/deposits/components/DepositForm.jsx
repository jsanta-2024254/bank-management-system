import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import {
    AlignLeft,
    CheckCircle2,
    CreditCard,
    DollarSign,
    Loader2,
    PlusCircle,
    Search,
} from 'lucide-react'
import Modal from '../../../shared/components/ui/Modal'
import useAccountStore from '../../accounts/store/accountStore'
import useDepositStore from '../store/depositStore'

const getAccountId = (account) => account?._id || account?.id || account?.Id || ''

const getCuentaUsuarioTexto = (account) => {
    const usuario = account?.usuario || account?.user || account?.owner || ''

    if (!usuario) return 'N/A'

    if (typeof usuario === 'string') return usuario

    return (
        usuario.nombre ||
        usuario.name ||
        usuario.email ||
        usuario.correo ||
        usuario.uid ||
        usuario.id ||
        usuario._id ||
        'N/A'
    )
}

const DepositForm = ({ onClose, cuentaPreseleccionada = null }) => {
    const { createDeposit, loading } = useDepositStore()
    const {
        accounts,
        loading: loadingAccounts,
        fetchAccounts,
    } = useAccountStore()

    const cuentaPreseleccionadaId = getAccountId(cuentaPreseleccionada)

    const [searchAccount, setSearchAccount] = useState('')
    const [selectedAccountId, setSelectedAccountId] = useState('')

    const selectedAccountIdFinal = selectedAccountId || cuentaPreseleccionadaId

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            monto: '',
            descripcion: '',
        },
    })

    useEffect(() => {
        fetchAccounts()
    }, [fetchAccounts])

    const isLoading = loading || isSubmitting

    const cuentasActivas = useMemo(() => {
        return (accounts || []).filter((account) => account.estado !== false)
    }, [accounts])

    const cuentaSeleccionada = useMemo(() => {
        return cuentasActivas.find(
            (account) => getAccountId(account) === selectedAccountIdFinal
        )
    }, [cuentasActivas, selectedAccountIdFinal])

    const cuentasFiltradas = useMemo(() => {
        const query = searchAccount.trim().toLowerCase()

        if (!query) {
            const cuentaPrevia = cuentasActivas.find(
                (account) => getAccountId(account) === selectedAccountIdFinal
            )

            const primerasCuentas = cuentasActivas
                .filter((account) => getAccountId(account) !== selectedAccountIdFinal)
                .slice(0, cuentaPrevia ? 7 : 8)

            return cuentaPrevia ? [cuentaPrevia, ...primerasCuentas] : primerasCuentas
        }

        return cuentasActivas.filter((account) => {
            const usuarioTexto = getCuentaUsuarioTexto(account).toLowerCase()

            return (
                (account.numeroCuenta || '').toLowerCase().includes(query) ||
                (account.tipoCuenta || '').toLowerCase().includes(query) ||
                usuarioTexto.includes(query)
            )
        })
    }, [cuentasActivas, searchAccount, selectedAccountIdFinal])

    const fmt = (n) =>
        new Intl.NumberFormat('es-GT', {
            style: 'currency',
            currency: 'GTQ',
        }).format(n || 0)

    const seleccionarCuenta = (account) => {
        setSelectedAccountId(getAccountId(account))
    }

    const onSubmit = async (data) => {
        if (!cuentaSeleccionada) {
            toast.error('Seleccione una cuenta destino antes de continuar')
            return
        }

        const toastId = toast.loading('Procesando depósito...')

        try {
            await createDeposit({
                numeroCuenta: cuentaSeleccionada.numeroCuenta,
                tipoCuenta: cuentaSeleccionada.tipoCuenta,
                monto: parseFloat(data.monto),
                descripcion: data.descripcion?.trim() || '',
            })

            toast.success('Depósito realizado con éxito', { id: toastId })
            onClose()
        } catch (error) {
            toast.error(
                error?.response?.data?.message || 'Error al realizar el depósito',
                { id: toastId }
            )
        }
    }

    const inputClass =
        'w-full bg-zinc-900 border border-zinc-800 text-white rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all placeholder:text-zinc-600 text-sm'

    return (
        <Modal title="Nuevo Depósito Administrativo" onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                            <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider block ml-1">
                                Cuenta destino
                            </label>
                            <p className="text-zinc-500 text-xs mt-1 ml-1">
                                Busque y seleccione visualmente la cuenta a acreditar.
                            </p>
                        </div>

                        {loadingAccounts && (
                            <span className="inline-flex items-center gap-2 text-blue-400 text-xs font-semibold bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full">
                                <Loader2 size={12} className="animate-spin" />
                                Cargando
                            </span>
                        )}
                    </div>

                    <div className="relative mb-3">
                        <Search
                            size={14}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                        />
                        <input
                            value={searchAccount}
                            onChange={(e) => setSearchAccount(e.target.value)}
                            placeholder="Buscar por cuenta, tipo o usuario..."
                            className={`${inputClass} pl-10`}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                        {cuentasFiltradas.length === 0 ? (
                            <div className="border border-dashed border-zinc-800 rounded-2xl px-5 py-8 text-center">
                                <CreditCard size={24} className="text-zinc-600 mx-auto mb-2" />
                                <p className="text-zinc-500 text-sm font-medium">
                                    No se encontraron cuentas activas
                                </p>
                            </div>
                        ) : (
                            cuentasFiltradas.map((account) => {
                                const accountId = getAccountId(account)
                                const selected = accountId === selectedAccountIdFinal

                                return (
                                    <button
                                        key={accountId}
                                        type="button"
                                        onClick={() => seleccionarCuenta(account)}
                                        disabled={isLoading}
                                        className={`w-full text-left border rounded-2xl p-4 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                                            selected
                                                ? 'bg-blue-600/10 border-blue-500/60 ring-2 ring-blue-500/20'
                                                : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <CreditCard
                                                        size={15}
                                                        className={
                                                            selected
                                                                ? 'text-blue-400'
                                                                : 'text-zinc-500'
                                                        }
                                                    />
                                                    <span className="text-white font-mono text-sm font-bold">
                                                        {account.numeroCuenta}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                                    <span className="text-zinc-400 text-[10px] uppercase font-black tracking-widest">
                                                        {account.tipoCuenta}
                                                    </span>
                                                    <span className="text-zinc-600 text-xs">
                                                        •
                                                    </span>
                                                    <span className="text-zinc-500 text-xs font-mono truncate max-w-55">
                                                        Usuario: {getCuentaUsuarioTexto(account)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="text-right shrink-0">
                                                <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">
                                                    Saldo
                                                </p>
                                                <p className="text-white text-sm font-bold">
                                                    {fmt(account.saldo)}
                                                </p>
                                            </div>
                                        </div>

                                        {selected && (
                                            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold mt-3">
                                                <CheckCircle2 size={14} />
                                                Cuenta seleccionada
                                            </div>
                                        )}
                                    </button>
                                )
                            })
                        )}
                    </div>

                    {!cuentaSeleccionada && (
                        <p className="text-red-400 text-[10px] mt-2 ml-1">
                            Debe seleccionar una cuenta destino.
                        </p>
                    )}
                </div>

                <div className="bg-white/5 h-px w-full" />

                {cuentaSeleccionada && (
                    <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-4">
                        <p className="text-blue-300 text-[10px] uppercase font-black tracking-widest mb-1">
                            Depósito dirigido a
                        </p>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <p className="text-white font-mono text-sm font-bold">
                                {cuentaSeleccionada.numeroCuenta}
                            </p>

                            <p className="text-zinc-400 text-xs capitalize">
                                {cuentaSeleccionada.tipoCuenta} · Saldo actual:{' '}
                                <span className="text-white font-semibold">
                                    {fmt(cuentaSeleccionada.saldo)}
                                </span>
                            </p>
                        </div>
                    </div>
                )}

                <div>
                    <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block ml-1">
                        Monto GTQ
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
                            })}
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className={`${inputClass} pl-10`}
                            disabled={isLoading}
                        />
                    </div>

                    {errors.monto && (
                        <p className="text-red-400 text-[10px] mt-1 ml-1">
                            {errors.monto.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block ml-1">
                        Descripción Opcional
                    </label>

                    <div className="relative">
                        <AlignLeft
                            size={14}
                            className="absolute left-4 top-4 text-zinc-500"
                        />
                        <textarea
                            {...register('descripcion')}
                            placeholder="Motivo del depósito..."
                            rows={3}
                            className={`${inputClass} pl-10 resize-none`}
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <div className="flex gap-4 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-4 rounded-2xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        disabled={isLoading || !cuentaSeleccionada}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl text-sm transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            'Procesando...'
                        ) : (
                            <>
                                <PlusCircle size={18} />
                                Realizar Depósito
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    )
}

export default DepositForm