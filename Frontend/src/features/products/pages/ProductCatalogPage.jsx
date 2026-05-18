import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Search, Sparkles } from 'lucide-react'
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

    const filteredProducts = products.filter((product) => {
        const query = searchTerm.toLowerCase()

        return (
            (product.nombre || product.name || '').toLowerCase().includes(query) ||
            (product.tipo || product.type || '').toLowerCase().includes(query) ||
            (product.descripcion || product.description || '').toLowerCase().includes(query)
        )
    })

    const productosActivos = products.filter((product) => product.estado !== false).length
    const productosCredito = products.filter((product) => product.tipo === 'credito').length

    return (
        <div className="pb-10">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 overflow-hidden rounded-4xl border border-[#d7bc73]/45 bg-[#fffaf0]/62 px-6 py-6 shadow-[0_22px_60px_rgba(92,64,19,0.1)] backdrop-blur-xl md:px-8"
            >
                <div className="premium-gold-line mb-6 h-px w-full" />

                <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-[#c89b3c]/50 bg-linear-to-br from-[#fff8df] via-[#ead190] to-[#9a6b16] shadow-[0_18px_38px_rgba(154,107,22,0.24)]">
                            <Package size={28} className="text-[#5b3a0d]" />
                        </div>

                        <div>
                            <p className="mb-1 text-[10px] font-black uppercase tracking-[0.28em] text-[#9a6b16]/75">
                                Productos financieros
                            </p>

                            <h1 className="text-3xl font-black tracking-tight text-[#3f2c12] md:text-4xl">
                                Catálogo de Productos
                            </h1>

                            <p className="mt-1 text-sm font-semibold text-[#7a6849]">
                                Descubre soluciones financieras diseñadas para tus metas.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:min-w-105">
                        <div className="rounded-3xl border border-[#d7bc73]/40 bg-white/42 p-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#8a611b]/70">
                                Disponibles
                            </p>

                            <p className="mt-2 text-2xl font-black text-[#3f2c12]">
                                {productosActivos}
                            </p>
                        </div>

                        <div className="rounded-3xl border border-[#d7bc73]/40 bg-white/42 p-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#8a611b]/70">
                                Créditos
                            </p>

                            <p className="mt-2 text-2xl font-black text-[#3f2c12]">
                                {productosCredito}
                            </p>
                        </div>

                        <div className="col-span-2 rounded-3xl border border-[#d7bc73]/40 bg-white/42 p-4 sm:col-span-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#8a611b]/70">
                                Resultado
                            </p>

                            <p className="mt-2 text-2xl font-black text-[#3f2c12]">
                                {filteredProducts.length}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="mb-8 rounded-4xl border border-[#d7bc73]/45 bg-[#fffaf0]/68 p-5 shadow-[0_18px_48px_rgba(92,64,19,0.08)] backdrop-blur-xl">
                <div className="relative">
                    <Search
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a6b16]/70"
                    />

                    <input
                        type="text"
                        placeholder="Buscar por nombre, tipo o descripción..."
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        className="w-full rounded-2xl border border-[#d7bc73]/50 bg-white/58 py-4 pl-11 pr-5 text-sm font-semibold text-[#3b2a14] placeholder-[#a89365] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition-all focus:border-[#b98219]/70 focus:bg-white/80 focus:outline-none focus:ring-4 focus:ring-[#d9b45e]/18"
                    />
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-2xl border border-[#d7bc73]/35 bg-white/32 px-4 py-3 text-sm font-semibold text-[#8a6a3a]">
                    <Sparkles size={16} className="shrink-0 text-[#9a6b16]" />
                    Selecciona un producto para ver condiciones, beneficios y opciones de adquisición.
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                        <div
                            key={item}
                            className="h-107.5 animate-pulse rounded-4xl border border-[#d7bc73]/35 bg-[#ead9ad]/55"
                        />
                    ))}
                </div>
            ) : filteredProducts.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center rounded-4xl border border-dashed border-[#d7bc73]/45 bg-[#fffaf0]/68 px-6 py-24 text-center shadow-[0_22px_60px_rgba(92,64,19,0.1)] backdrop-blur-xl"
                >
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-[#d7bc73]/45 bg-[#fff8df] text-[#8a611b]">
                        <Package size={30} />
                    </div>

                    <p className="text-lg font-black text-[#3f2c12]">
                        No se encontraron productos
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#8a6a3a]">
                        Intenta buscar por otro nombre, tipo o descripción.
                    </p>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredProducts.map((product) => (
                        <ProductCard
                            key={product._id || product.id || product.Id}
                            product={product}
                            onViewDetail={setSelectedProduct}
                        />
                    ))}
                </div>
            )}

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