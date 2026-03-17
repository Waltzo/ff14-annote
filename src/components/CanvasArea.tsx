import { useCallback, useRef } from 'react'
import type { AnnotationBox } from '../types'
import AnnotationBoxComponent from './AnnotationBox'

interface CanvasAreaProps {
  imageSrc: string | null
  boxes: AnnotationBox[]
  selectedBoxId: string | null
  imageRef: React.RefObject<HTMLImageElement>
  wrapperRef: React.RefObject<HTMLDivElement>
  onSelectBox: (id: string | null) => void
  onBoxMove: (id: string, x: number, y: number) => void
  onDeleteBox: (id: string) => void
  onFetchApi: (id: string, query: string) => void
}

export default function CanvasArea({
  imageSrc,
  boxes,
  selectedBoxId,
  imageRef,
  wrapperRef,
  onSelectBox,
  onBoxMove,
  onDeleteBox,
  onFetchApi,
}: CanvasAreaProps) {
  const dragRef = useRef({
    isDragging: false,
    boxId: null as string | null,
    startX: 0,
    startY: 0,
    startBoxX: 0,
    startBoxY: 0,
  })

  const getConstrainedPos = useCallback(
    (x: number, y: number, box: AnnotationBox) => {
      const wrapper = wrapperRef.current
      if (!wrapper) return { x, y }
      const maxX = wrapper.clientWidth - box.width
      const maxY = wrapper.clientHeight - box.height
      return {
        x: Math.max(0, Math.min(x, maxX)),
        y: Math.max(0, Math.min(y, maxY)),
      }
    },
    [wrapperRef],
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, box: AnnotationBox) => {
      e.preventDefault()
      e.stopPropagation()
      onSelectBox(box.id)
      dragRef.current = {
        isDragging: true,
        boxId: box.id,
        startX: e.clientX,
        startY: e.clientY,
        startBoxX: box.x,
        startBoxY: box.y,
      }
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [onSelectBox],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const d = dragRef.current
      if (!d.isDragging || !d.boxId) return
      const dx = e.clientX - d.startX
      const dy = e.clientY - d.startY
      const box = boxes.find(b => b.id === d.boxId)
      if (!box) return
      const pos = getConstrainedPos(d.startBoxX + dx, d.startBoxY + dy, box)
      onBoxMove(d.boxId, pos.x, pos.y)
    },
    [boxes, onBoxMove, getConstrainedPos],
  )

  const handlePointerUp = useCallback(() => {
    dragRef.current.isDragging = false
    dragRef.current.boxId = null
  }, [])

  const handleBackgroundClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget || e.target === imageRef.current) {
        onSelectBox(null)
      }
    },
    [onSelectBox, imageRef],
  )

  if (!imageSrc) {
    return (
      <div className="canvas-area">
        <div className="placeholder-message">
          <p>👆</p>
          <p>이미지를 업로드하여 시작하세요</p>
        </div>
      </div>
    )
  }

  return (
    <div className="canvas-area" onClick={handleBackgroundClick}>
      <div
        className="image-wrapper"
        ref={wrapperRef}
        style={{ position: 'relative' }}
      >
        <img
          ref={imageRef}
          src={imageSrc}
          alt="업로드된 이미지"
          draggable={false}
          style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
        />
        {boxes.map(box => (
          <AnnotationBoxComponent
            key={box.id}
            box={box}
            isSelected={box.id === selectedBoxId}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onDelete={onDeleteBox}
            onFetchApi={onFetchApi}
          />
        ))}
      </div>
    </div>
  )
}
