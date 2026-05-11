import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Trash2, Plus, Search, Hash, CreditCard } from 'lucide-react'
import { toast } from 'react-hot-toast'
import useFavoriteStore from '../store/favoriteStore'
import FavoriteForm from './FavoriteForm'
import ConfirmDialog from '../../../shared/components/ui/ConfirmDialog'

const getTipoCuentaLabel = (tipoCuenta) => {
    if (tipoCuenta === 'monetaria') return 'Monetaria'
    if (tipoCuenta === 'ahorro') return 'Ahorro'
    return 'Sin tipo'
}

const FavoriteList = () => {
    const { favorites, loading, error, fetchFavorites, deleteFavorite } = useFavoriteStore()
    const [showForm, setShowForm] = useState(false)
    const [confirmId, setConfirmId] = useState(null)
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchFavorites()
    }, [fetchFavorites])

    const handleDelete = async () => {
        const toastId = toast.loading('Eliminando favorito...')

        try {
            await deleteFavorite(confirmId)
            setConfirmId(null)
            toast.success('Favorito eliminado correctamente', { id: toastId })
        } catch (error) {
            toast.error(
                error?.response?.data?.message || 'Error al eliminar el favorito',
                { id: toastId }
            )
        }
    }

    const filtered = favorites.filter((favorite) => {
        const query = search.toLowerCase()
        const alias = favorite.alias || ''
        const numeroCuenta = favorite.numeroCuenta || ''
        const tipoCuenta = getTipoCuentaLabel(favorite.tipoCuenta)

        return (
            alias.toLowerCase().includes(query) ||
            numeroCuenta.toLowerCase().includes(query) ||
            tipoCuenta.toLowerCase().includes(query)
        )
    })

    const confirmTarget = favorites.find((favorite) => favorite._id === confirmId)

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pb-10">
            <AnimatePresence>
                {showForm && (
                    <FavoriteForm
                        onClose={() => {
                            setShowForm(false)
                            fetchFavorites()
                        }}
                    />
                )}
            </AnimatePresence>

            {confirmId && (
                <ConfirmDialog
                    message={
                        confirmTarget
                            ? `¿Eliminar "${confirmTarget.alias}" (${confirmTarget.numeroCuenta})?`
                            : '¿Eliminar este favorito?'
                    }
                    onConfirm={handleDelete}
                    onCancel={() => setConfirmId(null)}
                />
            )}

            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <Star size={22} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white">Cuentas Favoritas</h1>
                        <p className="text-zinc-500 text-sm mt-0.5">
                            {favorites.length} {favorites.length === 1 ? 'favorito guardado' : 'favoritos guardados'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20"
                >
                    <Plus size={16} />
                    Agregar favorito
                </button>
            </div>

            <div className="relative mb-6">
                <Search
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
                />
                <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar por alias, número o tipo de cuenta..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm"
                />
            </div>

            {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-2xl px-6 py-4 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="h-20 bg-zinc-900 rounded-3xl animate-pulse" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-24 text-center"
                >
                    <div className="w-16 h-16 rounded-3xl bg-zinc-900 flex items-center justify-center mb-4">
                        <Star size={28} className="text-zinc-700" />
                    </div>
                    <p className="text-zinc-400 font-semibold text-lg">
                        {search ? 'Sin resultados' : 'No hay favoritos aún'}
                    </p>
                    <p className="text-zinc-600 text-sm mt-1">
                        {search
                            ? 'Intenta con otro alias, número o tipo de cuenta.'
                            : 'Agrega cuentas de destino frecuentes para transferir más rápido.'}
                    </p>
                    {!search && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="mt-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl text-sm font-bold transition-all"
                        >
                            <Plus size={16} /> Agregar mi primer favorito
                        </button>
                    )}
                </motion.div>
            ) : (
                <div className="bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden">
                    <div className="grid grid-cols-[1fr_1fr_150px_auto] bg-white/3 border-b border-white/5">
                        <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest px-8 py-4">
                            Alias
                        </span>
                        <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest px-8 py-4">
                            Número de cuenta
                        </span>
                        <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest px-8 py-4">
                            Tipo
                        </span>
                        <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest px-8 py-4">
                            Acciones
                        </span>
                    </div>

                    <AnimatePresence initial={false}>
                        {filtered.map((favorite, index) => (
                            <motion.div
                                key={favorite._id}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className={`grid grid-cols-[1fr_1fr_150px_auto] items-center hover:bg-white/3 transition-colors ${
                                    index !== filtered.length - 1 ? 'border-b border-white/5' : ''
                                }`}
                            >
                                <div className="px-8 py-5 flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                                        <Star size={15} className="text-amber-400" />
                                    </div>
                                    <span className="text-white font-semibold text-sm">{favorite.alias}</span>
                                </div>

                                <div className="px-8 py-5 flex items-center gap-2 text-zinc-400">
                                    <Hash size={13} className="text-zinc-600 shrink-0" />
                                    <span className="font-mono text-sm">{favorite.numeroCuenta}</span>
                                </div>

                                <div className="px-8 py-5 flex items-center gap-2 text-zinc-400">
                                    <CreditCard size={13} className="text-zinc-600 shrink-0" />
                                    <span className="text-xs font-bold uppercase tracking-wide bg-zinc-800 text-zinc-300 rounded-xl px-3 py-1">
                                        {getTipoCuentaLabel(favorite.tipoCuenta)}
                                    </span>
                                </div>

                                <div className="px-8 py-5">
                                    <button
                                        onClick={() => setConfirmId(favorite._id)}
                                        className="flex items-center gap-1.5 text-zinc-500 hover:text-red-400 transition-colors text-xs font-bold group"
                                        title="Eliminar favorito"
                                    >
                                        <Trash2
                                            size={15}
                                            className="group-hover:scale-110 transition-transform"
                                        />
                                        Eliminar
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    )
}

export default FavoriteList