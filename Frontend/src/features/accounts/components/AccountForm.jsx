import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { CreditCard, ShieldCheck, UserRound, WalletCards } from 'lucide-react'
import Modal from '../../../shared/components/ui/Modal'
import useAccountStore from '../store/accountStore'
import useAuthStore from '../../auth/store/authStore'

const getUserRole = (user) => {
    return (
        user?.role ||
        user?.Role ||
        user?.roles?.[0] ||
        user?.Roles?.[0] ||
        'USER_ROLE'
    )
}

const AccountForm = ({ account, onClose }) => {
    const user = useAuthStore((state) => state.user)
    const role = getUserRole(user)
    const esAdmin = role === 'ADMIN_ROLE'
    const estaEditando = !!account

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            tipoCuenta: account?.tipoCuenta || 'monetaria',
            saldo: account?.saldo ?? 0,
            usuario: account?.usuario || account?.usuarioId || '',
            estado: account?.estado !== undefined ? String(account.estado) : 'true',
        },
    })

    const { createAccount, createMyAccount, updateAccount } = useAccountStore()

    const prepararDatos = (data) => {
        if (!esAdmin) {
            return {
                tipoCuenta: data.tipoCuenta,
            }
        }

        if (estaEditando) {
            return {
                tipoCuenta: data.tipoCuenta,
                saldo: Number(data.saldo),
                estado: data.estado === 'true' || data.estado === true,
            }
        }

        return {
            userId: data.usuario?.trim(),
            tipoCuenta: data.tipoCuenta,
            saldo: Number(data.saldo),
        }
    }

    const onSubmit = async (data) => {
        const toastId = toast.loading(
            estaEditando ? 'Actualizando cuenta...' : 'Creando cuenta...'
        )

        try {
            const payload = prepararDatos(data)

            if (estaEditando) {
                if (!esAdmin) {
                    toast.error('No tienes permiso para editar cuentas', { id: toastId })
                    return
                }

                await updateAccount(account._id || account.id, payload)
                toast.success('Cuenta actualizada correctamente', { id: toastId })
            } else if (esAdmin) {
                await createAccount(payload)
                toast.success('Cuenta creada correctamente', { id: toastId })
            } else {
                await createMyAccount(payload)
                toast.success('Cuenta creada correctamente con saldo inicial Q0.00', { id: toastId })
            }

            onClose()
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                    `Error al ${estaEditando ? 'actualizar' : 'crear'} la cuenta`,
                { id: toastId }
            )
        }
    }

    const inputClass =
        'w-full rounded-2xl border border-[#d7bc73]/50 bg-white/58 px-5 py-3.5 text-[#3b2a14] placeholder-[#a89365] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition-all focus:border-[#b98219]/70 focus:bg-white/80 focus:outline-none focus:ring-4 focus:ring-[#d9b45e]/18'

    const labelClass =
        'mb-3 block text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/75'

    const errorClass = 'mt-2 ml-1 text-xs font-semibold text-red-700'

    return (
        <Modal
            title={
                estaEditando
                    ? 'Editar Cuenta'
                    : esAdmin
                      ? 'Nueva Cuenta Administrativa'
                      : 'Abrir Nueva Cuenta'
            }
            onClose={onClose}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="rounded-3xl border border-[#d7bc73]/40 bg-white/38 p-5">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#d7bc73]/45 bg-[#fff8df] text-[#8a611b] shadow-[0_12px_24px_rgba(154,107,22,0.12)]">
                            <WalletCards size={20} />
                        </div>

                        <div>
                            <p className="text-sm font-black text-[#3f2c12]">
                                {estaEditando
                                    ? 'Actualización de cuenta bancaria'
                                    : 'Configuración de nueva cuenta'}
                            </p>

                            <p className="mt-1 text-sm leading-6 text-[#7a6849]">
                                {esAdmin
                                    ? 'Complete los datos administrativos de la cuenta.'
                                    : 'Seleccione el tipo de cuenta que desea abrir.'}
                            </p>
                        </div>
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Tipo de Cuenta</label>

                    <div className="relative">
                        <CreditCard
                            size={18}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9a6b16]/70"
                        />

                        <select
                            {...register('tipoCuenta', { required: 'El tipo es requerido' })}
                            className={`${inputClass} appearance-none pl-12`}
                        >
                            <option value="monetaria">Monetaria</option>
                            <option value="ahorro">Ahorro</option>
                        </select>
                    </div>

                    {errors.tipoCuenta && (
                        <p className={errorClass}>{errors.tipoCuenta.message}</p>
                    )}
                </div>

                {esAdmin && (
                    <div>
                        <label className={labelClass}>
                            Saldo {estaEditando ? 'actual' : 'inicial'} (Q)
                        </label>

                        <input
                            {...register('saldo', {
                                required: 'El saldo es requerido',
                                min: {
                                    value: 0,
                                    message: 'El saldo no puede ser negativo',
                                },
                            })}
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className={inputClass}
                        />

                        {errors.saldo && (
                            <p className={errorClass}>{errors.saldo.message}</p>
                        )}
                    </div>
                )}

                {esAdmin && (
                    <div>
                        <label className={labelClass}>ID de Usuario</label>

                        <div className="relative">
                            <UserRound
                                size={18}
                                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9a6b16]/70"
                            />

                            <input
                                {...register('usuario', {
                                    required: !estaEditando ? 'El usuario es requerido' : false,
                                })}
                                placeholder="ID del usuario"
                                className={`${inputClass} pl-12 ${
                                    estaEditando ? 'cursor-not-allowed opacity-60' : ''
                                }`}
                                disabled={estaEditando}
                            />
                        </div>

                        {errors.usuario && (
                            <p className={errorClass}>{errors.usuario.message}</p>
                        )}

                        {estaEditando && (
                            <p className="mt-2 ml-1 text-xs font-semibold text-[#8a6a3a]">
                                El usuario propietario de la cuenta no se puede cambiar.
                            </p>
                        )}
                    </div>
                )}

                {!esAdmin && !estaEditando && (
                    <div className="rounded-2xl border border-[#d7bc73]/45 bg-[#fff8df]/65 px-4 py-3 text-sm font-semibold leading-6 text-[#6f5a33]">
                        Tu cuenta será creada a tu nombre y comenzará con saldo Q0.00.
                        El saldo únicamente puede cambiar por operaciones bancarias válidas.
                    </div>
                )}

                {esAdmin && estaEditando && (
                    <div>
                        <label className={labelClass}>Estado</label>

                        <div className="relative">
                            <ShieldCheck
                                size={18}
                                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9a6b16]/70"
                            />

                            <select
                                {...register('estado')}
                                className={`${inputClass} appearance-none pl-12`}
                            >
                                <option value="true">Activa</option>
                                <option value="false">Inactiva</option>
                            </select>
                        </div>
                    </div>
                )}

                <div className="flex gap-4 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-2xl border border-[#d7bc73]/55 bg-white/45 py-4 text-sm font-black text-[#6f5a33] transition-all hover:bg-white/85 hover:text-[#3f2c12]"
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
                              : esAdmin
                                ? 'Crear Cuenta'
                                : 'Abrir Cuenta'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}

export default AccountForm