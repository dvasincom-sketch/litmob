'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { PlayIcon } from './Icons'

/**
 * Сквозной плеер: один <audio> на весь сайт, мини-плеер внизу экрана
 * не пропадает при переходах. Место прослушивания запоминаем в браузере
 * (и, если читатель вошёл, на полке — через onProgress).
 */
export type Track = { src: string; title: string; subtitle?: string; href?: string; key: string; onProgressUrl?: string }

type Ctx = {
  track: Track | null
  playing: boolean
  time: number
  duration: number
  play: (t: Track) => void
  toggle: () => void
  seek: (sec: number) => void
}

const PlayerCtx = createContext<Ctx | null>(null)
export const usePlayer = () => useContext(PlayerCtx)

const posKey = (k: string) => `lm_pos_${k}`
const readPos = (k: string) => {
  try {
    return Number(localStorage.getItem(posKey(k)) || 0)
  } catch {
    return 0
  }
}
const writePos = (k: string, v: number) => {
  try {
    localStorage.setItem(posKey(k), String(Math.floor(v)))
  } catch {
    /* приватный режим — ничего страшного */
  }
}

export const fmtTime = (s: number) => {
  if (!Number.isFinite(s) || s < 0) return '0:00'
  const m = Math.floor(s / 60)
  const ss = Math.floor(s % 60)
  return `${m}:${String(ss).padStart(2, '0')}`
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audio = useRef<HTMLAudioElement | null>(null)
  const [track, setTrack] = useState<Track | null>(null)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const lastSync = useRef(0)

  useEffect(() => {
    const a = new Audio()
    a.preload = 'metadata'
    audio.current = a
    const onTime = () => {
      setTime(a.currentTime)
      const k = a.dataset.key
      if (k) writePos(k, a.currentTime)
      const url = a.dataset.progress
      if (url && Date.now() - lastSync.current > 15000) {
        lastSync.current = Date.now()
        fetch(url, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ positionSec: Math.floor(a.currentTime), status: 'listening' }) }).catch(() => null)
      }
    }
    const onMeta = () => setDuration(a.duration || 0)
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    a.addEventListener('timeupdate', onTime)
    a.addEventListener('loadedmetadata', onMeta)
    a.addEventListener('play', onPlay)
    a.addEventListener('pause', onPause)
    a.addEventListener('ended', onPause)
    return () => {
      a.pause()
      a.removeEventListener('timeupdate', onTime)
    }
  }, [])

  const play = useCallback((t: Track) => {
    const a = audio.current
    if (!a) return
    if (a.dataset.key === t.key) {
      if (a.paused) void a.play()
      else a.pause()
      return
    }
    a.src = t.src
    a.dataset.key = t.key
    a.dataset.progress = t.onProgressUrl || ''
    const start = readPos(t.key)
    a.currentTime = start
    setTime(start)
    setTrack(t)
    void a.play()
  }, [])

  const toggle = useCallback(() => {
    const a = audio.current
    if (!a || !a.src) return
    if (a.paused) void a.play()
    else a.pause()
  }, [])

  const seek = useCallback((sec: number) => {
    const a = audio.current
    if (!a) return
    a.currentTime = Math.max(0, Math.min(sec, a.duration || sec))
  }, [])

  return (
    <PlayerCtx.Provider value={{ track, playing, time, duration, play, toggle, seek }}>
      {children}
      <MiniPlayer />
    </PlayerCtx.Provider>
  )
}

function MiniPlayer() {
  const p = usePlayer()
  const path = usePathname() || '/'
  if (!p?.track) return null
  // На телефоне мини-плеер стоит над нижним меню, а на странице книги — над её кнопкой «Слушать».
  const bottom = path.startsWith('/kniga/') ? 'bottom-[74px]' : 'bottom-[54px]'
  const pct = p.duration ? (p.time / p.duration) * 100 : 0
  return (
    <div className={`fixed inset-x-0 ${bottom} z-40 border-t border-line bg-white shadow-[0_-6px_20px_rgba(58,20,36,0.08)] md:bottom-0`}>
      <div className="h-[3px] bg-track">
        <div className="h-[3px] bg-rose" style={{ width: `${pct}%` }} />
      </div>
      <div className="mx-auto flex max-w-[1240px] items-center gap-3 px-4 py-2 md:px-6">
        <Link href={p.track.href || '#'} className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[13px] font-semibold">{p.track.title}</span>
          <span className="truncate text-xs text-muted">
            {p.track.subtitle ? `${p.track.subtitle} · ` : ''}
            {fmtTime(p.time)} / {fmtTime(p.duration)}
          </span>
        </Link>
        <button type="button" onClick={() => p.seek(p.time - 15)} className="hidden h-11 rounded-full px-3 text-xs font-semibold text-muted md:block" aria-label="Назад на 15 секунд">
          −15 с
        </button>
        <button type="button" onClick={p.toggle} aria-label={p.playing ? 'Пауза' : 'Слушать'} className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-rose">
          {p.playing ? <PauseIcon /> : <PlayIcon size={16} color="#FFFFFF" />}
        </button>
      </div>
    </div>
  )
}

const PauseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFFFFF" aria-hidden="true">
    <path d="M7 5h3v14H7zM14 5h3v14h-3z" />
  </svg>
)

/** Круглая кнопка «слушать» для карточек и чтецов. */
export function PlayButton({ track, size = 48, light = false, label }: { track: Track; size?: number; light?: boolean; label?: string }) {
  const p = usePlayer()
  const active = p?.track?.key === track.key && p.playing
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        p?.play(track)
      }}
      aria-label={label || (active ? 'Пауза' : 'Слушать')}
      className={`flex flex-none items-center justify-center rounded-full ${light ? 'border border-rose bg-white' : 'bg-rose'}`}
      style={{ width: size, height: size }}
    >
      {active ? (
        light ? <span className="text-xs font-bold text-rose">II</span> : <PauseIcon />
      ) : (
        <PlayIcon size={Math.round(size / 2.8)} color={light ? '#9C2B4E' : '#FFFFFF'} />
      )}
    </button>
  )
}

/** Плеер первой главы на странице книги: кнопка, прогресс и время. */
export function ChapterPlayer({ track, dark = false }: { track: Track; dark?: boolean }) {
  const p = usePlayer()
  const mine = p?.track?.key === track.key
  const time = mine ? p!.time : 0
  const dur = mine ? p!.duration : 0
  const pct = dur ? (time / dur) * 100 : 0
  return (
    <div className="flex items-center gap-3">
      <PlayButton track={track} size={56} />
      <div className="flex flex-1 flex-col gap-1.5">
        <button
          type="button"
          aria-label="Перемотка"
          className={`h-1.5 rounded ${dark ? 'bg-wine-2' : 'bg-track'}`}
          onClick={(e) => {
            if (!mine || !dur) return
            const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
            p!.seek(((e.clientX - r.left) / r.width) * dur)
          }}
        >
          <span className="block h-1.5 rounded bg-rose" style={{ width: `${pct}%` }} />
        </button>
        <span className={`flex justify-between text-xs ${dark ? 'text-blush' : 'text-muted'}`}>
          <span>{fmtTime(time)}</span>
          <span>{dur ? fmtTime(dur) : ''}</span>
        </span>
      </div>
    </div>
  )
}
