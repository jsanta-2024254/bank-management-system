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
        'w-full rounded-2xl border border-[#d7bc73]/50 bg-white/58 py-4 pl-12 pr-5 text-[#3b2a14] placeholder-[#a89365] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition-all focus:border-[#b98219]/70 focus:bg-white/80 focus:outline-none focus:ring-4 focus:ring-[#d9b45e]/18'

    const passwordInputClass =
        'w-full rounded-2xl border border-[#d7bc73]/50 bg-white/58 py-4 pl-12 pr-12 text-[#3b2a14] placeholder-[#a89365] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition-all focus:border-[#b98219]/70 focus:bg-white/80 focus:outline-none focus:ring-4 focus:ring-[#d9b45e]/18'

    const labelClass =
        'mb-3 block text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/75'

    const errorClass = 'mt-2 ml-1 text-xs font-semibold text-red-700'

    const iconClass =
        'absolute left-4 top-1/2 -translate-y-1/2 text-[#9a6b16]/70 transition-colors group-focus-within:text-[#7a4f0d]'

    const eyeButtonClass =
        'absolute right-4 top-1/2 -translate-y-1/2 rounded-xl p-1 text-[#9a6b16]/70 transition-colors hover:bg-[#efe0bd]/70 hover:text-[#3f2c12]'

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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label className={labelClass}>Nombre</label>

                    <div className="group relative">
                        <User size={18} className={iconClass} />

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

                    <div className="group relative">
                        <User size={18} className={iconClass} />

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

                <div className="group relative">
                    <UserPlus size={18} className={iconClass} />

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

                <div className="group relative">
                    <Mail size={18} className={iconClass} />

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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label className={labelClass}>Contraseña</label>

                    <div className="group relative">
                        <Lock size={18} className={iconClass} />

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
                            className={passwordInputClass}
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className={eyeButtonClass}
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

                    <div className="group relative">
                        <Lock size={18} className={iconClass} />

                        <input
                            {...register('confirmPassword', {
                                required: 'Confirma tu contraseña',
                                validate: (value) =>
                                    value === getValues('password') ||
                                    'Las contraseñas no coinciden',
                            })}
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            className={passwordInputClass}
                        />

                        <button
                            type="button"
                            onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                            }
                            className={eyeButtonClass}
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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label className={labelClass}>Teléfono</label>

                    <div className="group relative">
                        <Phone size={18} className={iconClass} />

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

                    <div className="group relative">
                        <IdCard size={18} className={iconClass} />

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
                className="mt-2 w-full rounded-2xl border border-[#c89b3c]/50 bg-linear-to-r from-[#b98219] via-[#d9b45e] to-[#8a611b] py-4 font-black text-white shadow-[0_18px_36px_rgba(154,107,22,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(154,107,22,0.34)] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0"
            >
                {isSubmitting ? (
                    <div className="flex items-center justify-center gap-3">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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