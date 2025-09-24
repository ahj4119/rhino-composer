# Rhino Compute Flask Server

이 Flask 서버는 Grasshopper 정의를 실행하고 3D 지오메트리를 생성하는 Rhino Compute 서버입니다.

## 설치 및 실행

### 1. Python 패키지 설치
```bash
pip install -r requirements.txt
```

### 2. Grasshopper 파일 준비
- `columns.ghx` 파일을 `flask_server.py`와 같은 디렉토리에 위치시킵니다.
- 이 파일은 Rhino Grasshopper에서 생성한 정의 파일입니다.

### 3. Rhino Compute 서버 실행
- Rhino Compute 서버가 `http://127.0.0.1:6500/`에서 실행되고 있어야 합니다.

### 4. Flask 서버 실행
```bash
python flask_server.py
```

서버가 `http://localhost:5000`에서 실행됩니다.

## API 엔드포인트

### GET `/health`
서버 상태 확인

### POST `/generate`
Grasshopper 정의 실행

**요청 파라미터:**
```json
{
  "x_count": 11,
  "y_count": 14,
  "height": 690,
  "x_grid": 10800,
  "y_grid": 10800,
  "z_height": 9000
}
```

### GET `/parameters`
사용 가능한 파라미터 정보 조회

## 주의사항

1. **Rhino Compute 서버**: 별도로 Rhino Compute 서버가 실행되어야 합니다.
2. **Grasshopper 파일**: `columns.ghx` 파일이 필요합니다.
3. **CORS**: React 앱과의 통신을 위해 CORS가 활성화되어 있습니다.

## 문제 해결

- **Grasshopper 파일 오류**: `columns.ghx` 파일이 올바른 위치에 있는지 확인
- **Rhino Compute 연결 오류**: Rhino Compute 서버가 실행 중인지 확인
- **포트 충돌**: 다른 애플리케이션이 5000 포트를 사용하고 있지 않은지 확인