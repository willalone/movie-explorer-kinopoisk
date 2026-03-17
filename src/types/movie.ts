export interface MovieShort {
  id: number
  name: string
  year?: number
  rating?: number
  genres?: { name: string }[]
  poster?: {
    url?: string
    previewUrl?: string
  }
  movieLength?: number
}

export interface MovieDetails extends MovieShort {
  description?: string
  alternativeName?: string
  slogan?: string
  premiere?: {
    world?: string
  }
}

