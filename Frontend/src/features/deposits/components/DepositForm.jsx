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
    Landmark,
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
        'w-full rounded-2xl border border-[#d7bc73]/50 bg-white/58 px-5 py-3.5 text-sm font-semibold text-[#3b2a14] placeholder-[#a89365] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition-all focus:border-[#b98219]/70 focus:bg-white/80 focus:outline-none focus:ring-4 focus:ring-[#d9b45e]/18 disabled:cursor-not-allowed disabled:opacity-60'

    const labelClass =
        'mb-3 ml-1 block text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/75'

    const errorClass = 'mt-2 ml-1 text-xs font-semibold text-red-700'

    return (
        <Modal title="Nuevo Depósito Administrativo" onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="rounded-3xl border border-[#d7bc73]/40 bg-white/38 p-5">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#d7bc73]/45 bg-[#fff8df] text-[#8a611b] shadow-[0_12px_24px_rgba(154,107,22,0.12)]">
                            <Landmark size={20} />
                        </div>

                        <div>
                            <p className="text-sm font-black text-[#3f2c12]">
                                Depósito administrativo directo
                            </p>

                            <p className="mt-1 text-sm leading-6 text-[#7a6849]">
                                Busque la cuenta destino, confirme el monto y registre el depósito.
                            </p>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                            <label className={labelClass}>
                                Cuenta destino
                            </label>

                            <p className="ml-1 mt-1 text-xs font-semibold text-[#8a6a3a]">
                                Busque y seleccione visualmente la cuenta a acreditar.
                            </p>
                        </div>

                        {loadingAccounts && (
                            <span className="inline-flex items-center gap-2 rounded-full border border-[#d7bc73]/45 bg-[#fff8df] px-3 py-1.5 text-xs font-black text-[#8a611b]">
                                <Loader2 size={12} className="animate-spin" />
                                Cargando
                            </span>
                        )}
                    </div>

                    <div className="relative mb-3">
                        <Search
                            size={14}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a6b16]/70"
                        />

                        <input
                            value={searchAccount}
                            onChange={(e) => setSearchAccount(e.target.value)}
                            placeholder="Buscar por cuenta, tipo o usuario..."
                            className={`${inputClass} pl-10`}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="custom-scrollbar max-h-64 space-y-2 overflow-y-auto pr-1">
                        {cuentasFiltradas.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-[#d7bc73]/45 bg-white/30 px-5 py-8 text-center">
                                <CreditCard
                                    size={24}
                                    className="mx-auto mb-2 text-[#9a6b16]/45"
                                />

                                <p className="text-sm font-semibold text-[#8a6a3a]">
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
                                        className={`w-full rounded-2xl border p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                                            selected
                                                ? 'border-[#b98219]/70 bg-[#fff8df] shadow-[0_14px_32px_rgba(154,107,22,0.16)] ring-4 ring-[#d9b45e]/18'
                                                : 'border-[#d7bc73]/40 bg-white/38 hover:border-[#b98219]/55 hover:bg-white/58'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <CreditCard
                                                        size={15}
                                                        className={
                                                            selected
                                                                ? 'text-[#8a611b]'
                                                                : 'text-[#9a6b16]/65'
                                                        }
                                                    />

                                                    <span className="font-mono text-sm font-black text-[#3f2c12]">
                                                        {account.numeroCuenta}
                                                    </span>
                                                </div>

                                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#8a611b]/70">
                                                        {account.tipoCuenta}
                                                    </span>

                                                    <span className="text-xs text-[#c89b3c]">
                                                        •
                                                    </span>

                                                    <span className="max-w-55 truncate font-mono text-xs font-semibold text-[#8a6a3a]">
                                                        Usuario: {getCuentaUsuarioTexto(account)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="shrink-0 text-right">
                                                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#8a611b]/70">
                                                    Saldo
                                                </p>

                                                <p className="text-sm font-black text-[#3f2c12]">
                                                    {fmt(account.saldo)}
                                                </p>
                                            </div>
                                        </div>

                                        {selected && (
                                            <div className="mt-3 flex items-center gap-2 text-xs font-black text-[#8a611b]">
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
                        <p className={errorClass}>
                            Debe seleccionar una cuenta destino.
                        </p>
                    )}
                </div>

                <div className="premium-gold-line h-px w-full" />

                {cuentaSeleccionada && (
                    <div className="rounded-2xl border border-[#d7bc73]/45 bg-[#fff8df]/65 p-4">
                        <p className="mb-1 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                            Depósito dirigido a
                        </p>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <p className="font-mono text-sm font-black text-[#3f2c12]">
                                {cuentaSeleccionada.numeroCuenta}
                            </p>

                            <p className="text-xs font-semibold capitalize text-[#8a6a3a]">
                                {cuentaSeleccionada.tipoCuenta} · Saldo actual:{' '}
                                <span className="font-black text-[#3f2c12]">
                                    {fmt(cuentaSeleccionada.saldo)}
                                </span>
                            </p>
                        </div>
                    </div>
                )}

                <div>
                    <label className={labelClass}>
                        Monto GTQ
                    </label>

                    <div className="relative">
                        <DollarSign
                            size={14}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a6b16]/70"
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
                        <p className={errorClass}>
                            {errors.monto.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className={labelClass}>
                        Descripción Opcional
                    </label>

                    <div className="relative">
                        <AlignLeft
                            size={14}
                            className="absolute left-4 top-4 text-[#9a6b16]/70"
                        />

                        <textarea
                            {...register('descripcion')}
                            placeholder="Motivo del depósito..."
                            rows={3}
                            className={`${inputClass} resize-none pl-10`}
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <div className="flex gap-4 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 rounded-2xl border border-[#d7bc73]/55 bg-white/45 py-4 text-sm font-black text-[#6f5a33] transition-all hover:bg-white/85 hover:text-[#3f2c12] disabled:cursor-not-allowed disabled:opacity-55"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        disabled={isLoading || !cuentaSeleccionada}
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[#c89b3c]/50 bg-linear-to-r from-[#b98219] via-[#d9b45e] to-[#8a611b] py-4 text-sm font-black text-white shadow-[0_18px_36px_rgba(154,107,22,0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(154,107,22,0.32)] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0"
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