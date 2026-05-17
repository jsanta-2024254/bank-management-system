import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    User,
    Phone,
    IdCard,
    UserPlus,
} from 'lucide-react'
import { authApi } from '../../../shared/api/auth'

const RegisterForm = () => {
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            username: '',
            name: '',
            surname: '',
            email: '',
            password: '',
            confirmPassword: '',
            phone: '',
            dpi: '',
        },
    })

    const inputClass =
        'w-full bg-zinc-800/50 border border-zinc-700/50 rounded-2xl pl-12 pr-5 py-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all'

    const labelClass =
        'text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-3 block opacity-70'

    const errorClass = 'text-red-400 text-xs mt-2 ml-1'

    const prepararDatos = (data) => {
        return {
            username: data.username.trim(),
            name: data.name.trim(),
            surname: data.surname.trim(),
            email: data.email.trim(),
            password: data.password,
            phone: data.phone.trim(),
            dpi: data.dpi.trim(),
        }
    }

    const onSubmit = async (data) => {
        const toastId = toast.loading('Creando cuenta...')

        try {
            const datosRegistro = prepararDatos(data)

            await authApi.post('/auth/register', datosRegistro)

            toast.success('Cuenta creada. Revisa tu correo para verificarla', {
                id: toastId,
            })

            navigate('/login')
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                    error?.response?.data?.errors?.[0]?.message ||
                    'No se pudo crear la cuenta',
                { id: toastId }
            )
        }
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5 animate-in slide-in-from-bottom-4 duration-300"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Nombre</label>
                    <div className="relative group">
                        <User
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-400 transition-colors"
                        />
                        <input
                            {...register('name', {
                                required: 'El nombre es requerido',
                                maxLength: {
                                    value: 25,
                                    message: 'Máximo 25 caracteres',
                                },
                            })}
                            type="text"
                            placeholder="Nombre"
                            className={inputClass}
                        />
                    </div>
                    {errors.name && (
                        <p className={errorClass}>{errors.name.message}</p>
                    )}
                </div>

                <div>
                    <label className={labelClass}>Apellido</label>
                    <div className="relative group">
                        <User
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-400 transition-colors"
                        />
                        <input
                            {...register('surname', {
                                required: 'El apellido es requerido',
                                maxLength: {
                                    value: 25,
                                    message: 'Máximo 25 caracteres',
                                },
                            })}
                            type="text"
                            placeholder="Apellido"
                            className={inputClass}
                        />
                    </div>
                    {errors.surname && (
                        <p className={errorClass}>{errors.surname.message}</p>
                    )}
                </div>
            </div>

            <div>
                <label className={labelClass}>Usuario</label>
                <div className="relative group">
                    <UserPlus
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-400 transition-colors"
                    />
                    <input
                        {...register('username', {
                            required: 'El usuario es requerido',
                            maxLength: {
                                value: 50,
                                message: 'Máximo 50 caracteres',
                            },
                        })}
                        type="text"
                        placeholder="nombre_usuario"
                        className={inputClass}
                    />
                </div>
                {errors.username && (
                    <p className={errorClass}>{errors.username.message}</p>
                )}
            </div>

            <div>
                <label className={labelClass}>Correo electrónico</label>
                <div className="relative group">
                    <Mail
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-400 transition-colors"
                    />
                    <input
                        {...register('email', {
                            required: 'El correo es requerido',
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: 'Ingresa un correo válido',
                            },
                        })}
                        type="email"
                        placeholder="correo@ejemplo.com"
                        className={inputClass}
                    />
                </div>
                {errors.email && (
                    <p className={errorClass}>{errors.email.message}</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Contraseña</label>
                    <div className="relative group">
                        <Lock
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-400 transition-colors"
                        />
                        <input
                            {...register('password', {
                                required: 'La contraseña es requerida',
                                minLength: {
                                    value: 8,
                                    message: 'Mínimo 8 caracteres',
                                },
                            })}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-2xl pl-12 pr-12 py-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors p-1"
                        >
                            {showPassword ? (
                                <EyeOff size={18} />
                            ) : (
                                <Eye size={18} />
                            )}
                        </button>
                    </div>
                    {errors.password && (
                        <p className={errorClass}>{errors.password.message}</p>
                    )}
                </div>

                <div>
                    <label className={labelClass}>Confirmar contraseña</label>
                    <div className="relative group">
                        <Lock
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-400 transition-colors"
                        />
                        <input
                            {...register('confirmPassword', {
                                required: 'Confirma tu contraseña',
                                validate: (value) =>
                                    value === getValues('password') ||
                                    'Las contraseñas no coinciden',
                            })}
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-2xl pl-12 pr-12 py-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        />
                        <button
                            type="button"
                            onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors p-1"
                        >
                            {showConfirmPassword ? (
                                <EyeOff size={18} />
                            ) : (
                                <Eye size={18} />
                            )}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className={errorClass}>
                            {errors.confirmPassword.message}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Teléfono</label>
                    <div className="relative group">
                        <Phone
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-400 transition-colors"
                        />
                        <input
                            {...register('phone', {
                                required: 'El teléfono es requerido',
                                pattern: {
                                    value: /^\d{8}$/,
                                    message: 'El teléfono debe tener 8 dígitos',
                                },
                            })}
                            type="text"
                            placeholder="55555555"
                            className={inputClass}
                        />
                    </div>
                    {errors.phone && (
                        <p className={errorClass}>{errors.phone.message}</p>
                    )}
                </div>

                <div>
                    <label className={labelClass}>DPI</label>
                    <div className="relative group">
                        <IdCard
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-400 transition-colors"
                        />
                        <input
                            {...register('dpi', {
                                required: 'El DPI es requerido',
                                pattern: {
                                    value: /^\d{13}$/,
                                    message: 'El DPI debe tener 13 dígitos',
                                },
                            })}
                            type="text"
                            placeholder="1234567890101"
                            className={inputClass}
                        />
                    </div>
                    {errors.dpi && (
                        <p className={errorClass}>{errors.dpi.message}</p>
                    )}
                </div>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 mt-2"
            >
                {isSubmitting ? (
                    <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Creando cuenta...</span>
                    </div>
                ) : (
                    'Crear cuenta'
                )}
            </button>
        </form>
    )
}

export default RegisterForm