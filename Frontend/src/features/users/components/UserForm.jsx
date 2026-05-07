import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { User as UserIcon, Mail, Lock, Shield } from 'lucide-react'
import Modal from '../../../shared/components/ui/Modal'
import useUserStore from '../store/userStore'

const UserForm = ({ user, onClose }) => {
    const isEditing = !!user
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            name: user?.Name || user?.name || '',
            surname: user?.Surname || user?.surname || '',
            username: user?.Username || user?.username || '',
            email: user?.Email || user?.email || '',
            password: '',
            role: user?.roles?.[0] || 'USER_ROLE',
        },
    })

    const { createUser, updateUser } = useUserStore()

    const onSubmit = async (data) => {
        const toastId = toast.loading(isEditing ? 'Actualizando usuario...' : 'Creando usuario...')
        try {
            const id = user?.Id || user?.id
            if (isEditing) {
                await updateUser(id, data)
                toast.success('Usuario actualizado correctamente', { id: toastId })
            } else {
                await createUser(data)
                toast.success('Usuario creado correctamente', { id: toastId })
            }
            onClose()
        } catch (error) {
            toast.error(error?.response?.data?.message || `Error al ${isEditing ? 'actualizar' : 'crear'} el usuario`, { id: toastId })
        }
    }

    const inputClass = "w-full bg-zinc-800/50 border border-zinc-700/50 text-white rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-zinc-600"

    return (
        <Modal title={isEditing ? 'Editar Usuario' : 'Nuevo Usuario'} onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">Nombre</label>
                        <input {...register('name', { required: 'El nombre es requerido' })} placeholder="Nombre" className={inputClass} />
                        {errors.name && <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.name.message}</p>}
                    </div>
                    <div>
                        <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">Apellido</label>
                        <input {...register('surname', { required: 'El apellido es requerido' })} placeholder="Apellido" className={inputClass} />
                        {errors.surname && <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.surname.message}</p>}
                    </div>
                </div>

                <div>
                    <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">Usuario</label>
                    <input {...register('username', { required: 'El usuario es requerido' })} placeholder="nombre_usuario" className={inputClass} />
                    {errors.username && <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.username.message}</p>}
                </div>

                <div>
                    <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">Correo</label>
                    <input {...register('email', { required: 'El correo es requerido' })} type="email" placeholder="correo@ejemplo.com" className={inputClass} />
                    {errors.email && <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.email.message}</p>}
                </div>

                {!isEditing && (
                    <div>
                        <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">Contraseña</label>
                        <input
                            {...register('password', { required: 'La contraseña es requerida', minLength: { value: 8, message: 'Mínimo 8 caracteres' } })}
                            type="password"
                            placeholder="••••••••"
                            className={inputClass}
                        />
                        {errors.password && <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.password.message}</p>}
                    </div>
                )}

                <div>
                    <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">Rol</label>
                    <select {...register('role')} className={`${inputClass} appearance-none cursor-pointer`}>
                        <option value="USER_ROLE">USER_ROLE</option>
                        <option value="ADMIN_ROLE">ADMIN_ROLE</option>
                    </select>
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
                        {isSubmitting ? (isEditing ? 'Guardando...' : 'Creando...') : (isEditing ? 'Guardar Cambios' : 'Crear Usuario')}
                    </button>
                </div>
            </form>
        </Modal>
    )
}

export default UserForm