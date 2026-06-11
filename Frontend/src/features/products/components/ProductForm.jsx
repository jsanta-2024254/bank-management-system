import { useWatch, useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import {
    AlignLeft,
    BadgeDollarSign,
    CalendarDays,
    CreditCard,
    DollarSign,
    Landmark,
    Package,
    Percent,
    ShieldCheck,
} from 'lucide-react'
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
        'w-full rounded-2xl border border-[#d7bc73]/50 bg-white/58 px-5 py-3.5 text-sm font-semibold text-[#3b2a14] placeholder-[#a89365] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition-all focus:border-[#b98219]/70 focus:bg-white/80 focus:outline-none focus:ring-4 focus:ring-[#d9b45e]/18 disabled:cursor-not-allowed disabled:opacity-60'

    const labelClass =
        'mb-3 ml-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/75'

    const errorClass = 'mt-2 ml-1 text-xs font-semibold text-red-700'

    return (
        <Modal
            title={isEditing ? 'Editar Producto' : 'Nuevo Producto'}
            onClose={onClose}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="rounded-3xl border border-[#d7bc73]/40 bg-white/38 p-5">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#d7bc73]/45 bg-[#fff8df] text-[#8a611b] shadow-[0_12px_24px_rgba(154,107,22,0.12)]">
                            <Package size={20} />
                        </div>

                        <div>
                            <p className="text-sm font-black text-[#3f2c12]">
                                {isEditing
                                    ? 'Actualización de producto financiero'
                                    : 'Configuración de nuevo producto financiero'}
                            </p>

                            <p className="mt-1 text-sm leading-6 text-[#7a6849]">
                                Mantenga claros los datos comerciales, condiciones y disponibilidad del producto.
                            </p>
                        </div>
                    </div>
                </div>

                <div>
                    <label className={labelClass}>
                        <Landmark size={11} />
                        Nombre
                    </label>

                    <input
                        {...register('nombre', { required: 'El nombre es requerido' })}
                        placeholder={
                            esCredito
                                ? 'Ej. Crédito personal rápido'
                                : 'Nombre del producto'
                        }
                        className={inputClass}
                        disabled={isLoading}
                    />

                    {errors.nombre && (
                        <p className={errorClass}>{errors.nombre.message}</p>
                    )}
                </div>

                <div>
                    <label className={labelClass}>
                        <AlignLeft size={11} />
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
                        <p className={errorClass}>{errors.descripcion.message}</p>
                    )}
                </div>

                <div>
                    <label className={labelClass}>
                        <BadgeDollarSign size={11} />
                        Tipo
                    </label>

                    <select
                        {...register('tipo', { required: 'El tipo es requerido' })}
                        className={`${inputClass} cursor-pointer appearance-none`}
                        disabled={isLoading}
                    >
                        {tiposProducto.map((tipo) => (
                            <option key={tipo.value} value={tipo.value}>
                                {tipo.label}
                            </option>
                        ))}
                    </select>

                    {errors.tipo && (
                        <p className={errorClass}>{errors.tipo.message}</p>
                    )}
                </div>

                {esCredito ? (
                    <div className="space-y-5 rounded-3xl border border-[#d7bc73]/45 bg-[#fff8df]/52 p-5">
                        <div>
                            <h4 className="text-base font-black text-[#3f2c12]">
                                Configuración de crédito
                            </h4>

                            <p className="mt-1 text-sm leading-6 text-[#7a6849]">
                                El cliente no compra este producto. Envía una solicitud y el administrador decide si aprueba el desembolso.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className={labelClass}>
                                    <DollarSign size={11} />
                                    Monto mínimo
                                </label>

                                <input
                                    {...register('montoMinimo', {
                                        required: 'El monto mínimo es requerido',
                                        min: {
                                            value: 0.01,
                                            message: 'Debe ser mayor que 0',
                                        },
                                    })}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    className={inputClass}
                                    disabled={isLoading}
                                />

                                {errors.montoMinimo && (
                                    <p className={errorClass}>
                                        {errors.montoMinimo.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className={labelClass}>
                                    <DollarSign size={11} />
                                    Monto máximo
                                </label>

                                <input
                                    {...register('montoMaximo', {
                                        required: 'El monto máximo es requerido',
                                        min: {
                                            value: 0.01,
                                            message: 'Debe ser mayor que 0',
                                        },
                                    })}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    className={inputClass}
                                    disabled={isLoading}
                                />

                                {errors.montoMaximo && (
                                    <p className={errorClass}>
                                        {errors.montoMaximo.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className={labelClass}>
                                    <CalendarDays size={11} />
                                    Plazo mínimo en meses
                                </label>

                                <input
                                    {...register('plazoMesesMinimo', {
                                        required: 'El plazo mínimo es requerido',
                                        min: {
                                            value: 1,
                                            message: 'Debe ser mayor o igual a 1',
                                        },
                                    })}
                                    type="number"
                                    step="1"
                                    className={inputClass}
                                    disabled={isLoading}
                                />

                                {errors.plazoMesesMinimo && (
                                    <p className={errorClass}>
                                        {errors.plazoMesesMinimo.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className={labelClass}>
                                    <CalendarDays size={11} />
                                    Plazo máximo en meses
                                </label>

                                <input
                                    {...register('plazoMesesMaximo', {
                                        required: 'El plazo máximo es requerido',
                                        min: {
                                            value: 1,
                                            message: 'Debe ser mayor o igual a 1',
                                        },
                                    })}
                                    type="number"
                                    step="1"
                                    className={inputClass}
                                    disabled={isLoading}
                                />

                                {errors.plazoMesesMaximo && (
                                    <p className={errorClass}>
                                        {errors.plazoMesesMaximo.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className={labelClass}>
                                    <Percent size={11} />
                                    Tasa de interés anual %
                                </label>

                                <input
                                    {...register('tasaInteres', {
                                        required: 'La tasa de interés es requerida',
                                        min: {
                                            value: 0,
                                            message: 'Debe ser mayor o igual a 0',
                                        },
                                    })}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    className={inputClass}
                                    disabled={isLoading}
                                />

                                {errors.tasaInteres && (
                                    <p className={errorClass}>
                                        {errors.tasaInteres.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className={labelClass}>
                                    <Percent size={11} />
                                    Mora %
                                </label>

                                <input
                                    {...register('moraPorcentaje', {
                                        min: {
                                            value: 0,
                                            message: 'Debe ser mayor o igual a 0',
                                        },
                                    })}
                                    type="number"
                                    step="0.01"
                                    placeholder="5"
                                    className={inputClass}
                                    disabled={isLoading}
                                />

                                {errors.moraPorcentaje && (
                                    <p className={errorClass}>
                                        {errors.moraPorcentaje.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-5 rounded-3xl border border-[#d7bc73]/45 bg-white/36 p-5">
                        <div>
                            <h4 className="text-base font-black text-[#3f2c12]">
                                Configuración de cobro
                            </h4>

                            <p className="mt-1 text-sm leading-6 text-[#7a6849]">
                                Estos productos descuentan dinero de la cuenta del cliente al adquirirse.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className={labelClass}>
                                    <DollarSign size={11} />
                                    Precio
                                </label>

                                <input
                                    {...register('precio', {
                                        required: 'El precio es requerido',
                                        min: {
                                            value: 0.01,
                                            message: 'Debe ser mayor que 0',
                                        },
                                    })}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    className={inputClass}
                                    disabled={isLoading}
                                />

                                {errors.precio && (
                                    <p className={errorClass}>
                                        {errors.precio.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className={labelClass}>
                                    <Percent size={11} />
                                    Descuento app %
                                </label>

                                <input
                                    {...register('descuentoAppPorcentaje', {
                                        min: {
                                            value: 0,
                                            message: 'Debe ser mayor o igual a 0',
                                        },
                                        max: {
                                            value: 100,
                                            message: 'No puede ser mayor a 100',
                                        },
                                    })}
                                    type="number"
                                    step="0.01"
                                    placeholder="0"
                                    className={inputClass}
                                    disabled={isLoading}
                                />

                                {errors.descuentoAppPorcentaje && (
                                    <p className={errorClass}>
                                        {errors.descuentoAppPorcentaje.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {tipoSeleccionado !== 'suscripcion' && (
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClass}>
                                        <CreditCard size={11} />
                                        ¿Permite pago en cuotas?
                                    </label>

                                    <select
                                        {...register('permitePagoCuotas')}
                                        className={`${inputClass} appearance-none`}
                                        disabled={isLoading}
                                    >
                                        <option value="false">No</option>
                                        <option value="true">Sí</option>
                                    </select>
                                </div>

                                {permitePagoCuotas && (
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className={labelClass}>
                                                <CalendarDays size={11} />
                                                Cuotas mínimas
                                            </label>

                                            <input
                                                {...register('cuotasMinimas', {
                                                    min: {
                                                        value: 1,
                                                        message:
                                                            'Debe ser mayor o igual a 1',
                                                    },
                                                })}
                                                type="number"
                                                step="1"
                                                className={inputClass}
                                                disabled={isLoading}
                                            />

                                            {errors.cuotasMinimas && (
                                                <p className={errorClass}>
                                                    {errors.cuotasMinimas.message}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className={labelClass}>
                                                <CalendarDays size={11} />
                                                Cuotas máximas
                                            </label>

                                            <input
                                                {...register('cuotasMaximas', {
                                                    min: {
                                                        value: 1,
                                                        message:
                                                            'Debe ser mayor o igual a 1',
                                                    },
                                                })}
                                                type="number"
                                                step="1"
                                                className={inputClass}
                                                disabled={isLoading}
                                            />

                                            {errors.cuotasMaximas && (
                                                <p className={errorClass}>
                                                    {errors.cuotasMaximas.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {isEditing && (
                    <div>
                        <label className={labelClass}>
                            <ShieldCheck size={11} />
                            Estado
                        </label>

                        <select
                            {...register('estado')}
                            className={`${inputClass} cursor-pointer appearance-none`}
                            disabled={isLoading}
                        >
                            <option value="true">Activo</option>
                            <option value="false">Inactivo</option>
                        </select>
                    </div>
                )}

                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 rounded-2xl border border-[#d7bc73]/55 bg-white/45 px-5 py-4 text-sm font-black text-[#6f5a33] transition-all hover:bg-white/85 hover:text-[#3f2c12] disabled:cursor-not-allowed disabled:opacity-55"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 rounded-2xl border border-[#c89b3c]/50 bg-linear-to-r from-[#b98219] via-[#d9b45e] to-[#8a611b] px-5 py-4 text-sm font-black text-white shadow-[0_18px_36px_rgba(154,107,22,0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(154,107,22,0.32)] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0"
                    >
                        {isLoading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}

export default ProductForm