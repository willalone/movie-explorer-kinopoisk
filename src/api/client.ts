import axios from 'axios'

const apiKey = import.meta.env.VITE_KINOPOISK_API_KEY

export const apiClient = axios.create({
  baseURL: 'https://api.poiskkino.dev',
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': apiKey,
  },
  paramsSerializer: {
    serialize: (params) => {
      const search = new URLSearchParams()

      Object.entries(params ?? {}).forEach(([key, value]) => {
        if (value === undefined || value === null) return
        if (Array.isArray(value)) {
          value.forEach((v) => {
            if (v === undefined || v === null) return
            search.append(key, String(v))
          })
          return
        }
        search.append(key, String(value))
      })

      return search.toString()
    },
  },
})


