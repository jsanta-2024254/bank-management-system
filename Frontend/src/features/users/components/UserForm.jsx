import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import {
    User,
    Mail,
    Lock,
    IdCard,
    Phone,
    DollarSign,
    MapPin,
    BriefcaseBusiness,
    CreditCard,
    UserPlus,
} from 'lucide-react'
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
            nombreTrabajo:
                user?.nombreTrabajo || user?.ClientProfile?.NombreTrabajo || '',
            ingresosMensuales:
                user?.ingresosMensuales ||
                user?.ClientProfile?.IngresosMensuales ||
                '',
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
            const id = user?.Id || user?.id || user?._id
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
        'w-full rounded-2xl border border-[#d7bc73]/50 bg-white/58 px-5 py-3.5 text-sm font-semibold text-[#3b2a14] placeholder-[#a89365] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition-all focus:border-[#b98219]/70 focus:bg-white/80 focus:outline-none focus:ring-4 focus:ring-[#d9b45e]/18 disabled:cursor-not-allowed disabled:opacity-60'

    const labelClass =
        'mb-3 ml-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/75'

    const errorClass = 'mt-2 ml-1 text-xs font-semibold text-red-700'

    const iconClass =
        'pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9a6b16]/70'

    return (
        <Modal
            title={estaEditando ? 'Editar Usuario' : 'Nuevo Usuario'}
            onClose={onClose}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="rounded-3xl border border-[#d7bc73]/40 bg-white/38 p-5">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#d7bc73]/45 bg-[#fff8df] text-[#8a611b] shadow-[0_12px_24px_rgba(154,107,22,0.12)]">
                            <UserPlus size={20} />
                        </div>

                        <div>
                            <p className="text-sm font-black text-[#3f2c12]">
                                {estaEditando
                                    ? 'Actualización de datos del usuario'
                                    : 'Creación de usuario bancario'}
                            </p>

                            <p className="mt-1 text-sm leading-6 text-[#7a6849]">
                                {estaEditando
                                    ? 'Modifique únicamente los datos permitidos para este usuario.'
                                    : 'Complete los datos personales, laborales y la cuenta inicial del cliente.'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className={labelClass}>
                            <User size={11} />
                            Nombre
                        </label>

                        <div className="relative">
                            <User size={15} className={iconClass} />

                            <input
                                {...register('nombre', {
                                    required: 'El nombre es requerido',
                                })}
                                placeholder="Nombre"
                                className={`${inputClass} pl-10`}
                                disabled={isSubmitting}
                            />
                        </div>

                        {errors.nombre && (
                            <p className={errorClass}>{errors.nombre.message}</p>
                        )}
                    </div>

                    <div>
                        <label className={labelClass}>
                            <User size={11} />
                            Apellido
                        </label>

                        <div className="relative">
                            <User size={15} className={iconClass} />

                            <input
                                {...register('apellido', {
                                    required: 'El apellido es requerido',
                                })}
                                placeholder="Apellido"
                                className={`${inputClass} pl-10`}
                                disabled={isSubmitting}
                            />
                        </div>

                        {errors.apellido && (
                            <p className={errorClass}>{errors.apellido.message}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className={labelClass}>
                            <UserPlus size={11} />
                            Usuario
                        </label>

                        <div className="relative">
                            <UserPlus size={15} className={iconClass} />

                            <input
                                {...register('username', {
                                    required: 'El usuario es requerido',
                                })}
                                placeholder="nombre_usuario"
                                className={`${inputClass} pl-10`}
                                disabled={isSubmitting}
                            />
                        </div>

                        {errors.username && (
                            <p className={errorClass}>
                                {errors.username.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className={labelClass}>
                            <Mail size={11} />
                            Correo
                        </label>

                        <div className="relative">
                            <Mail size={15} className={iconClass} />

                            <input
                                {...register('email', {
                                    required: 'El correo es requerido',
                                })}
                                type="email"
                                placeholder="correo@ejemplo.com"
                                className={`${inputClass} pl-10`}
                                disabled={isSubmitting}
                            />
                        </div>

                        {errors.email && (
                            <p className={errorClass}>{errors.email.message}</p>
                        )}
                    </div>
                </div>

                {!estaEditando && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className={labelClass}>
                                <Lock size={11} />
                                Contraseña
                            </label>

                            <div className="relative">
                                <Lock size={15} className={iconClass} />

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
                                    className={`${inputClass} pl-10`}
                                    disabled={isSubmitting}
                                />
                            </div>

                            {errors.password && (
                                <p className={errorClass}>
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className={labelClass}>
                                <IdCard size={11} />
                                DPI
                            </label>

                            <div className="relative">
                                <IdCard size={15} className={iconClass} />

                                <input
                                    {...register('dpi', {
                                        required: 'El DPI es requerido',
                                        pattern: {
                                            value: /^\d{13}$/,
                                            message: 'El DPI debe tener 13 dígitos',
                                        },
                                    })}
                                    placeholder="1234567890101"
                                    className={`${inputClass} pl-10`}
                                    disabled={isSubmitting}
                                />
                            </div>

                            {errors.dpi && (
                                <p className={errorClass}>{errors.dpi.message}</p>
                            )}
                        </div>
                    </div>
                )}

                {!estaEditando && (
                    <div className="rounded-3xl border border-[#d7bc73]/45 bg-[#fff8df]/52 p-5">
                        <div className="mb-4">
                            <h4 className="text-base font-black text-[#3f2c12]">
                                Cuenta inicial
                            </h4>

                            <p className="mt-1 text-sm leading-6 text-[#7a6849]">
                                Al crear el usuario también se configura su primera cuenta bancaria.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className={labelClass}>
                                    <CreditCard size={11} />
                                    Tipo de cuenta
                                </label>

                                <select
                                    {...register('tipoCuenta')}
                                    className={`${inputClass} cursor-pointer appearance-none`}
                                    disabled={isSubmitting}
                                >
                                    <option value="monetaria">Monetaria</option>
                                    <option value="ahorro">Ahorro</option>
                                </select>
                            </div>

                            <div>
                                <label className={labelClass}>
                                    <DollarSign size={11} />
                                    Saldo inicial (Q)
                                </label>

                                <div className="relative">
                                    <DollarSign size={15} className={iconClass} />

                                    <input
                                        {...register('saldoInicial', {
                                            min: {
                                                value: 0,
                                                message:
                                                    'El saldo inicial no puede ser negativo',
                                            },
                                        })}
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        className={`${inputClass} pl-10`}
                                        disabled={isSubmitting}
                                    />
                                </div>

                                {errors.saldoInicial && (
                                    <p className={errorClass}>
                                        {errors.saldoInicial.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className={labelClass}>
                            <Phone size={11} />
                            Celular
                        </label>

                        <div className="relative">
                            <Phone size={15} className={iconClass} />

                            <input
                                {...register('celular', {
                                    required: 'El celular es requerido',
                                    pattern: {
                                        value: /^\d{8}$/,
                                        message:
                                            'El celular debe tener 8 dígitos',
                                    },
                                })}
                                placeholder="55555555"
                                className={`${inputClass} pl-10`}
                                disabled={isSubmitting}
                            />
                        </div>

                        {errors.celular && (
                            <p className={errorClass}>{errors.celular.message}</p>
                        )}
                    </div>

                    <div>
                        <label className={labelClass}>
                            <DollarSign size={11} />
                            Ingresos mensuales
                        </label>

                        <div className="relative">
                            <DollarSign size={15} className={iconClass} />

                            <input
                                {...register('ingresosMensuales', {
                                    required:
                                        'Los ingresos mensuales son requeridos',
                                    min: {
                                        value: 100,
                                        message:
                                            'Los ingresos deben ser al menos Q100',
                                    },
                                })}
                                type="number"
                                min="100"
                                step="0.01"
                                placeholder="5000"
                                className={`${inputClass} pl-10`}
                                disabled={isSubmitting}
                            />
                        </div>

                        {errors.ingresosMensuales && (
                            <p className={errorClass}>
                                {errors.ingresosMensuales.message}
                            </p>
                        )}
                    </div>
                </div>

                <div>
                    <label className={labelClass}>
                        <MapPin size={11} />
                        Dirección
                    </label>

                    <div className="relative">
                        <MapPin size={15} className={iconClass} />

                        <input
                            {...register('direccion', {
                                required: 'La dirección es requerida',
                            })}
                            placeholder="Dirección"
                            className={`${inputClass} pl-10`}
                            disabled={isSubmitting}
                        />
                    </div>

                    {errors.direccion && (
                        <p className={errorClass}>{errors.direccion.message}</p>
                    )}
                </div>

                <div>
                    <label className={labelClass}>
                        <BriefcaseBusiness size={11} />
                        Lugar de trabajo
                    </label>

                    <div className="relative">
                        <BriefcaseBusiness size={15} className={iconClass} />

                        <input
                            {...register('nombreTrabajo', {
                                required: 'El lugar de trabajo es requerido',
                            })}
                            placeholder="Empresa / trabajo"
                            className={`${inputClass} pl-10`}
                            disabled={isSubmitting}
                        />
                    </div>

                    {errors.nombreTrabajo && (
                        <p className={errorClass}>
                            {errors.nombreTrabajo.message}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-3 pt-4 sm:flex-row">
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