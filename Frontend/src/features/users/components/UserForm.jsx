import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import Modal from '../../../shared/components/ui/Modal'
import useUserStore from '../store/userStore'

const UserForm = ({ user, onClose }) => {
    const estaEditando = !!user

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            nombre: user?.nombre || user?.Name || user?.name || '',
            apellido: user?.apellido || user?.Surname || user?.surname || '',
            username: user?.username || user?.Username || '',
            email: user?.email || user?.Email || '',
            password: '',
            celular: user?.celular || user?.UserProfile?.Phone || '',
            dpi: user?.dpi || user?.ClientProfile?.Dpi || '',
            direccion: user?.direccion || user?.ClientProfile?.Direccion || '',
            nombreTrabajo: user?.nombreTrabajo || user?.ClientProfile?.NombreTrabajo || '',
            ingresosMensuales:
                user?.ingresosMensuales || user?.ClientProfile?.IngresosMensuales || '',
            tipoCuenta: 'monetaria',
            saldoInicial: 0,
        },
    })

    const { createUser, updateUser } = useUserStore()

    const prepararDatos = (data) => {
        const datosUsuario = {
            nombre: data.nombre?.trim(),
            apellido: data.apellido?.trim(),
            username: data.username?.trim(),
            email: data.email?.trim(),
            celular: data.celular?.trim(),
            direccion: data.direccion?.trim(),
            nombreTrabajo: data.nombreTrabajo?.trim(),
            ingresosMensuales: Number(data.ingresosMensuales),
        }

        if (!estaEditando) {
            datosUsuario.password = data.password
            datosUsuario.dpi = data.dpi?.trim()
            datosUsuario.tipoCuenta = data.tipoCuenta
            datosUsuario.saldoInicial = Number(data.saldoInicial || 0)
        }

        return datosUsuario
    }

    const onSubmit = async (data) => {
        const toastId = toast.loading(
            estaEditando ? 'Actualizando usuario...' : 'Creando usuario...'
        )

        try {
            const id = user?.Id || user?.id
            const datosUsuario = prepararDatos(data)

            if (estaEditando) {
                await updateUser(id, datosUsuario)
                toast.success('Usuario actualizado correctamente', { id: toastId })
            } else {
                await createUser(datosUsuario)
                toast.success('Usuario creado correctamente', { id: toastId })
            }

            onClose()
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                    `Error al ${estaEditando ? 'actualizar' : 'crear'} el usuario`,
                { id: toastId }
            )
        }
    }

    const inputClass =
        'w-full bg-zinc-800/50 border border-zinc-700/50 text-white rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-zinc-600'

    return (
        <Modal title={estaEditando ? 'Editar Usuario' : 'Nuevo Usuario'} onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                            Nombre
                        </label>
                        <input
                            {...register('nombre', { required: 'El nombre es requerido' })}
                            placeholder="Nombre"
                            className={inputClass}
                        />
                        {errors.nombre && (
                            <p className="text-red-400 text-xs mt-1.5 ml-1">
                                {errors.nombre.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                            Apellido
                        </label>
                        <input
                            {...register('apellido', { required: 'El apellido es requerido' })}
                            placeholder="Apellido"
                            className={inputClass}
                        />
                        {errors.apellido && (
                            <p className="text-red-400 text-xs mt-1.5 ml-1">
                                {errors.apellido.message}
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                            Usuario
                        </label>
                        <input
                            {...register('username', { required: 'El usuario es requerido' })}
                            placeholder="nombre_usuario"
                            className={inputClass}
                        />
                        {errors.username && (
                            <p className="text-red-400 text-xs mt-1.5 ml-1">
                                {errors.username.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                            Correo
                        </label>
                        <input
                            {...register('email', { required: 'El correo es requerido' })}
                            type="email"
                            placeholder="correo@ejemplo.com"
                            className={inputClass}
                        />
                        {errors.email && (
                            <p className="text-red-400 text-xs mt-1.5 ml-1">
                                {errors.email.message}
                            </p>
                        )}
                    </div>
                </div>

                {!estaEditando && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                                Contraseña
                            </label>
                            <input
                                {...register('password', {
                                    required: 'La contraseña es requerida',
                                    minLength: {
                                        value: 8,
                                        message: 'Mínimo 8 caracteres',
                                    },
                                })}
                                type="password"
                                placeholder="••••••••"
                                className={inputClass}
                            />
                            {errors.password && (
                                <p className="text-red-400 text-xs mt-1.5 ml-1">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                                DPI
                            </label>
                            <input
                                {...register('dpi', {
                                    required: 'El DPI es requerido',
                                    pattern: {
                                        value: /^\d{13}$/,
                                        message: 'El DPI debe tener 13 dígitos',
                                    },
                                })}
                                placeholder="1234567890101"
                                className={inputClass}
                            />
                            {errors.dpi && (
                                <p className="text-red-400 text-xs mt-1.5 ml-1">
                                    {errors.dpi.message}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {!estaEditando && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                                Tipo de cuenta
                            </label>
                            <select
                                {...register('tipoCuenta')}
                                className={`${inputClass} appearance-none cursor-pointer`}
                            >
                                <option value="monetaria">Monetaria</option>
                                <option value="ahorro">Ahorro</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                                Saldo inicial (Q)
                            </label>
                            <input
                                {...register('saldoInicial', {
                                    min: {
                                        value: 0,
                                        message: 'El saldo inicial no puede ser negativo',
                                    },
                                })}
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                className={inputClass}
                            />
                            {errors.saldoInicial && (
                                <p className="text-red-400 text-xs mt-1.5 ml-1">
                                    {errors.saldoInicial.message}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                            Celular
                        </label>
                        <input
                            {...register('celular', {
                                required: 'El celular es requerido',
                                pattern: {
                                    value: /^\d{8}$/,
                                    message: 'El celular debe tener 8 dígitos',
                                },
                            })}
                            placeholder="55555555"
                            className={inputClass}
                        />
                        {errors.celular && (
                            <p className="text-red-400 text-xs mt-1.5 ml-1">
                                {errors.celular.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                            Ingresos mensuales
                        </label>
                        <input
                            {...register('ingresosMensuales', {
                                required: 'Los ingresos mensuales son requeridos',
                                min: {
                                    value: 100,
                                    message: 'Los ingresos deben ser al menos Q100',
                                },
                            })}
                            type="number"
                            min="100"
                            step="0.01"
                            placeholder="5000"
                            className={inputClass}
                        />
                        {errors.ingresosMensuales && (
                            <p className="text-red-400 text-xs mt-1.5 ml-1">
                                {errors.ingresosMensuales.message}
                            </p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                        Dirección
                    </label>
                    <input
                        {...register('direccion', { required: 'La dirección es requerida' })}
                        placeholder="Dirección"
                        className={inputClass}
                    />
                    {errors.direccion && (
                        <p className="text-red-400 text-xs mt-1.5 ml-1">
                            {errors.direccion.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                        Lugar de trabajo
                    </label>
                    <input
                        {...register('nombreTrabajo', {
                            required: 'El lugar de trabajo es requerido',
                        })}
                        placeholder="Empresa / trabajo"
                        className={inputClass}
                    />
                    {errors.nombreTrabajo && (
                        <p className="text-red-400 text-xs mt-1.5 ml-1">
                            {errors.nombreTrabajo.message}
                        </p>
                    )}
                </div>

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
                        {isSubmitting
                            ? estaEditando
                                ? 'Guardando...'
                                : 'Creando...'
                            : estaEditando
                              ? 'Guardar Cambios'
                              : 'Crear Usuario'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}

export default UserForm