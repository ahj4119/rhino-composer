from flask import Flask, render_template, request, jsonify, send_file
from flask_cors import CORS
import compute_rhino3d.Brep
import rhino3dm
import requests
import base64
import json
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
        
        with open(self.ghx_file, mode="r", encoding="utf-8-sig") as f:
            self.gh_data = f.read()
        
    def generate(self, height=690):
        """Grasshopper 정의 실행"""
        try:
            data_bytes = self.gh_data.encode("utf-8")
            encoded = base64.b64encode(data_bytes)
            decoded = encoded.decode("utf-8")
            
            headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
            
            # Grasshopper 파라미터 설정
            payload = {
                "definition": decoded,
                "inputs": [
                    {"ParamName": "height", "InnerTree": {0: [{"type": "System.Double", "data": height}]}}
                ]
            }
            
            # Rhino Compute 서버에 요청
            response = requests.post(post_url, json=payload, headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "success": True,
                    "data": result,
                    "message": "Generation completed successfully"
                }
            else:
                return {
                    "success": False,
                    "error": f"Rhino Compute error: {response.status_code}",
                    "message": response.text
                }
                
        except Exception as e:
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
    """Grasshopper 정의 실행"""
    if generator is None:
        return jsonify({
            "success": False,
            "error": "Grasshopper definition not loaded",
            "message": "Please ensure columns.ghx file exists"
        }), 500
    
    try:
        data = request.get_json()
        
        # 파라미터 추출 (기본값 사용)
        height = data.get('height', 690)
        
        print(f"Generating with parameters: height={height}")
        
        # Grasshopper 실행
        result = generator.generate(height=height)
        
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
    """사용 가능한 파라미터 정보 반환"""
    return jsonify({
        "parameters": {
            "height": {
                "type": "number",
                "default": 690,
                "description": "요소 높이"
            }
        }
    })

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