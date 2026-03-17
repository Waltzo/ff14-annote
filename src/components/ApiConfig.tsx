interface ApiConfigProps {
  apiUrl: string
  onApiUrlChange: (url: string) => void
}

export default function ApiConfig({ apiUrl, onApiUrlChange }: ApiConfigProps) {
  return (
    <div className="api-config">
      <h3>🔗 API 설정</h3>
      <div className="api-config-row">
        <input
          type="text"
          value={apiUrl}
          onChange={(e) => onApiUrlChange(e.target.value)}
          placeholder="API URL (검색어가 string 파라미터로 추가됩니다)"
        />
      </div>
    </div>
  )
}
