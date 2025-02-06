const API_BASE_URL = "https://api.quran.com/api/v4"

export async function fetchSurahs(language = "en") {
  const response = await fetch(`${API_BASE_URL}/chapters?language=${language}`)
  if (!response.ok) {
    throw new Error("Failed to fetch surahs")
  }
  const data = await response.json()
  return data.chapters
}

export async function fetchRecitations() {
  const response = await fetch(`${API_BASE_URL}/resources/recitations`)
  if (!response.ok) {
    throw new Error("Failed to fetch recitations")
  }
  const data = await response.json()
  return data.recitations
}

export async function fetchAudioUrl(recitationId: number, chapterId: number) {
  const response = await fetch(`${API_BASE_URL}/chapter_recitations/${recitationId}/${chapterId}`)
  if (!response.ok) {
    throw new Error("Failed to fetch audio URL")
  }
  const data = await response.json()
  return data.audio_file.audio_url
}

export async function fetchLanguages() {
  const response = await fetch(`${API_BASE_URL}/resources/languages`)
  if (!response.ok) {
    throw new Error("Failed to fetch languages")
  }
  const data = await response.json()
  return data.languages
}

