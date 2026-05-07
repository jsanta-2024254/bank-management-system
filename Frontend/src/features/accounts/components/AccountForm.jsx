import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { CreditCard, User as UserIcon, DollarSign } from 'lucide-react'
import Modal from '../../../shared/components/ui/Modal'
import useAccountStore from '../store/accountStore'

const AccountForm = ({ account, onClose }) => {
    const isEditing = !!account
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            tipoCuenta: account?.tipoCuenta || 'monetaria',
            saldo: account?.saldo || 0,
            usuario: account?.usuario || '',
            estado: account?.estado !== undefined ? account.estado : true,
        },
    })

    const { createAccount, updateAccount } = useAccountStore()

    const onSubmit = async (data) => {
        const toastId = toast.loading(isEditing ? 'Actualizando cuenta...' : 'Creando cuenta...')
        try {
            const payload = {
                ...data,
                saldo: parseFloat(data.saldo),
                estado: data.estado === 'true' || data.estado === true,
            }
            if (isEditing) {
                await updateAccount(account._id, payload)
                toast.success('Cuenta actualizada correctamente', { id: toastId })
            } else {
                await createAccount(payload)
                toast.success('Cuenta creada correctamente', { id: toastId })
            }
            onClose()
        } catch (error) {
            toast.error(error?.response?.data?.message || `Error al ${isEditing ? 'actualizar' : 'crear'} la cuenta`, { id: toastId })
        }
    }

    const inputClass = "w-full bg-zinc-800/50 border border-zinc-700/50 text-white rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-zinc-600"

    return (
        <Modal title={isEditing ? 'Editar Cuenta' : 'Nueva Cuenta'} onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                    <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">Tipo de Cuenta</label>
                    <select {...register('tipoCuenta', { required: 'El tipo es requerido' })} className={`${inputClass} appearance-none`}>
                        <option value="monetaria">Monetaria</option>
                        <option value="ahorro">Ahorro</option>
                    </select>
                    {errors.tipoCuenta && <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.tipoCuenta.message}</p>}
                </div>

                <div>
                    <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">Saldo Inicial (Q)</label>
                    <input
                        {...register('saldo', { required: 'El saldo es requerido', min: { value: 0, message: 'El saldo no puede ser negativo' } })}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className={inputClass}
                    />
                    {errors.saldo && <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.saldo.message}</p>}
                </div>

                <div>
                    <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">ID de Usuario</label>
                    <input
                        {...register('usuario', { required: 'El usuario es requerido' })}
                        placeholder="usr_xxxxxxxxx"
                        className={inputClass}
                    />
                    {errors.usuario && <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.usuario.message}</p>}
                </div>

                {isEditing && (
                    <div>
                        <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">Estado</label>
                        <select {...register('estado')} className={`${inputClass} appearance-none`}>
                            <option value={true}>Activa</option>
                            <option value={false}>Inactiva</option>
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
                        {isSubmitting ? (isEditing ? 'Guardando...' : 'Creando...') : (isEditing ? 'Guardar Cambios' : 'Crear Cuenta')}
                    </button>
                </div>
            </form>
        </Modal>
    )
}

export default AccountForm