import type { Surah, Recitation, Language, Translation, Verse } from "@/types/quran"

const API_BASE_URL = "https://api.quran.com/api/v4"

export async function fetchSurahs(language = "en"): Promise<Surah[]> {
  const response = await fetch(`${API_BASE_URL}/chapters?language=${language}`)
  if (!response.ok) {
    throw new Error("Failed to fetch surahs")
  }
  const data = await response.json()
  return data.chapters
}

export async function fetchRecitations(): Promise<Recitation[]> {
  const response = await fetch(`${API_BASE_URL}/resources/recitations`)
  if (!response.ok) {
    throw new Error("Failed to fetch recitations")
  }
  const data = await response.json()
  return data.recitations
}

export async function fetchAudioUrl(recitationId: number, chapterId: number): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/chapter_recitations/${recitationId}/${chapterId}`)
  if (!response.ok) {
    throw new Error("Failed to fetch audio URL")
  }
  const data = await response.json()
  return data.audio_file.audio_url
}

export async function fetchLanguages(): Promise<Language[]> {
  const response = await fetch(`${API_BASE_URL}/resources/languages`)
  if (!response.ok) {
    throw new Error("Failed to fetch languages")
  }
  const data = await response.json()
  return data.languages
}

export async function fetchTranslations(language = "en"): Promise<Translation[]> {
  const response = await fetch(`${API_BASE_URL}/resources/translations?language=${language}`)
  if (!response.ok) {
    throw new Error("Failed to fetch translations")
  }
  const data = await response.json()
  return data.translations
}

export async function fetchVerses(chapterId: number, translationId: number, language = "en"): Promise<Verse[]> {
  const response = await fetch(
    `${API_BASE_URL}/verses/by_chapter/${chapterId}?language=${language}&translations=${translationId}&fields=text_uthmani,audio&audio=1`,
  )
  if (!response.ok) {
    throw new Error("Failed to fetch verses")
  }
  const data = await response.json()
  return data.verses
}
