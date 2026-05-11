import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
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
        'w-full bg-zinc-800/50 border border-zinc-700/50 text-white rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-zinc-600'

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
                <div>
                    <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                        Tipo de Cuenta
                    </label>
                    <select
                        {...register('tipoCuenta', { required: 'El tipo es requerido' })}
                        className={`${inputClass} appearance-none`}
                    >
                        <option value="monetaria">Monetaria</option>
                        <option value="ahorro">Ahorro</option>
                    </select>
                    {errors.tipoCuenta && (
                        <p className="text-red-400 text-xs mt-1.5 ml-1">
                            {errors.tipoCuenta.message}
                        </p>
                    )}
                </div>

                {esAdmin && (
                    <div>
                        <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
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
                            <p className="text-red-400 text-xs mt-1.5 ml-1">
                                {errors.saldo.message}
                            </p>
                        )}
                    </div>
                )}

                {esAdmin && (
                    <div>
                        <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                            ID de Usuario
                        </label>
                        <input
                            {...register('usuario', {
                                required: !estaEditando ? 'El usuario es requerido' : false,
                            })}
                            placeholder="ID del usuario"
                            className={`${inputClass} ${
                                estaEditando ? 'opacity-60 cursor-not-allowed' : ''
                            }`}
                            disabled={estaEditando}
                        />
                        {errors.usuario && (
                            <p className="text-red-400 text-xs mt-1.5 ml-1">
                                {errors.usuario.message}
                            </p>
                        )}
                        {estaEditando && (
                            <p className="text-zinc-500 text-xs mt-1.5 ml-1">
                                El usuario propietario de la cuenta no se puede cambiar.
                            </p>
                        )}
                    </div>
                )}

                {!esAdmin && !estaEditando && (
                    <div className="bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-2xl px-4 py-3 text-sm">
                        Tu cuenta será creada a tu nombre y comenzará con saldo Q0.00.
                        El saldo únicamente puede cambiar por operaciones bancarias válidas.
                    </div>
                )}

                {esAdmin && estaEditando && (
                    <div>
                        <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                            Estado
                        </label>
                        <select
                            {...register('estado')}
                            className={`${inputClass} appearance-none`}
                        >
                            <option value="true">Activa</option>
                            <option value="false">Inactiva</option>
                        </select>
                    </div>
                )}

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