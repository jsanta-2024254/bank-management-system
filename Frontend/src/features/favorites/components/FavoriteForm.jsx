import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { Star, Hash } from 'lucide-react'
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
            numeroCuentaDestino: '',
        },
    })

    const { addFavorite } = useFavoriteStore()

    const onSubmit = async (data) => {
        const toastId = toast.loading('Guardando favorito...')
        try {
            await addFavorite({
                alias: data.alias.trim(),
                numeroCuentaDestino: data.numeroCuentaDestino.trim(),
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
        'w-full bg-zinc-800/50 border border-zinc-700/50 text-white rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-zinc-600'

    return (
        <Modal title="Nuevo Favorito" onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Alias */}
                <div>
                    <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Star size={11} /> Alias
                    </label>
                    <input
                        {...register('alias', {
                            required: 'El alias es requerido',
                            minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                            maxLength: { value: 40, message: 'Máximo 40 caracteres' },
                        })}
                        placeholder="Ej. Mamá, Oficina, Proveedor..."
                        className={inputClass}
                    />
                    {errors.alias && (
                        <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.alias.message}</p>
                    )}
                </div>

                {/* Número de cuenta destino */}
                <div>
                    <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Hash size={11} /> Número de cuenta destino
                    </label>
                    <input
                        {...register('numeroCuentaDestino', {
                            required: 'El número de cuenta es requerido',
                            minLength: { value: 6, message: 'Número de cuenta inválido' },
                        })}
                        placeholder="Ej. 2024-00001"
                        className={`${inputClass} font-mono`}
                    />
                    {errors.numeroCuentaDestino && (
                        <p className="text-red-400 text-xs mt-1.5 ml-1">
                            {errors.numeroCuentaDestino.message}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-4 rounded-2xl text-sm font-semibold transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl text-sm transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Guardando...' : 'Agregar Favorito'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}

export default FavoriteForm