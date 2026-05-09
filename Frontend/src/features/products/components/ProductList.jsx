import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Edit3, Trash2, Plus, Package, Search } from 'lucide-react'
import { toast } from 'react-hot-toast'
import useProductStore from '../store/productStore'
import ProductForm from './ProductForm'
import ConfirmDialog from '../../../shared/components/ui/ConfirmDialog'

const ProductList = () => {
    const { products, loading, error, fetchProducts, deleteProduct } = useProductStore()
    const [showForm, setShowForm] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [confirmId, setConfirmId] = useState(null)
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchProducts()
    }, [fetchProducts])

    const handleDelete = async () => {
        const toastId = toast.loading('Eliminando producto...')
        try {
            await deleteProduct(confirmId)
            setConfirmId(null)
            toast.success('Producto eliminado correctamente', { id: toastId })
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Error al eliminar el producto', { id: toastId })
        }
    }

    const filtered = (products || []).filter((p) => {
        const q = search.toLowerCase()
        return (
            (p.nombre || '').toLowerCase().includes(q) ||
            (p.descripcion || '').toLowerCase().includes(q)
        )
    })

    const Skeleton = ({ className }) => (
        <div className={`bg-zinc-800 animate-pulse ${className}`} />
    )

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pb-10">
            {showForm && (
                <ProductForm
                    product={editingProduct}
                    onClose={() => {
                        setShowForm(false)
                        setEditingProduct(null)
                        fetchProducts()
                    }}
                />
            )}

            {confirmId && (
                <ConfirmDialog
                    message="Esta acción eliminará el producto permanentemente del sistema."
                    onConfirm={handleDelete}
                    onCancel={() => setConfirmId(null)}
                />
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Productos</h1>
                    <p className="text-zinc-500 text-sm mt-1">Gestiona los productos del sistema.</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-95"
                >
                    <Plus size={18} />
                    Nuevo Producto
                </button>
            </div>

            <div className="mb-4 relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por nombre o descripción..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm"
                />
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-6 text-center">
                    {error}
                </div>
            )}

            <div className="bg-zinc-900/50 backdrop-blur-sm border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5">
                                <th className="text-zinc-400 text-[10px] font-black uppercase tracking-widest px-8 py-5">Nombre</th>
                                <th className="text-zinc-400 text-[10px] font-black uppercase tracking-widest px-8 py-5">Tipo</th>
                                <th className="text-zinc-400 text-[10px] font-black uppercase tracking-widest px-8 py-5">Tasa de Interés</th>
                                <th className="text-zinc-400 text-[10px] font-black uppercase tracking-widest px-8 py-5">Estado</th>
                                <th className="text-zinc-400 text-[10px] font-black uppercase tracking-widest px-8 py-5 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading && products.length === 0 ? (
                                [1, 2, 3].map((i) => (
                                    <tr key={i}>
                                        <td className="px-8 py-5"><Skeleton className="h-10 w-40 rounded-xl" /></td>
                                        <td className="px-8 py-5"><Skeleton className="h-5 w-24 rounded-lg" /></td>
                                        <td className="px-8 py-5"><Skeleton className="h-5 w-16 rounded-lg" /></td>
                                        <td className="px-8 py-5"><Skeleton className="h-6 w-16 rounded-full" /></td>
                                        <td className="px-8 py-5"><Skeleton className="h-8 w-20 rounded-lg ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-16 text-center text-zinc-500">
                                        <Package size={32} className="mx-auto mb-3 opacity-30" />
                                        <p className="font-medium">No se encontraron productos</p>
                                    </td>
                                </tr>
                            ) : (
                                <AnimatePresence>
                                    {filtered.map((product) => {
                                        const id = product.Id || product.id || product._id
                                        const nombre = product.nombre || '—'
                                        const tipo = product.tipo || '—'
                                        const tasaInteres = product.tasaInteres !== undefined ? `${product.tasaInteres}%` : '—'
                                        const estado = product.estado
                                        return (
                                            <motion.tr
                                                key={id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="hover:bg-white/3 transition-colors"
                                            >
                                                <td className="px-8 py-5 text-white font-semibold text-sm">{nombre}</td>
                                                <td className="px-8 py-5 text-zinc-400 text-sm">{tipo}</td>
                                                <td className="px-8 py-5 text-zinc-400 text-sm">{tasaInteres}</td>
                                                <td className="px-8 py-5">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${estado ? 'bg-green-500/10 text-green-400' : 'bg-zinc-700/40 text-zinc-500'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${estado ? 'bg-green-400' : 'bg-zinc-500'}`} />
                                                        {estado ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-2 justify-end">
                                                        <button
                                                            onClick={() => { setEditingProduct(product); setShowForm(true) }}
                                                            className="p-2 text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all"
                                                        >
                                                            <Edit3 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirmId(id)}
                                                            className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        )
                                    })}
                                </AnimatePresence>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    )
}

export default ProductList