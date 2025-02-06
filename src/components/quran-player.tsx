"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { fetchSurahs, fetchRecitations, fetchAudioUrl, fetchLanguages } from "@/lib/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function QuranPlayer() {
  const [surahs, setSurahs] = useState([])
  const [recitations, setRecitations] = useState([])
  const [languages, setLanguages] = useState([])
  const [currentSurah, setCurrentSurah] = useState(null)
  const [currentRecitation, setCurrentRecitation] = useState(null)
  const [currentLanguage, setCurrentLanguage] = useState({ iso_code: "en", native_name: "English" })
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const audioRef = useRef(null)

  useEffect(() => {
    async function loadData() {
      const [surahsData, recitationsData, languagesData] = await Promise.all([
        fetchSurahs(),
        fetchRecitations(),
        fetchLanguages(),
      ])
      setSurahs(surahsData)
      setRecitations(recitationsData)
      setLanguages(languagesData)
      setCurrentSurah(surahsData[0])
      setCurrentRecitation(recitationsData[0])
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
      const surahsData = await fetchSurahs(currentLanguage.iso_code)
      setSurahs(surahsData)
      setCurrentSurah(surahsData[0])
    }
    updateSurahs()
  }, [currentLanguage])

  async function loadAudio() {
    const audioUrl = await fetchAudioUrl(currentRecitation.id, currentSurah.id)
    audioRef.current.src = audioUrl
    audioRef.current.load()
  }

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
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
    setCurrentTime(audioRef.current.currentTime)
    setDuration(audioRef.current.duration)
  }

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume[0])
    audioRef.current.volume = newVolume[0]
  }

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-2xl font-semibold text-emerald-800 dark:text-emerald-200">Surah List</h2>
          <div className="mb-4">
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
          </div>
          <ul className="max-h-96 space-y-2 overflow-y-auto scrollbar-hide">
            {surahs.map((surah) => (
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
          <div className="mb-4">
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
            audioRef.current.currentTime = value[0]
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
        onLoadedMetadata={() => setDuration(audioRef.current.duration)}
      />
    </div>
  )
}

