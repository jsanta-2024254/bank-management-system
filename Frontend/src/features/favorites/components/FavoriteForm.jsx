import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { Star, Hash, CreditCard } from 'lucide-react'
import Modal from '../../../shared/components/ui/Modal'
import useFavoriteStore from '../store/favoriteStore'

const FavoriteForm = ({ onClose }) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            alias: '',
            numeroCuenta: '',
            tipoCuenta: 'monetaria',
        },
    })

    const { addFavorite } = useFavoriteStore()

    const onSubmit = async (data) => {
        const toastId = toast.loading('Guardando favorito...')

        try {
            await addFavorite({
                alias: data.alias.trim(),
                numeroCuenta: data.numeroCuenta.trim(),
                tipoCuenta: data.tipoCuenta,
            })

            toast.success('Favorito agregado correctamente', { id: toastId })
            onClose()
        } catch (error) {
            toast.error(
                error?.response?.data?.message || 'Error al agregar el favorito',
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
        <Modal title="Nuevo Favorito" onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="rounded-3xl border border-[#d7bc73]/40 bg-white/38 p-5">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#d7bc73]/45 bg-[#fff8df] text-[#8a611b] shadow-[0_12px_24px_rgba(154,107,22,0.12)]">
                            <Star size={20} />
                        </div>

                        <div>
                            <p className="text-sm font-black text-[#3f2c12]">
                                Cuenta favorita para transferencias
                            </p>

                            <p className="mt-1 text-sm leading-6 text-[#7a6849]">
                                Guarda cuentas frecuentes para realizar transferencias de forma más rápida y segura.
                            </p>
                        </div>
                    </div>
                </div>

                <div>
                    <label className={labelClass}>
                        <Star size={11} />
                        Alias
                    </label>

                    <input
                        {...register('alias', {
                            required: 'El alias es requerido',
                            minLength: {
                                value: 2,
                                message: 'Mínimo 2 caracteres',
                            },
                            maxLength: {
                                value: 80,
                                message: 'Máximo 80 caracteres',
                            },
                        })}
                        placeholder="Ej. Mamá, Oficina, Proveedor..."
                        className={inputClass}
                        disabled={isSubmitting}
                    />

                    {errors.alias && (
                        <p className={errorClass}>{errors.alias.message}</p>
                    )}
                </div>

                <div>
                    <label className={labelClass}>
                        <Hash size={11} />
                        Número de cuenta
                    </label>

                    <input
                        {...register('numeroCuenta', {
                            required: 'El número de cuenta es requerido',
                            minLength: {
                                value: 6,
                                message: 'Número de cuenta inválido',
                            },
                        })}
                        placeholder="Ej. 2024-00001"
                        className={`${inputClass} font-mono`}
                        disabled={isSubmitting}
                    />

                    {errors.numeroCuenta && (
                        <p className={errorClass}>
                            {errors.numeroCuenta.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className={labelClass}>
                        <CreditCard size={11} />
                        Tipo de cuenta
                    </label>

                    <select
                        {...register('tipoCuenta', {
                            required: 'El tipo de cuenta es requerido',
                        })}
                        className={`${inputClass} appearance-none`}
                        disabled={isSubmitting}
                    >
                        <option value="monetaria">Monetaria</option>
                        <option value="ahorro">Ahorro</option>
                    </select>

                    {errors.tipoCuenta && (
                        <p className={errorClass}>
                            {errors.tipoCuenta.message}
                        </p>
                    )}

                    <p className="mt-2 ml-1 text-xs font-semibold text-[#8a6a3a]">
                        Debe coincidir con el tipo real de la cuenta destino.
                    </p>
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
                        className="flex-1 rounded-2xl border border-[#c89b3c]/50 bg-linear-to-r from-[#b98219] via-[#d9b45e] to-[#8a611b] py-4 text-sm font-black text-white shadow-[0_18px_36px_rgba(154,107,22,0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(154,107,22,0.32)] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0"
                    >
                        {isSubmitting ? 'Guardando...' : 'Agregar Favorito'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}

export default FavoriteForm