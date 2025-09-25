from flask import Flask, render_template, request, jsonify, send_file
from flask_cors import CORS
import compute_rhino3d.Brep
import rhino3dm
import requests
import base64
import json
import urllib.parse
import os
import tempfile
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for React app

# Rhino Compute 설정
compute_rhino3d.Util.authToken = ""
compute_rhino3d.Util.url = "http://127.0.0.1:6500/"
post_url = compute_rhino3d.Util.url + "grasshopper"

class ColumnsGenerator:
    def __init__(self, ghx_file="./columns.ghx"):
        self.ghx_file = ghx_file
        if not os.path.exists(self.ghx_file):
            raise FileNotFoundError(f"Grasshopper file not found: {self.ghx_file}")
        
        try:
            with open(self.ghx_file, mode="r", encoding="utf-8-sig") as f:
                self.gh_data = f.read()
            
            # Validate file content
            if not self.gh_data.strip():
                raise ValueError("Grasshopper file is empty")
            
            # Check if it looks like a valid GH file
            if not ('<Archive' in self.gh_data or 'grasshopper' in self.gh_data.lower()):
                raise ValueError("File doesn't appear to be a valid Grasshopper definition")
                
            print(f"✓ Grasshopper file loaded: {len(self.gh_data)} characters")
            
        except UnicodeDecodeError as e:
            raise ValueError(f"Unable to read Grasshopper file (encoding issue): {e}")
        except Exception as e:
            raise ValueError(f"Error loading Grasshopper file: {e}")
        
    def generate(self):
        """Grasshopper 정의 실행 (파일 경로를 pointer로 전달)"""
        try:
            import urllib.parse
            
            # 절대 경로로 변환
            absolute_path = os.path.abspath(self.ghx_file)
            
            # 파일 경로를 URL 인코딩 (슬래시 방향 수정)
            encoded_path = urllib.parse.quote(absolute_path.replace("\\", "/"))
            
            # Rhino Compute 서버에 pointer 방식으로 요청
            url = f"{post_url}?pointer={encoded_path}"
            
            headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
            
            # 입력 파라미터 없이 빈 payload로 요청
            payload = {}
            
            print(f"Calling Rhino Compute with pointer: {url}")
            
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            
            print(f"Response status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "success": True,
                    "data": result,
                    "message": "Generation completed successfully"
                }
            else:
                print(f"Response text: {response.text}")
                return {
                    "success": False,
                    "error": f"Rhino Compute error: {response.status_code}",
                    "message": response.text
                }
                
        except Exception as e:
            print(f"Exception occurred: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to generate geometry"
            }

# Global generator instance
try:
    generator = ColumnsGenerator()
    print("✓ Grasshopper definition loaded successfully")
except FileNotFoundError as e:
    print(f"✗ Error: {e}")
    print("Please make sure 'columns.ghx' file exists in the same directory as this script")
    generator = None

@app.route('/')
def index():
    return jsonify({
        "message": "Rhino Compute Flask Server",
        "status": "running",
        "endpoints": {
            "generate": "/generate",
            "health": "/health"
        }
    })

@app.route('/health')
def health():
    """서버 상태 확인"""
    return jsonify({
        "status": "healthy",
        "grasshopper_loaded": generator is not None,
        "rhino_compute_url": compute_rhino3d.Util.url,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/generate', methods=['POST'])
def generate():
    """Grasshopper 정의 실행 (입력 파라미터 없음)"""
    if generator is None:
        return jsonify({
            "success": False,
            "error": "Grasshopper definition not loaded",
            "message": "Please ensure columns.ghx file exists"
        }), 500
    
    try:
        print("Generating geometry without input parameters...")
        
        # 입력 파라미터 없이 Grasshopper 실행
        result = generator.generate()
        
        if result["success"]:
            return jsonify(result)
        else:
            return jsonify(result), 500
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Internal server error"
        }), 500

@app.route('/parameters')
def get_parameters():
    """사용 가능한 파라미터 정보 반환 (현재는 입력 파라미터 없음)"""
    return jsonify({
        "parameters": {},
        "message": "No input parameters required - using Grasshopper definition as-is"
    })

@app.route('/debug/file-info')
def debug_file_info():
    """Grasshopper 파일 정보 확인"""
    if generator is None:
        return jsonify({
            "error": "Generator not loaded",
            "file_exists": os.path.exists("./columns.ghx")
        }), 500
    
    try:
        file_size = os.path.getsize("./columns.ghx")
        with open("./columns.ghx", 'r', encoding="utf-8-sig") as f:
            content = f.read()
            
        return jsonify({
            "file_exists": True,
            "file_size": file_size,
            "content_length": len(content),
            "first_100_chars": content[:100],
            "last_100_chars": content[-100:],
            "contains_archive": '<Archive' in content,
            "contains_grasshopper": 'grasshopper' in content.lower(),
            "encoding_test_passed": True
        })
    except Exception as e:
        return jsonify({
            "error": str(e),
            "file_exists": os.path.exists("./columns.ghx")
        }), 500

@app.route('/debug/test-encode')
def debug_test_encode():
    """Base64 인코딩 테스트"""
    if generator is None:
        return jsonify({"error": "Generator not loaded"}), 500
    
    try:
        # 간단한 인코딩 테스트
        data_bytes = generator.gh_data.encode("utf-8")
        encoded = base64.b64encode(data_bytes)
        decoded_text = encoded.decode("utf-8")
        
        return jsonify({
            "original_length": len(generator.gh_data),
            "encoded_length": len(encoded),
            "decoded_length": len(decoded_text),
            "encoding_success": True,
            "first_50_encoded": decoded_text[:50]
        })
    except Exception as e:
        return jsonify({
            "error": str(e),
            "encoding_success": False
        }), 500

if __name__ == '__main__':
    print("="*50)
    print("Rhino Compute Flask Server")
    print("="*50)
    print(f"Server URL: http://localhost:5000")
    print(f"Rhino Compute URL: {compute_rhino3d.Util.url}")
    print(f"Grasshopper file: {'✓ Loaded' if generator else '✗ Not found'}")
    print("="*50)
    
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )