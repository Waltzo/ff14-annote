import { useState } from 'react'
import type { AnnotationBox as BoxType } from '../types'

interface AnnotationBoxProps {
  box: BoxType
  isSelected: boolean
  onPointerDown: (e: React.PointerEvent, box: BoxType) => void
  onPointerMove: (e: React.PointerEvent) => void
  onPointerUp: (e: React.PointerEvent) => void
  onDelete: (id: string) => void
  onFetchApi: (id: string, query: string) => void
}

export default function AnnotationBox({
  box,
  isSelected,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onDelete,
  onFetchApi,
}: AnnotationBoxProps) {
  const [query, setQuery] = useState('')

  const className = [
    'annotation-box',
    isSelected ? 'selected' : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      className={className}
      style={{
        left: box.x,
        top: box.y,
        width: box.width,
        height: box.height,
      }}
      onPointerDown={(e) => onPointerDown(e, box)}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div className="box-header">
        <span className="box-label">{box.label}</span>
        <button
          className="box-delete-btn"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(box.id)
          }}
          title="삭제"
        >
          ✕
        </button>
      </div>

      <div className="box-content">
        {box.loading ? (
          <div className="box-loading">
            <span className="spinner" />
            로딩중...
          </div>
        ) : box.apiData ? (
          <>
            <div className="title">{box.apiData.title}</div>
            <div className="description">{box.apiData.description}</div>
          </>
        ) : (
          <div className="box-empty">
            <div style={{ width: '100%' }}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="검색어 입력"
                onPointerDown={(e) => e.stopPropagation()}
                style={{
                  width: '100%',
                  padding: '2px 4px',
                  fontSize: '11px',
                  background: '#222',
                  border: '1px solid #444',
                  borderRadius: '3px',
                  color: '#ddd',
                  marginBottom: '4px',
                }}
              />
              <button
                className="box-fetch-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  if (query.trim()) onFetchApi(box.id, query.trim())
                }}
              >
                API 조회
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
