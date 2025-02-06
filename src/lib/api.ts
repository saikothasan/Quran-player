import type { Surah, Recitation, Language, Translation, Verse } from "@/types/quran"

const API_BASE_URL = "https://api.quran.com/api/v4"

interface ApiResponse<T> {
  chapters?: T
  recitations?: T
  languages?: T
  translations?: T
  verses?: T
}

export async function fetchSurahs(language = "en"): Promise<Surah[]> {
  const response = await fetch(`${API_BASE_URL}/chapters?language=${language}`)
  if (!response.ok) {
    throw new Error("Failed to fetch surahs")
  }
  const data: ApiResponse<Surah[]> = await response.json()
  if (!data.chapters) {
    throw new Error("Invalid API response format for surahs")
  }
  return data.chapters
}

export async function fetchRecitations(): Promise<Recitation[]> {
  const response = await fetch(`${API_BASE_URL}/resources/recitations`)
  if (!response.ok) {
    throw new Error("Failed to fetch recitations")
  }
  const data: ApiResponse<Recitation[]> = await response.json()
  if (!data.recitations) {
    throw new Error("Invalid API response format for recitations")
  }
  return data.recitations
}

export async function fetchAudioUrl(recitationId: number, chapterId: number): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/chapter_recitations/${recitationId}/${chapterId}`)
  if (!response.ok) {
    throw new Error("Failed to fetch audio URL")
  }
  const data: { audio_file: { audio_url: string } } = await response.json()
  return data.audio_file.audio_url
}

export async function fetchLanguages(): Promise<Language[]> {
  const response = await fetch(`${API_BASE_URL}/resources/languages`)
  if (!response.ok) {
    throw new Error("Failed to fetch languages")
  }
  const data: ApiResponse<Language[]> = await response.json()
  if (!data.languages) {
    throw new Error("Invalid API response format for languages")
  }
  return data.languages
}

export async function fetchTranslations(language = "en"): Promise<Translation[]> {
  const response = await fetch(`${API_BASE_URL}/resources/translations?language=${language}`)
  if (!response.ok) {
    throw new Error("Failed to fetch translations")
  }
  const data: ApiResponse<Translation[]> = await response.json()
  if (!data.translations) {
    throw new Error("Invalid API response format for translations")
  }
  return data.translations
}

export async function fetchVerses(chapterId: number, translationId: number, language = "en"): Promise<Verse[]> {
  const response = await fetch(
    `${API_BASE_URL}/verses/by_chapter/${chapterId}?language=${language}&translations=${translationId}&fields=text_uthmani,audio&audio=1`,
  )
  if (!response.ok) {
    throw new Error("Failed to fetch verses")
  }
  const data: ApiResponse<Verse[]> = await response.json()
  if (!data.verses) {
    throw new Error("Invalid API response format for verses")
  }
  return data.verses
}

