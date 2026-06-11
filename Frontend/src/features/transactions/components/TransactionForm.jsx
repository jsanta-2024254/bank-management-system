import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import {
    ArrowLeftRight,
    CreditCard,
    DollarSign,
    AlignLeft,
    Star,
} from 'lucide-react'
import Modal from '../../../shared/components/ui/Modal'
import useTransactionStore from '../store/transactionStore'
import useFavoriteStore from '../../favorites/store/favoriteStore'

const TransactionForm = ({ onClose }) => {
    const { createTransaction, loading } = useTransactionStore()
    const { favorites, fetchFavorites } = useFavoriteStore()

    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            tipoCuentaDestino: 'monetaria',
            tipoCuentaOrigen: 'monetaria',
            monto: 0,
            descripcion: '',
            numeroCuentaDestino: '',
            favoriteId: '',
        },
    })

    const selectedFavoriteId = useWatch({
        control,
        name: 'favoriteId',
    })

    useEffect(() => {
        fetchFavorites()
    }, [fetchFavorites])

    useEffect(() => {
        if (!selectedFavoriteId) return

        const fav = favorites.find(
            (f) => (f._id || f.id) === selectedFavoriteId
        )

        if (fav) {
            setValue(
                'numeroCuentaDestino',
                fav.numeroCuenta || fav.numeroCuentaDestino || ''
            )

            if (fav.tipoCuenta) {
                setValue('tipoCuentaDestino', fav.tipoCuenta)
            }
        }
    }, [selectedFavoriteId, favorites, setValue])

    const isLoading = loading || isSubmitting

    const onSubmit = async (data) => {
        const toastId = toast.loading('Procesando transferencia...')

        try {
            const payload = { ...data }
            delete payload.favoriteId

            await createTransaction({
                ...payload,
                monto: parseFloat(data.monto),
            })

            toast.success('Transferencia realizada con éxito', { id: toastId })
            onClose()
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                    'Error al realizar la transferencia',
                { id: toastId }
            )
        }
    }

    const inputClass =
        'w-full rounded-2xl border border-[#d7bc73]/50 bg-white/58 px-5 py-3.5 text-sm font-semibold text-[#3b2a14] placeholder-[#a89365] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition-all focus:border-[#b98219]/70 focus:bg-white/80 focus:outline-none focus:ring-4 focus:ring-[#d9b45e]/18 disabled:cursor-not-allowed disabled:opacity-60'

    const labelClass =
        'mb-3 ml-1 block text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/75'

    const errorClass = 'mt-2 ml-1 text-xs font-semibold text-red-700'

    const iconClass =
        'absolute left-4 top-1/2 -translate-y-1/2 text-[#9a6b16]/70'

    return (
        <Modal title="Nueva Transferencia" onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="rounded-3xl border border-[#d7bc73]/40 bg-white/38 p-5">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#d7bc73]/45 bg-[#fff8df] text-[#8a611b] shadow-[0_12px_24px_rgba(154,107,22,0.12)]">
                            <ArrowLeftRight size={20} />
                        </div>

                        <div>
                            <p className="text-sm font-black text-[#3f2c12]">
                                Transferencia bancaria segura
                            </p>

                            <p className="mt-1 text-sm leading-6 text-[#7a6849]">
                                Complete los datos de origen, destino y monto. El
                                límite máximo por transferencia es de Q2,000.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className={labelClass}>Mi Cuenta Origen</label>

                        <select
                            {...register('tipoCuentaOrigen', {
                                required: 'Requerido',
                            })}
                            className={`${inputClass} appearance-none`}
                            disabled={isLoading}
                        >
                            <option value="monetaria">Monetaria</option>
                            <option value="ahorro">Ahorro</option>
                        </select>
                    </div>

                    <div>
                        <label className={labelClass}>Monto GTQ</label>

                        <div className="relative">
                            <DollarSign size={15} className={iconClass} />

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
                                disabled={isLoading}
                            />
                        </div>

                        {errors.monto && (
                            <p className={errorClass}>
                                {errors.monto.message}
                            </p>
                        )}
                    </div>
                </div>

                <div className="premium-gold-line h-px w-full" />

                {favorites.length > 0 && (
                    <div>
                        <label
                            className={`${labelClass} flex items-center gap-1`}
                        >
                            <Star size={11} className="text-[#b98219]" />
                            Enviar a favorito
                        </label>

                        <select
                            {...register('favoriteId')}
                            className={`${inputClass} appearance-none`}
                            disabled={isLoading}
                        >
                            <option value="">— Seleccionar favorito —</option>

                            {favorites.map((fav) => (
                                <option
                                    key={fav._id || fav.id}
                                    value={fav._id || fav.id}
                                >
                                    {fav.alias ||
                                        fav.nombre ||
                                        fav.name ||
                                        fav.numeroCuenta}
                                    {fav.numeroCuenta
                                        ? ` · ${fav.numeroCuenta}`
                                        : ''}
                                </option>
                            ))}
                        </select>

                        <p className="mt-2 ml-1 text-xs font-semibold text-[#8a6a3a]">
                            Al seleccionar un favorito se autocompleta la cuenta
                            destino.
                        </p>
                    </div>
                )}

                <div>
                    <label className={labelClass}>
                        Número de Cuenta Destino
                    </label>

                    <div className="relative">
                        <CreditCard size={15} className={iconClass} />

                        <input
                            {...register('numeroCuentaDestino', {
                                required:
                                    'El número de cuenta es requerido',
                            })}
                            placeholder="Ingrese el número de cuenta"
                            className={`${inputClass} pl-10 font-mono`}
                            disabled={isLoading}
                        />
                    </div>

                    {errors.numeroCuentaDestino && (
                        <p className={errorClass}>
                            {errors.numeroCuentaDestino.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className={labelClass}>
                        Tipo de Cuenta Destino
                    </label>

                    <select
                        {...register('tipoCuentaDestino', {
                            required: 'Requerido',
                        })}
                        className={`${inputClass} appearance-none`}
                        disabled={isLoading}
                    >
                        <option value="monetaria">Monetaria</option>
                        <option value="ahorro">Ahorro</option>
                    </select>
                </div>

                <div>
                    <label className={labelClass}>
                        Descripción Opcional
                    </label>

                    <div className="relative">
                        <AlignLeft
                            size={15}
                            className="absolute left-4 top-4 text-[#9a6b16]/70"
                        />

                        <textarea
                            {...register('descripcion')}
                            placeholder="Motivo de la transferencia..."
                            rows={3}
                            className={`${inputClass} resize-none pl-10`}
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
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
                        disabled={isLoading}
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[#c89b3c]/50 bg-linear-to-r from-[#b98219] via-[#d9b45e] to-[#8a611b] py-4 text-sm font-black text-white shadow-[0_18px_36px_rgba(154,107,22,0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(154,107,22,0.32)] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0"
                    >
                        {isLoading ? (
                            'Procesando...'
                        ) : (
                            <>
                                <ArrowLeftRight size={18} />
                                Transferir
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    )
}

export default TransactionForm