const API_BASE_URL = "https://api.quran.com/api/v4"

interface ApiResponse<T> {
  data: T
}

interface Chapter {
  id: number
  name_simple: string
  name_arabic: string
  translated_name: {
    name: string
  }
}

interface Recitation {
  id: number
  reciter_name: string
}

interface Language {
  iso_code: string
  native_name: string
}

interface Translation {
  id: number
  name: string
}

interface Verse {
  id: number
  text_uthmani: string
  translations: {
    text: string
  }[]
}

export async function fetchSurahs(language = "en"): Promise<Chapter[]> {
  const response = await fetch(`${API_BASE_URL}/chapters?language=${language}`)
  if (!response.ok) {
    throw new Error("Failed to fetch surahs")
  }
  const data = (await response.json()) as ApiResponse<Chapter[]>
  return data.data
}

export async function fetchRecitations(): Promise<Recitation[]> {
  const response = await fetch(`${API_BASE_URL}/resources/recitations`)
  if (!response.ok) {
    throw new Error("Failed to fetch recitations")
  }
  const data = (await response.json()) as ApiResponse<Recitation[]>
  return data.data
}

export async function fetchAudioUrl(recitationId: number, chapterId: number): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/chapter_recitations/${recitationId}/${chapterId}`)
  if (!response.ok) {
    throw new Error("Failed to fetch audio URL")
  }
  const data = (await response.json()) as { audio_file: { audio_url: string } }
  return data.audio_file.audio_url
}

export async function fetchLanguages(): Promise<Language[]> {
  const response = await fetch(`${API_BASE_URL}/resources/languages`)
  if (!response.ok) {
    throw new Error("Failed to fetch languages")
  }
  const data = (await response.json()) as ApiResponse<Language[]>
  return data.data
}

export async function fetchTranslations(language = "en"): Promise<Translation[]> {
  const response = await fetch(`${API_BASE_URL}/resources/translations?language=${language}`)
  if (!response.ok) {
    throw new Error("Failed to fetch translations")
  }
  const data = (await response.json()) as ApiResponse<Translation[]>
  return data.data
}

export async function fetchVerses(chapterId: number, translationId: number, language = "en"): Promise<Verse[]> {
  const response = await fetch(
    `${API_BASE_URL}/verses/by_chapter/${chapterId}?language=${language}&translations=${translationId}&fields=text_uthmani`,
  )
  if (!response.ok) {
    throw new Error("Failed to fetch verses")
  }
  const data = (await response.json()) as ApiResponse<Verse[]>
  return data.data
}

