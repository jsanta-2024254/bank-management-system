import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { Landmark, CreditCard, DollarSign, AlignLeft, PlusCircle } from 'lucide-react'
import Modal from '../../../shared/components/ui/Modal'
import useDepositStore from '../store/depositStore'

const DepositForm = ({ onClose }) => {
    const { createDeposit } = useDepositStore()
    
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            tipoCuenta: 'monetaria',
            monto: 0,
            descripcion: '',
        },
    })

    const onSubmit = async (data) => {
        const toastId = toast.loading('Procesando depósito...')
        try {
            await createDeposit({
                ...data,
                monto: parseFloat(data.monto)
            })
            toast.success('Depósito realizado con éxito', { id: toastId })
            onClose()
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Error al realizar el depósito', { id: toastId })
        }
    }

    const inputClass = "w-full bg-zinc-800/50 border border-zinc-700/50 text-white rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-zinc-600 text-sm"

    return (
        <Modal title="Nuevo Depósito Administrativo" onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block ml-1">Tipo de Cuenta</label>
                        <select 
                            {...register('tipoCuenta', { required: 'Requerido' })} 
                            className={`${inputClass} appearance-none`}
                        >
                            <option value="monetaria">Monetaria</option>
                            <option value="ahorro">Ahorro</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block ml-1">Monto (GTQ)</label>
                        <div className="relative">
                            <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input
                                {...register('monto', { 
                                    required: 'El monto es requerido', 
                                    min: { value: 0.01, message: 'Mínimo Q0.01' }
                                })}
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className={`${inputClass} pl-10`}
                            />
                        </div>
                        {errors.monto && <p className="text-red-400 text-[10px] mt-1 ml-1">{errors.monto.message}</p>}
                    </div>
                </div>

                <div className="bg-white/5 h-px w-full my-2" />

                <div>
                    <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block ml-1">Número de Cuenta Destino</label>
                    <div className="relative">
                        <CreditCard size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                            {...register('numeroCuenta', { required: 'El número de cuenta es requerido' })}
                            placeholder="Ingrese el número de cuenta"
                            className={`${inputClass} pl-10 font-mono`}
                        />
                    </div>
                    {errors.numeroCuenta && <p className="text-red-400 text-[10px] mt-1 ml-1">{errors.numeroCuenta.message}</p>}
                </div>

                <div>
                    <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block ml-1">Descripción (Opcional)</label>
                    <div className="relative">
                        <AlignLeft size={14} className="absolute left-4 top-4 text-zinc-500" />
                        <textarea
                            {...register('descripcion')}
                            placeholder="Motivo del depósito..."
                            rows={3}
                            className={`${inputClass} pl-10 resize-none`}
                        />
                    </div>
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
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl text-sm transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? 'Procesando...' : (
                            <>
                                <PlusCircle size={18} />
                                Realizar Depósito
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    )
}

export default DepositForm
