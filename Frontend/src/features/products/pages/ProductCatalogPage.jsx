import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Search } from 'lucide-react'
import useProductStore from '../store/productStore'
import ProductCard from '../components/ProductCard'
import ProductDetailModal from '../components/ProductDetailModal'

const ProductCatalogPage = () => {
    const { products, loading, fetchProducts } = useProductStore()
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchProducts()
    }, [fetchProducts])

    const filteredProducts = products.filter(p => 
        (p.nombre || p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.tipo || p.type || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="pb-10">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                            <Package size={20} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-white">Catálogo de Productos</h1>
                    </div>
                    <p className="text-zinc-500 text-sm">Descubre las mejores opciones financieras para alcanzar tus metas.</p>
                </div>

                <div className="relative group max-w-md w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o tipo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-zinc-900 border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                    />
                </div>
            </motion.div>

            {/* Catalog Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-[380px] bg-zinc-900/40 rounded-3xl animate-pulse border border-white/5" />
                    ))}
                </div>
            ) : filteredProducts.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-20 text-center bg-zinc-900/30 rounded-3xl border border-dashed border-white/10"
                >
                    <Package size={48} className="mx-auto text-zinc-700 mb-4" />
                    <p className="text-zinc-500 font-medium">No se encontraron productos que coincidan con tu búsqueda.</p>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                        <ProductCard 
                            key={product._id || product.id} 
                            product={product} 
                            onViewDetail={setSelectedProduct}
                        />
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedProduct && (
                    <ProductDetailModal 
                        product={selectedProduct} 
                        onClose={() => setSelectedProduct(null)} 
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

export default ProductCatalogPage
