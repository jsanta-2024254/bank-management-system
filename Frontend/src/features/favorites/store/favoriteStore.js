import { create } from 'zustand'
import {
    getFavorites,
    createFavorite,
    updateFavorite as updateFavoriteRequest,
    deleteFavorite as deleteFavoriteRequest,
    transferToFavorite as transferToFavoriteRequest,
} from '../../../shared/api/favorites'

const getErrorMessage = (error, fallback) => {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        fallback
    )
}

const normalizeFavorite = (favorite) => {
    if (!favorite) return favorite

    const cuenta = favorite.cuenta || {}

    return {
        ...favorite,
        numeroCuenta: favorite.numeroCuenta || favorite.numeroCuentaDestino || cuenta.numeroCuenta || '',
        tipoCuenta: favorite.tipoCuenta || cuenta.tipoCuenta || '',
    }
}

const getFavoriteList = (response) => {
    const favorites = response?.data?.data || response?.data?.favorites || response?.data || []
    return Array.isArray(favorites) ? favorites.map(normalizeFavorite) : []
}

const getFavoriteItem = (response) => {
    return normalizeFavorite(response?.data?.data || response?.data?.favorite || response?.data)
}

const useFavoriteStore = create((set) => ({
    favorites: [],
    loading: false,
    error: null,

    fetchFavorites: async () => {
        set({ loading: true, error: null })

        try {
            const response = await getFavorites()

            set({
                favorites: getFavoriteList(response),
                loading: false,
                error: null,
            })
        } catch (error) {
            set({
                error: getErrorMessage(error, 'Error al cargar los favoritos'),
                loading: false,
                favorites: [],
            })
        }
    },

    addFavorite: async (data) => {
        set({ loading: true, error: null })

        try {
            const response = await createFavorite(data)
            const favorite = getFavoriteItem(response)

            set((state) => ({
                favorites: favorite ? [favorite, ...state.favorites] : state.favorites,
                loading: false,
                error: null,
            }))

            return favorite
        } catch (error) {
            set({
                error: getErrorMessage(error, 'Error al agregar el favorito'),
                loading: false,
            })

            throw error
        }
    },

    updateFavorite: async (id, data) => {
        set({ loading: true, error: null })

        try {
            const response = await updateFavoriteRequest(id, data)
            const favorite = getFavoriteItem(response)

            set((state) => ({
                favorites: state.favorites.map((item) =>
                    item._id === id ? { ...item, ...favorite } : item
                ),
                loading: false,
                error: null,
            }))

            return favorite
        } catch (error) {
            set({
                error: getErrorMessage(error, 'Error al actualizar el favorito'),
                loading: false,
            })

            throw error
        }
    },

    deleteFavorite: async (id) => {
        set({ loading: true, error: null })

        try {
            await deleteFavoriteRequest(id)

            set((state) => ({
                favorites: state.favorites.filter((favorite) => favorite._id !== id),
                loading: false,
                error: null,
            }))
        } catch (error) {
            set({
                error: getErrorMessage(error, 'Error al eliminar el favorito'),
                loading: false,
            })

            throw error
        }
    },

    transferToFavorite: async (id, data) => {
        set({ loading: true, error: null })

        try {
            const response = await transferToFavoriteRequest(id, data)

            set({
                loading: false,
                error: null,
            })

            return response?.data?.data || response?.data
        } catch (error) {
            set({
                error: getErrorMessage(error, 'Error al transferir al favorito'),
                loading: false,
            })

            throw error
        }
    },
}))

export default useFavoriteStore