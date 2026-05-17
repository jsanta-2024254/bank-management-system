import { create } from 'zustand'
import { toast } from 'react-hot-toast'
import {
    getProducts,
    createProduct as createProductRequest,
    updateProduct as updateProductRequest,
    quoteProduct as quoteProductRequest,
    acquireProduct as acquireProductRequest,
    getMyProductAcquisitions as getMyProductAcquisitionsRequest,
    payCreditInstallment as payCreditInstallmentRequest,
    deleteProduct as deleteProductRequest,
} from '../../../shared/api/products'

const getErrorMessage = (error, fallback) => {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        fallback
    )
}

const getProductList = (response) => {
    return response?.data?.data || response?.data?.products || response?.data || []
}

const getProductItem = (response) => {
    return response?.data?.product || response?.data?.data || response?.data
}

const useProductStore = create((set) => ({
    products: [],
    loading: false,
    error: null,
    acquisitions: [],
    lastQuote: null,

    fetchProducts: async () => {
        set({ loading: true, error: null })

        try {
            const response = await getProducts()

            set({
                products: getProductList(response),
                loading: false,
                error: null,
            })
        } catch (error) {
            const message = getErrorMessage(error, 'Error al cargar los productos')

            set({
                error: message,
                loading: false,
                products: [],
            })

            toast.error(message)
        }
    },

    createProduct: async (data) => {
        set({ loading: true, error: null })

        try {
            const response = await createProductRequest(data)
            const product = getProductItem(response)

            set((state) => ({
                products: product ? [...state.products, product] : state.products,
                loading: false,
                error: null,
            }))

            return product
        } catch (error) {
            const message = getErrorMessage(error, 'Error al crear el producto')

            set({
                error: message,
                loading: false,
            })

            throw error
        }
    },

    updateProduct: async (id, data) => {
        set({ loading: true, error: null })

        try {
            const response = await updateProductRequest(id, data)
            const product = getProductItem(response)

            set((state) => ({
                products: state.products.map((p) =>
                    p.Id === id || p.id === id || p._id === id ? product : p
                ),
                loading: false,
                error: null,
            }))

            return product
        } catch (error) {
            const message = getErrorMessage(error, 'Error al actualizar el producto')

            set({
                error: message,
                loading: false,
            })

            throw error
        }
    },
    
    quoteProduct: async (id, data) => {
    set({ loading: true, error: null })

    try {
        const response = await quoteProductRequest(id, data)

        set({
            lastQuote: response.data?.data || null,
            loading: false,
            error: null,
        })

        return response.data?.data
    } catch (error) {
        const message = getErrorMessage(error, 'Error al cotizar el producto')

        set({
            error: message,
            loading: false,
        })

        throw error
    }
},

acquireProduct: async (id, data) => {
    set({ loading: true, error: null })

    try {
        const response = await acquireProductRequest(id, data)

        set({
            loading: false,
            error: null,
        })

        return response.data
    } catch (error) {
        const message = getErrorMessage(error, 'Error al adquirir el producto')

        set({
            error: message,
            loading: false,
        })

        throw error
    }
},

fetchMyProductAcquisitions: async () => {
    set({ loading: true, error: null })

    try {
        const response = await getMyProductAcquisitionsRequest()

        set({
            acquisitions: response.data?.data || [],
            loading: false,
            error: null,
        })
    } catch (error) {
        const message = getErrorMessage(error, 'Error al cargar tus productos adquiridos')

        set({
            error: message,
            loading: false,
            acquisitions: [],
        })

        toast.error(message)
    }
},

payCreditInstallment: async (acquisitionId, paymentId, data) => {
    set({ loading: true, error: null })

    try {
        const response = await payCreditInstallmentRequest(acquisitionId, paymentId, data)

        set({
            loading: false,
            error: null,
        })

        return response.data
    } catch (error) {
        const message = getErrorMessage(error, 'Error al pagar la cuota')

        set({
            error: message,
            loading: false,
        })

        throw error
    }
},

    deleteProduct: async (id) => {
        set({ loading: true, error: null })

        try {
            await deleteProductRequest(id)

            set((state) => ({
                products: state.products.filter(
                    (p) => p.Id !== id && p.id !== id && p._id !== id
                ),
                loading: false,
                error: null,
            }))
        } catch (error) {
            const message = getErrorMessage(error, 'Error al eliminar el producto')

            set({
                error: message,
                loading: false,
            })

            throw error
        }
    },
}))

export default useProductStore