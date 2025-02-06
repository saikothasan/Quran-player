export interface Surah {
  id: number
  name_simple: string
  name_arabic: string
  translated_name: {
    name: string
  }
}

export interface Recitation {
  id: number
  reciter_name: string
}

export interface Language {
  iso_code: string
  native_name: string
}

export interface Translation {
  id: number
  name: string
}

export interface Verse {
  id: number
  text_uthmani: string
  translations: {
    text: string
  }[]
}

