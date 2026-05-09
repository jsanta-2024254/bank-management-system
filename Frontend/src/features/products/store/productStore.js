import { create } from 'zustand'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../../shared/api/products'

const useProductStore = create((set) => ({
    products: [],
    loading: false,
    error: null,

    fetchProducts: async () => {
        set({ loading: true, error: null })
        try {
            const response = await getProducts()
            set({ products: response.data.data || [], loading: false })
        } catch (error) {
            set({ error: error.message, loading: false })
        }
    },

    createProduct: async (data) => {
        const response = await createProduct(data)
        set((state) => ({ products: [...state.products, response.data.data] }))
    },

    updateProduct: async (id, data) => {
        const response = await updateProduct(id, data)
        set((state) => ({
            products: state.products.map((p) => (p.Id === id || p.id === id || p._id === id ? response.data.data : p)),
        }))
    },

    deleteProduct: async (id) => {
        await deleteProduct(id)
        set((state) => ({ products: state.products.filter((p) => p.Id !== id && p.id !== id && p._id !== id) }))
    },
}))

export default useProductStore