import { useWatch, useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import Modal from '../../../shared/components/ui/Modal'
import useProductStore from '../store/productStore'

const tiposProducto = [
    { value: 'servicio', label: 'Servicio / producto pagado' },
    { value: 'suscripcion', label: 'Suscripción mensual' },
    { value: 'credito', label: 'Oportunidad de crédito' },
    { value: 'ahorro', label: 'Ahorro' },
    { value: 'inversion', label: 'Inversión' },
]

const ProductForm = ({ product, onClose }) => {
    const isEditing = !!product
    const { createProduct, updateProduct, loading } = useProductStore()

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            nombre: product?.nombre || '',
            descripcion: product?.descripcion || '',
            tipo: product?.tipo || 'servicio',
            estado: product?.estado !== undefined ? String(product.estado) : 'true',
            precio: product?.precio ?? '',
            descuentoAppPorcentaje: product?.descuentoAppPorcentaje ?? 0,
            permitePagoCuotas: product?.permitePagoCuotas ? 'true' : 'false',
            cuotasMinimas: product?.cuotasMinimas ?? 1,
            cuotasMaximas: product?.cuotasMaximas ?? 1,
            tasaInteres: product?.tasaInteres ?? 0,
            moraPorcentaje: product?.moraPorcentaje ?? 5,
            plazoMesesMinimo: product?.plazoMesesMinimo ?? 1,
            plazoMesesMaximo: product?.plazoMesesMaximo ?? 60,
            montoMinimo: product?.montoMinimo ?? '',
            montoMaximo: product?.montoMaximo ?? '',
        },
    })

    const tipoSeleccionado = useWatch({ control, name: 'tipo' })
    const permitePagoCuotas = useWatch({ control, name: 'permitePagoCuotas' }) === 'true'
    const esCredito = tipoSeleccionado === 'credito'
    const isLoading = loading || isSubmitting

    const crearPayloadProducto = (data) => {
        const payload = {
            nombre: data.nombre,
            descripcion: data.descripcion,
            tipo: data.tipo,
            estado: data.estado === 'true' || data.estado === true,
        }

        if (data.tipo === 'credito') {
            return {
                ...payload,
                tasaInteres: Number(data.tasaInteres || 0),
                moraPorcentaje: Number(data.moraPorcentaje || 0),
                plazoMesesMinimo: Number(data.plazoMesesMinimo || 1),
                plazoMesesMaximo: Number(data.plazoMesesMaximo || 1),
                montoMinimo: Number(data.montoMinimo || 0),
                montoMaximo: Number(data.montoMaximo || 0),
            }
        }

        return {
            ...payload,
            precio: Number(data.precio || 0),
            descuentoAppPorcentaje: Number(data.descuentoAppPorcentaje || 0),
            permitePagoCuotas: data.permitePagoCuotas === 'true',
            cuotasMinimas: Number(data.cuotasMinimas || 1),
            cuotasMaximas: Number(data.cuotasMaximas || 1),
        }
    }

    const onSubmit = async (data) => {
        const toastId = toast.loading(
            isEditing ? 'Actualizando producto...' : 'Creando producto...'
        )

        try {
            const id = product?.Id || product?.id || product?._id
            const payload = crearPayloadProducto(data)

            if (isEditing) {
                await updateProduct(id, payload)
                toast.success('Producto actualizado correctamente', { id: toastId })
            } else {
                await createProduct(payload)
                toast.success(
                    esCredito
                        ? 'Oportunidad de crédito creada correctamente'
                        : 'Producto creado correctamente',
                    { id: toastId }
                )
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
        'w-full bg-zinc-900 border border-zinc-800 text-white rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all placeholder:text-zinc-600 text-sm disabled:opacity-60 disabled:cursor-not-allowed'

    return (
        <Modal
            title={isEditing ? 'Editar Producto' : 'Nuevo Producto'}
            onClose={onClose}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                    <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                        Nombre
                    </label>
                    <input
                        {...register('nombre', { required: 'El nombre es requerido' })}
                        placeholder={esCredito ? 'Ej. Crédito personal rápido' : 'Nombre del producto'}
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
                        {...register('descripcion', {
                            required: 'La descripción es requerida',
                        })}
                        placeholder={
                            esCredito
                                ? 'Condiciones generales de la oportunidad de crédito'
                                : 'Descripción del producto o servicio'
                        }
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
                        {tiposProducto.map((tipo) => (
                            <option key={tipo.value} value={tipo.value}>
                                {tipo.label}
                            </option>
                        ))}
                    </select>
                    {errors.tipo && (
                        <p className="text-red-400 text-xs mt-1.5 ml-1">
                            {errors.tipo.message}
                        </p>
                    )}
                </div>

                {esCredito ? (
                    <div className="space-y-5 rounded-3xl border border-blue-500/20 bg-blue-500/5 p-5">
                        <div>
                            <h4 className="text-white font-bold">Configuración de crédito</h4>
                            <p className="text-zinc-500 text-sm mt-1">
                                El cliente no compra este producto. Envía una solicitud y el administrador decide si aprueba el desembolso.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                                    Monto mínimo
                                </label>
                                <input
                                    {...register('montoMinimo', {
                                        required: 'El monto mínimo es requerido',
                                        min: { value: 0.01, message: 'Debe ser mayor que 0' },
                                    })}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    className={inputClass}
                                    disabled={isLoading}
                                />
                                {errors.montoMinimo && (
                                    <p className="text-red-400 text-xs mt-1.5 ml-1">
                                        {errors.montoMinimo.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                                    Monto máximo
                                </label>
                                <input
                                    {...register('montoMaximo', {
                                        required: 'El monto máximo es requerido',
                                        min: { value: 0.01, message: 'Debe ser mayor que 0' },
                                    })}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    className={inputClass}
                                    disabled={isLoading}
                                />
                                {errors.montoMaximo && (
                                    <p className="text-red-400 text-xs mt-1.5 ml-1">
                                        {errors.montoMaximo.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                                    Plazo mínimo en meses
                                </label>
                                <input
                                    {...register('plazoMesesMinimo', {
                                        required: 'El plazo mínimo es requerido',
                                        min: { value: 1, message: 'Debe ser mayor o igual a 1' },
                                    })}
                                    type="number"
                                    step="1"
                                    className={inputClass}
                                    disabled={isLoading}
                                />
                                {errors.plazoMesesMinimo && (
                                    <p className="text-red-400 text-xs mt-1.5 ml-1">
                                        {errors.plazoMesesMinimo.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                                    Plazo máximo en meses
                                </label>
                                <input
                                    {...register('plazoMesesMaximo', {
                                        required: 'El plazo máximo es requerido',
                                        min: { value: 1, message: 'Debe ser mayor o igual a 1' },
                                    })}
                                    type="number"
                                    step="1"
                                    className={inputClass}
                                    disabled={isLoading}
                                />
                                {errors.plazoMesesMaximo && (
                                    <p className="text-red-400 text-xs mt-1.5 ml-1">
                                        {errors.plazoMesesMaximo.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                                    Tasa de interés anual %
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
                                    Mora %
                                </label>
                                <input
                                    {...register('moraPorcentaje', {
                                        min: { value: 0, message: 'Debe ser mayor o igual a 0' },
                                    })}
                                    type="number"
                                    step="0.01"
                                    placeholder="5"
                                    className={inputClass}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-5 rounded-3xl border border-white/5 bg-white/2 p-5">
                        <div>
                            <h4 className="text-white font-bold">Configuración de cobro</h4>
                            <p className="text-zinc-500 text-sm mt-1">
                                Estos productos descuentan dinero de la cuenta del cliente al adquirirse.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                                    Precio
                                </label>
                                <input
                                    {...register('precio', {
                                        required: 'El precio es requerido',
                                        min: { value: 0.01, message: 'Debe ser mayor que 0' },
                                    })}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    className={inputClass}
                                    disabled={isLoading}
                                />
                                {errors.precio && (
                                    <p className="text-red-400 text-xs mt-1.5 ml-1">
                                        {errors.precio.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                                    Descuento app %
                                </label>
                                <input
                                    {...register('descuentoAppPorcentaje', {
                                        min: { value: 0, message: 'Debe ser mayor o igual a 0' },
                                        max: { value: 100, message: 'No puede ser mayor a 100' },
                                    })}
                                    type="number"
                                    step="0.01"
                                    placeholder="0"
                                    className={inputClass}
                                    disabled={isLoading}
                                />
                                {errors.descuentoAppPorcentaje && (
                                    <p className="text-red-400 text-xs mt-1.5 ml-1">
                                        {errors.descuentoAppPorcentaje.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {tipoSeleccionado !== 'suscripcion' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                                        ¿Permite pago en cuotas?
                                    </label>
                                    <select
                                        {...register('permitePagoCuotas')}
                                        className={inputClass}
                                        disabled={isLoading}
                                    >
                                        <option value="false">No</option>
                                        <option value="true">Sí</option>
                                    </select>
                                </div>

                                {permitePagoCuotas && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                                                Cuotas mínimas
                                            </label>
                                            <input
                                                {...register('cuotasMinimas', {
                                                    min: { value: 1, message: 'Debe ser mayor o igual a 1' },
                                                })}
                                                type="number"
                                                step="1"
                                                className={inputClass}
                                                disabled={isLoading}
                                            />
                                        </div>

                                        <div>
                                            <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                                                Cuotas máximas
                                            </label>
                                            <input
                                                {...register('cuotasMaximas', {
                                                    min: { value: 1, message: 'Debe ser mayor o igual a 1' },
                                                })}
                                                type="number"
                                                step="1"
                                                className={inputClass}
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {isEditing && (
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
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-3 rounded-2xl text-sm font-bold transition-all disabled:opacity-60"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl text-sm font-bold transition-all disabled:opacity-60"
                    >
                        {isLoading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}

export default ProductForm