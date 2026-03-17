import { useState, useCallback, useRef } from 'react'
import type { AnnotationBox, ApiData } from './types'
import Toolbar from './components/Toolbar'
import CanvasArea from './components/CanvasArea'
import InfoPanel from './components/InfoPanel'
import ApiConfig from './components/ApiConfig'
import Toast from './components/Toast'
import './App.css'

let boxIdCounter = 0

function getBoxSize() {
  if (window.innerWidth <= 480) return { width: 180, height: 75 }
  return { width: 220, height: 90 }
}

export default function App() {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [boxes, setBoxes] = useState<AnnotationBox[]>([])
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null)
  const [apiUrl, setApiUrl] = useState('https://xivapi.com/search?string=')
  const [toast, setToast] = useState<string | null>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }, [])

  const handleImageUpload = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string)
      setBoxes([])
      setSelectedBoxId(null)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleAddBox = useCallback(() => {
    const size = getBoxSize()
    const newBox: AnnotationBox = {
      id: `box-${++boxIdCounter}`,
      x: 50,
      y: 50,
      width: size.width,
      height: size.height,
      label: `주석 ${boxIdCounter}`,
      apiData: null,
      loading: false,
    }
    setBoxes(prev => [...prev, newBox])
    setSelectedBoxId(newBox.id)
  }, [])

  const handleDeleteBox = useCallback((id: string) => {
    setBoxes(prev => prev.filter(b => b.id !== id))
    setSelectedBoxId(prev => prev === id ? null : prev)
  }, [])

  const handleDeleteSelected = useCallback(() => {
    if (!selectedBoxId) return
    handleDeleteBox(selectedBoxId)
  }, [selectedBoxId, handleDeleteBox])

  const handleBoxMove = useCallback((id: string, x: number, y: number) => {
    setBoxes(prev => prev.map(b => b.id === id ? { ...b, x, y } : b))
  }, [])

  const handleSelectBox = useCallback((id: string | null) => {
    setSelectedBoxId(id)
  }, [])

  const handleFetchApi = useCallback(async (id: string, query: string) => {
    setBoxes(prev => prev.map(b => b.id === id ? { ...b, loading: true } : b))
    try {
      const url = new URL(apiUrl)
      // Append the query parameter safely
      url.searchParams.set('string', query)
      const res = await fetch(url.toString())
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: unknown = await res.json()
      const results = (data as { Results?: Array<{ Name?: string; Icon?: string; UrlType?: string }> }).Results
      const first = results?.[0]
      const apiData: ApiData = first
        ? {
            title: first.Name ?? '결과 없음',
            description: first.UrlType ?? '',
            icon: first.Icon ? `https://xivapi.com${first.Icon}` : undefined,
          }
        : { title: '결과 없음', description: '검색 결과가 없습니다' }

      setBoxes(prev => prev.map(b => b.id === id ? { ...b, apiData, loading: false } : b))
    } catch {
      setBoxes(prev =>
        prev.map(b =>
          b.id === id
            ? { ...b, apiData: { title: 'API 오류', description: '데이터를 가져올 수 없습니다' }, loading: false }
            : b,
        ),
      )
      showToast('API 호출에 실패했습니다')
    }
  }, [apiUrl, showToast])

  const handleDownload = useCallback(async () => {
    const img = imageRef.current
    const wrapper = wrapperRef.current
    if (!img || !wrapper) return

    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Draw original image at full resolution
    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight)

    // Scale factor from displayed to natural
    const scaleX = img.naturalWidth / img.clientWidth
    const scaleY = img.naturalHeight / img.clientHeight

    // Draw each box
    for (const box of boxes) {
      const bx = box.x * scaleX
      const by = box.y * scaleY
      const bw = box.width * scaleX
      const bh = box.height * scaleY
      const radius = 10 * scaleX

      // Box background
      ctx.fillStyle = 'rgba(30, 30, 50, 0.88)'
      ctx.beginPath()
      ctx.moveTo(bx + radius, by)
      ctx.lineTo(bx + bw - radius, by)
      ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + radius)
      ctx.lineTo(bx + bw, by + bh - radius)
      ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - radius, by + bh)
      ctx.lineTo(bx + radius, by + bh)
      ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - radius)
      ctx.lineTo(bx, by + radius)
      ctx.quadraticCurveTo(bx, by, bx + radius, by)
      ctx.closePath()
      ctx.fill()

      // Box border
      ctx.strokeStyle = 'rgba(102, 126, 234, 0.6)'
      ctx.lineWidth = 2 * scaleX
      ctx.stroke()

      // Label
      ctx.fillStyle = '#667eea'
      ctx.font = `bold ${11 * scaleX}px 'Segoe UI', sans-serif`
      ctx.fillText(box.label, bx + 8 * scaleX, by + 16 * scaleY)

      // API data
      if (box.apiData) {
        ctx.fillStyle = '#f0f0f0'
        ctx.font = `bold ${13 * scaleX}px 'Segoe UI', sans-serif`
        ctx.fillText(box.apiData.title, bx + 8 * scaleX, by + 36 * scaleY)

        ctx.fillStyle = '#999999'
        ctx.font = `${11 * scaleX}px 'Segoe UI', sans-serif`
        ctx.fillText(box.apiData.description, bx + 8 * scaleX, by + 54 * scaleY)
      }
    }

    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'annotated-image.png'
      a.click()
      URL.revokeObjectURL(url)
    })
    showToast('이미지가 저장되었습니다')
  }, [boxes, showToast])

  const handleShare = useCallback(async () => {
    if (!navigator.share) {
      showToast('이 브라우저에서는 공유 기능을 지원하지 않습니다')
      return
    }
    const img = imageRef.current
    if (!img) return

    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight)

    const scaleX = img.naturalWidth / img.clientWidth
    const scaleY = img.naturalHeight / img.clientHeight

    for (const box of boxes) {
      const bx = box.x * scaleX
      const by = box.y * scaleY
      const bw = box.width * scaleX
      const bh = box.height * scaleY
      const radius = 10 * scaleX
      ctx.fillStyle = 'rgba(30, 30, 50, 0.88)'
      ctx.beginPath()
      ctx.moveTo(bx + radius, by)
      ctx.lineTo(bx + bw - radius, by)
      ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + radius)
      ctx.lineTo(bx + bw, by + bh - radius)
      ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - radius, by + bh)
      ctx.lineTo(bx + radius, by + bh)
      ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - radius)
      ctx.lineTo(bx, by + radius)
      ctx.quadraticCurveTo(bx, by, bx + radius, by)
      ctx.closePath()
      ctx.fill()
    }

    canvas.toBlob(async (blob) => {
      if (!blob) return
      const file = new File([blob], 'annotated-image.png', { type: 'image/png' })
      try {
        await navigator.share({ title: '주석 이미지', files: [file] })
      } catch {
        // user cancelled
      }
    })
  }, [boxes, showToast])

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🖼️ 이미지 주석 도구</h1>
        <p>이미지를 업로드하고 박스를 추가하여 주석을 달아보세요</p>
      </header>

      <Toolbar
        hasImage={!!imageSrc}
        hasSelection={!!selectedBoxId}
        onUpload={handleImageUpload}
        onAddBox={handleAddBox}
        onDeleteSelected={handleDeleteSelected}
        onDownload={handleDownload}
        onShare={handleShare}
      />

      <CanvasArea
        imageSrc={imageSrc}
        boxes={boxes}
        selectedBoxId={selectedBoxId}
        imageRef={imageRef}
        wrapperRef={wrapperRef}
        onSelectBox={handleSelectBox}
        onBoxMove={handleBoxMove}
        onDeleteBox={handleDeleteBox}
        onFetchApi={handleFetchApi}
      />

      <ApiConfig apiUrl={apiUrl} onApiUrlChange={setApiUrl} />
      <InfoPanel />
      {toast && <Toast message={toast} />}
    </div>
  )
}
