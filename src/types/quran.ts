export interface Surah {
  id: number
  name_simple: string
  name_arabic: string
  translated_name: {
    name: string
  }
  verses_count: number
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
  verse_key: string
  text_uthmani: string
  translations: {
    text: string
  }[]
  audio: {
    url: string
  }
}

export interface QuranBookmark {
  surahId: number
  verseId: number
  timestamp: number
}

export interface ReadingGoal {
  versesPerDay: number
  startDate: string
  lastReadDate: string
  totalVersesRead: number
}

