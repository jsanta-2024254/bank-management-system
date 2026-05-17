import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { ArrowLeftRight, CreditCard, DollarSign, AlignLeft, Star } from 'lucide-react'
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
        watch,
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

    useEffect(() => { fetchFavorites() }, [fetchFavorites])

    const selectedFavoriteId = watch('favoriteId')

    useEffect(() => {
        if (!selectedFavoriteId) return
        const fav = favorites.find((f) => (f._id || f.id) === selectedFavoriteId)
        if (fav) {
            setValue('numeroCuentaDestino', fav.numeroCuenta || fav.numeroCuentaDestino || '')
            if (fav.tipoCuenta) setValue('tipoCuentaDestino', fav.tipoCuenta)
        }
    }, [selectedFavoriteId, favorites, setValue])

    const isLoading = loading || isSubmitting

    const onSubmit = async (data) => {
        const toastId = toast.loading('Procesando transferencia...')
        try {
            const { favoriteId, ...payload } = data
            await createTransaction({ ...payload, monto: parseFloat(data.monto) })
            toast.success('Transferencia realizada con éxito', { id: toastId })
            onClose()
        } catch (error) {
            toast.error(
                error?.response?.data?.message || 'Error al realizar la transferencia',
                { id: toastId }
            )
        }
    }

    const inputClass =
        'w-full bg-zinc-900 border border-zinc-800 text-white rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all placeholder:text-zinc-600 text-sm'

    return (
        <Modal title="Nueva Transferencia" onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block ml-1">
                            Mi Cuenta Origen
                        </label>
                        <select
                            {...register('tipoCuentaOrigen', { required: 'Requerido' })}
                            className={`${inputClass} appearance-none`}
                            disabled={isLoading}
                        >
                            <option value="monetaria">Monetaria</option>
                            <option value="ahorro">Ahorro</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block ml-1">
                            Monto GTQ
                        </label>
                        <div className="relative">
                            <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
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
                                disabled={isLoading}
                            />
                        </div>
                        {errors.monto && (
                            <p className="text-red-400 text-[10px] mt-1 ml-1">{errors.monto.message}</p>
                        )}
                    </div>
                </div>

                <div className="bg-white/5 h-px w-full" />

                {/* Sección favoritos */}
                {favorites.length > 0 && (
                    <div>
                        <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block ml-1 flex items-center gap-1">
                            <Star size={10} className="text-yellow-400" />
                            Enviar a favorito
                        </label>
                        <select
                            {...register('favoriteId')}
                            className={`${inputClass} appearance-none`}
                            disabled={isLoading}
                        >
                            <option value="">— Seleccionar favorito —</option>
                            {favorites.map((fav) => (
                                <option key={fav._id || fav.id} value={fav._id || fav.id}>
                                    {fav.alias || fav.nombre || fav.name || fav.numeroCuenta}
                                    {fav.numeroCuenta ? ` · ${fav.numeroCuenta}` : ''}
                                </option>
                            ))}
                        </select>
                        <p className="text-zinc-600 text-[10px] mt-1 ml-1">
                            Al seleccionar un favorito se autocompleta la cuenta destino.
                        </p>
                    </div>
                )}

                <div>
                    <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block ml-1">
                        Número de Cuenta Destino
                    </label>
                    <div className="relative">
                        <CreditCard size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                            {...register('numeroCuentaDestino', { required: 'El número de cuenta es requerido' })}
                            placeholder="Ingrese el número de cuenta"
                            className={`${inputClass} pl-10 font-mono`}
                            disabled={isLoading}
                        />
                    </div>
                    {errors.numeroCuentaDestino && (
                        <p className="text-red-400 text-[10px] mt-1 ml-1">{errors.numeroCuentaDestino.message}</p>
                    )}
                </div>

                <div>
                    <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block ml-1">
                        Tipo de Cuenta Destino
                    </label>
                    <select
                        {...register('tipoCuentaDestino', { required: 'Requerido' })}
                        className={`${inputClass} appearance-none`}
                        disabled={isLoading}
                    >
                        <option value="monetaria">Monetaria</option>
                        <option value="ahorro">Ahorro</option>
                    </select>
                </div>

                <div>
                    <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block ml-1">
                        Descripción Opcional
                    </label>
                    <div className="relative">
                        <AlignLeft size={14} className="absolute left-4 top-4 text-zinc-500" />
                        <textarea
                            {...register('descripcion')}
                            placeholder="Motivo de la transferencia..."
                            rows={3}
                            className={`${inputClass} pl-10 resize-none`}
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
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
                        disabled={isLoading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl text-sm transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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