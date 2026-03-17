export default function InfoPanel() {
  return (
    <div className="info-panel">
      <h3>📖 사용 방법</h3>
      <ul>
        <li>이미지를 업로드하세요</li>
        <li>"박스 추가" 버튼으로 주석 박스를 생성하세요</li>
        <li>박스를 드래그하여 원하는 위치로 이동하세요</li>
        <li>박스 안에서 검색어를 입력하고 "API 조회"로 정보를 가져오세요</li>
        <li>박스의 ✕ 버튼 또는 "선택 삭제" 버튼으로 박스를 삭제하세요</li>
        <li>"이미지 저장"으로 주석이 포함된 이미지를 다운로드하세요</li>
      </ul>
    </div>
  )
}
