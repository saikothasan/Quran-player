"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, SkipBack, SkipForward, Volume2, Search } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { fetchSurahs, fetchRecitations, fetchAudioUrl, fetchLanguages, fetchTranslations, fetchVerses } from "@/lib/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Surah, Recitation, Language, Translation, Verse } from "@/types/quran"

export default function QuranPlayer() {
  const [surahs, setSurahs] = useState<Surah[]>([])
  const [recitations, setRecitations] = useState<Recitation[]>([])
  const [languages, setLanguages] = useState<Language[]>([])
  const [translations, setTranslations] = useState<Translation[]>([])
  const [currentSurah, setCurrentSurah] = useState<Surah | null>(null)
  const [currentRecitation, setCurrentRecitation] = useState<Recitation | null>(null)
  const [currentLanguage, setCurrentLanguage] = useState<Language>({ iso_code: "en", native_name: "English" })
  const [currentTranslation, setCurrentTranslation] = useState<Translation | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const [verses, setVerses] = useState<Verse[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredSurahs, setFilteredSurahs] = useState<Surah[]>([])
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [surahsData, recitationsData, languagesData, translationsData] = await Promise.all([
          fetchSurahs(),
          fetchRecitations(),
          fetchLanguages(),
          fetchTranslations(),
        ])
        setSurahs(surahsData)
        setFilteredSurahs(surahsData)
        setRecitations(recitationsData)
        setLanguages(languagesData)
        setTranslations(translationsData)
        setCurrentSurah(surahsData[0])
        setCurrentRecitation(recitationsData[0])
        setCurrentTranslation(translationsData[0])
      } catch (error) {
        console.error("Error loading initial data:", error)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    if (currentSurah && currentRecitation) {
      loadAudio()
    }
  }, [currentSurah, currentRecitation])

  useEffect(() => {
    async function updateSurahs() {
      try {
        const [surahsData, translationsData] = await Promise.all([
          fetchSurahs(currentLanguage.iso_code),
          fetchTranslations(currentLanguage.iso_code),
        ])
        setSurahs(surahsData)
        setFilteredSurahs(surahsData)
        setTranslations(translationsData)
        setCurrentSurah(surahsData[0])
        setCurrentTranslation(translationsData[0])
      } catch (error) {
        console.error("Error updating surahs and translations:", error)
      }
    }
    updateSurahs()
  }, [currentLanguage])

  useEffect(() => {
    if (currentSurah && currentTranslation) {
      loadVerses()
    }
  }, [currentSurah, currentTranslation])

  async function loadAudio() {
    try {
      if (currentRecitation && currentSurah && audioRef.current) {
        const audioUrl = await fetchAudioUrl(currentRecitation.id, currentSurah.id)
        audioRef.current.src = audioUrl
        await audioRef.current.load()
      }
    } catch (error) {
      console.error("Error loading audio:", error)
    }
  }

  async function loadVerses() {
    try {
      const versesData = await fetchVerses(currentSurah.id, currentTranslation.id, currentLanguage.iso_code)
      setVerses(versesData)
    } catch (error) {
      console.error("Error loading verses:", error)
    }
  }

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play().catch((error) => console.error("Error playing audio:", error))
      }
      setIsPlaying(!isPlaying)
    }
  }

  const playPrevious = () => {
    const currentIndex = surahs.findIndex((surah) => surah.id === currentSurah.id)
    const previousIndex = (currentIndex - 1 + surahs.length) % surahs.length
    setCurrentSurah(surahs[previousIndex])
  }

  const playNext = () => {
    const currentIndex = surahs.findIndex((surah) => surah.id === currentSurah.id)
    const nextIndex = (currentIndex + 1) % surahs.length
    setCurrentSurah(surahs[nextIndex])
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
      setDuration(audioRef.current.duration)
    }
  }

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume[0])
    if (audioRef.current) {
      audioRef.current.volume = newVolume[0]
    }
  }

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handleSearch = (event) => {
    const searchTerm = event.target.value.toLowerCase()
    setSearchTerm(searchTerm)
    const filtered = surahs.filter(
      (surah) =>
        surah.name_simple.toLowerCase().includes(searchTerm) ||
        surah.name_arabic.toLowerCase().includes(searchTerm) ||
        surah.translated_name.name.toLowerCase().includes(searchTerm),
    )
    setFilteredSurahs(filtered)
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-2xl font-semibold text-emerald-800 dark:text-emerald-200">Surah List</h2>
          <div className="mb-4 space-y-2">
            <Select
              value={currentLanguage.iso_code}
              onValueChange={(value) => setCurrentLanguage(languages.find((lang) => lang.iso_code === value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((language) => (
                  <SelectItem key={language.iso_code} value={language.iso_code}>
                    {language.native_name} ({language.iso_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Search surahs..."
                value={searchTerm}
                onChange={handleSearch}
                className="flex-grow"
              />
              <Button size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <ul className="max-h-96 space-y-2 overflow-y-auto scrollbar-hide">
            {filteredSurahs.map((surah) => (
              <li key={surah.id}>
                <button
                  onClick={() => setCurrentSurah(surah)}
                  className={`w-full rounded-md px-4 py-2 text-left transition-colors ${
                    currentSurah && currentSurah.id === surah.id
                      ? "bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200"
                      : "hover:bg-emerald-100 dark:hover:bg-emerald-900"
                  }`}
                >
                  {surah.name_simple} - {surah.name_arabic}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col justify-center">
          <div className="mb-4 text-center">
            <h3 className="text-xl font-semibold text-emerald-800 dark:text-emerald-200">
              {currentSurah ? `${currentSurah.name_simple} - ${currentSurah.name_arabic}` : "Select a Surah"}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {currentRecitation ? `Reciter: ${currentRecitation.reciter_name}` : "Select a Reciter"}
            </p>
          </div>
          <div className="mb-4 space-y-2">
            <Select
              value={currentRecitation ? currentRecitation.id.toString() : ""}
              onValueChange={(value) => setCurrentRecitation(recitations.find((r) => r.id === Number.parseInt(value)))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Reciter" />
              </SelectTrigger>
              <SelectContent>
                {recitations.map((recitation) => (
                  <SelectItem key={recitation.id} value={recitation.id.toString()}>
                    {recitation.reciter_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={currentTranslation ? currentTranslation.id.toString() : ""}
              onValueChange={(value) =>
                setCurrentTranslation(translations.find((t) => t.id === Number.parseInt(value)))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Translation" />
              </SelectTrigger>
              <SelectContent>
                {translations.map((translation) => (
                  <SelectItem key={translation.id} value={translation.id.toString()}>
                    {translation.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={playPrevious}
              className="rounded-full bg-emerald-200 p-3 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200"
            >
              <SkipBack className="h-6 w-6" />
            </button>
            <button onClick={togglePlay} className="rounded-full bg-emerald-500 p-4 text-white">
              {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
            </button>
            <button
              onClick={playNext}
              className="rounded-full bg-emerald-200 p-3 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200"
            >
              <SkipForward className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <Slider
          value={[currentTime]}
          max={duration}
          step={1}
          onValueChange={(value) => {
            if (audioRef.current) {
              audioRef.current.currentTime = value[0]
            }
            setCurrentTime(value[0])
          }}
          className="w-full"
        />
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">{formatTime(currentTime)}</span>
          <div className="flex items-center space-x-2">
            <Volume2 className="h-5 w-5 text-emerald-800 dark:text-emerald-200" />
            <Slider value={[volume]} max={1} step={0.01} onValueChange={handleVolumeChange} className="w-24" />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">{formatTime(duration)}</span>
        </div>
      </div>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={playNext}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration)
          }
        }}
      />
      <div className="mt-8">
        <h4 className="mb-4 text-lg font-semibold text-emerald-800 dark:text-emerald-200">Verses</h4>
        <div className="max-h-96 space-y-4 overflow-y-auto scrollbar-hide">
          {verses.map((verse) => (
            <div key={verse.id} className="rounded-lg bg-emerald-50 p-4 dark:bg-emerald-900 dark:text-emerald-100">
              <p className="text-sm font-semibold">{verse.text_uthmani}</p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{verse.translations[0].text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

