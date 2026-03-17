import { useRef } from 'react'

interface ToolbarProps {
  hasImage: boolean
  hasSelection: boolean
  onUpload: (file: File) => void
  onAddBox: () => void
  onDeleteSelected: () => void
  onDownload: () => void
  onShare: () => void
}

export default function Toolbar({
  hasImage,
  hasSelection,
  onUpload,
  onAddBox,
  onDeleteSelected,
  onDownload,
  onShare,
}: ToolbarProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <input
          type="file"
          ref={fileRef}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onUpload(file)
          }}
        />
        <button className="btn btn-primary" onClick={() => fileRef.current?.click()}>
          📁 이미지 업로드
        </button>
        <button className="btn btn-secondary" disabled={!hasImage} onClick={onAddBox}>
          ➕ 박스 추가
        </button>
        <button className="btn btn-danger" disabled={!hasSelection} onClick={onDeleteSelected}>
          🗑️ 선택 삭제
        </button>
      </div>
      <div className="toolbar-group">
        <button className="btn btn-success" disabled={!hasImage} onClick={onDownload}>
          💾 이미지 저장
        </button>
        <button className="btn btn-info" disabled={!hasImage} onClick={onShare}>
          🔗 공유하기
        </button>
      </div>
    </div>
  )
}
