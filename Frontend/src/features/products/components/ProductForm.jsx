import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import Modal from '../../../shared/components/ui/Modal'
import useProductStore from '../store/productStore'

const ProductForm = ({ product, onClose }) => {
    const isEditing = !!product
    const { createProduct, updateProduct, loading } = useProductStore()

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            nombre: product?.nombre || '',
            descripcion: product?.descripcion || '',
            tipo: product?.tipo || '',
            tasaInteres: product?.tasaInteres ?? '',
            estado: product?.estado !== undefined ? String(product.estado) : 'true',
        },
    })

    const isLoading = loading || isSubmitting

    const onSubmit = async (data) => {
        const toastId = toast.loading(isEditing ? 'Actualizando producto...' : 'Creando producto...')

        try {
            const id = product?.Id || product?.id || product?._id

            const payload = {
                ...data,
                tasaInteres: parseFloat(data.tasaInteres),
                estado: data.estado === 'true' || data.estado === true,
            }

            if (isEditing) {
                await updateProduct(id, payload)
                toast.success('Producto actualizado correctamente', { id: toastId })
            } else {
                await createProduct(payload)
                toast.success('Producto creado correctamente', { id: toastId })
            }

            onClose()
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                    `Error al ${isEditing ? 'actualizar' : 'crear'} el producto`,
                { id: toastId }
            )
        }
    }

    const inputClass =
        'w-full bg-zinc-900 border border-zinc-800 text-white rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all placeholder:text-zinc-600 text-sm'

    return (
        <Modal title={isEditing ? 'Editar Producto' : 'Nuevo Producto'} onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                    <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                        Nombre
                    </label>
                    <input
                        {...register('nombre', { required: 'El nombre es requerido' })}
                        placeholder="Nombre del producto"
                        className={inputClass}
                        disabled={isLoading}
                    />
                    {errors.nombre && (
                        <p className="text-red-400 text-xs mt-1.5 ml-1">
                            {errors.nombre.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                        Descripción
                    </label>
                    <textarea
                        {...register('descripcion', { required: 'La descripción es requerida' })}
                        placeholder="Descripción del producto"
                        className={`${inputClass} resize-none`}
                        rows={3}
                        disabled={isLoading}
                    />
                    {errors.descripcion && (
                        <p className="text-red-400 text-xs mt-1.5 ml-1">
                            {errors.descripcion.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                        Tipo
                    </label>
                    <select
                        {...register('tipo', { required: 'El tipo es requerido' })}
                        className={`${inputClass} appearance-none cursor-pointer`}
                        disabled={isLoading}
                    >
                        <option value="">Seleccionar tipo</option>
                        <option value="ahorro">Ahorro</option>
                        <option value="credito">Crédito</option>
                        <option value="inversion">Inversión</option>
                    </select>
                    {errors.tipo && (
                        <p className="text-red-400 text-xs mt-1.5 ml-1">
                            {errors.tipo.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                        Tasa de Interés %
                    </label>
                    <input
                        {...register('tasaInteres', {
                            required: 'La tasa de interés es requerida',
                            min: { value: 0, message: 'Debe ser mayor o igual a 0' },
                        })}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className={inputClass}
                        disabled={isLoading}
                    />
                    {errors.tasaInteres && (
                        <p className="text-red-400 text-xs mt-1.5 ml-1">
                            {errors.tasaInteres.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                        Estado
                    </label>
                    <select
                        {...register('estado')}
                        className={`${inputClass} appearance-none cursor-pointer`}
                        disabled={isLoading}
                    >
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                    </select>
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
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl text-sm transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading
                            ? isEditing
                                ? 'Guardando...'
                                : 'Creando...'
                            : isEditing
                              ? 'Guardar Cambios'
                              : 'Crear Producto'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}

export default ProductForm