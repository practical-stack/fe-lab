import { useEffect } from 'react'

const STORAGE_PREFIX = 'scroll:'

function saveScroll(key: string, value: number) {
  try {
    sessionStorage.setItem(STORAGE_PREFIX + key, String(value))
  } catch {
    // sessionStorage full or unavailable
  }
}

function loadScroll(key: string): number | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + key)
    return raw != null ? Number(raw) : null
  } catch {
    return null
  }
}

/**
 * 스크롤 컨테이너의 scrollTop을 sessionStorage에 저장/복원합니다.
 * - 스크롤할 때마다 위치를 저장
 * - 마운트 시 scrollHeight가 충분해지면 복원
 */
export function useScrollRestoration(
  scrollRef: React.RefObject<HTMLElement | null>,
  key: string,
) {
  // 스크롤 이벤트로 위치를 실시간 저장
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const onScroll = () => {
      saveScroll(key, el.scrollTop)
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [scrollRef, key])

  // 마운트 시 저장된 위치로 복원
  useEffect(() => {
    const saved = loadScroll(key)
    if (saved == null || saved === 0) return

    const el = scrollRef.current
    if (!el) return

    // 이미 scrollHeight가 충분하면 즉시 복원
    if (el.scrollHeight >= saved + el.clientHeight) {
      el.scrollTop = saved
      return
    }

    // virtualizer가 높이를 잡을 때까지 ResizeObserver로 대기
    const observer = new ResizeObserver(() => {
      if (el.scrollHeight >= saved + el.clientHeight) {
        el.scrollTop = saved
        observer.disconnect()
      }
    })

    const child = el.firstElementChild
    if (child) {
      observer.observe(child)
    }

    const timeout = setTimeout(() => observer.disconnect(), 2000)

    return () => {
      observer.disconnect()
      clearTimeout(timeout)
    }
  }, [key, scrollRef])
}
