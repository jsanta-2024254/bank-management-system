import { create } from 'zustand'
import { getFavorites, createFavorite, deleteFavorite } from '../../../shared/api/favorites'

const useFavoriteStore = create((set, get) => ({
    favorites: [],
    loading: false,
    error: null,

    fetchFavorites: async () => {
        set({ loading: true, error: null })
        try {
            const response = await getFavorites()
            set({ favorites: response.data.data || response.data || [], loading: false })
        } catch (error) {
            set({ error: error.response?.data?.message || error.message, loading: false, favorites: [] })
        }
    },

    addFavorite: async (data) => {
        set({ loading: true, error: null })
        try {
            const response = await createFavorite(data)
            const newFav = response.data.favorite || response.data
            set((state) => ({ favorites: [...state.favorites, newFav], loading: false }))
            return newFav
        } catch (error) {
            set({ error: error.response?.data?.message || error.message, loading: false })
            throw error
        }
    },

    deleteFavorite: async (id) => {
        set({ loading: true, error: null })
        try {
            await deleteFavorite(id)
            set((state) => ({
                favorites: state.favorites.filter((f) => f._id !== id),
                loading: false,
            }))
        } catch (error) {
            set({ error: error.response?.data?.message || error.message, loading: false })
            throw error
        }
    },
}))

export default useFavoriteStore