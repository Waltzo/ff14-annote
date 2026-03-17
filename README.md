# 이미지 주석 도구 (Image Annotation Tool)

React + TypeScript + Vite 기반의 이미지 주석 도구입니다.

## 주요 기능

- **이미지 업로드**: 로컬 이미지를 업로드
- **박스 생성/이동/삭제**: 주석 박스를 추가하고 드래그로 이동, 삭제
- **API 연동**: 박스에 외부 API 데이터를 조회하여 표시
- **이미지 저장**: 주석이 포함된 이미지를 PNG로 다운로드
- **반응형 디자인**: 모바일/데스크탑 모두 지원

## 기술 스택

- React 18 + TypeScript
- Vite
- GitHub Pages 배포

## 개발

```bash
npm install
npm run dev
```

## 빌드 & 배포

```bash
npm run build    # 빌드
npm run deploy   # GitHub Pages 배포
```

GitHub Actions를 통해 `main` 브랜치 push 시 자동 배포됩니다.
