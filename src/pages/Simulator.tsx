import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Play, 
  RefreshCw, 
  Eye, 
  Grid3x3, 
  Box,
  Settings2,
  Maximize2,
  RotateCcw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ThreeViewer } from "@/components/ThreeViewer";

const Simulator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<"3d" | "top">("3d");
  const [geometryData, setGeometryData] = useState<any[]>([]);
  
  // Grasshopper parameters
  const [parameters, setParameters] = useState({
    height: 690,
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    toast({
      title: "생성 시작",
      description: "Rhino Compute 서버와 통신 중...",
    });
    
    try {
      // API call to Flask server
      const response = await fetch('http://localhost:5000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parameters),
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Rhino Compute 응답 데이터를 Three.js가 이해할 수 있는 형태로 변환
          const processedGeometry = processRhinoComputeData(result.data);
          setGeometryData(processedGeometry);
          
          toast({
            title: "생성 완료",
            description: "3D 모델이 성공적으로 생성되었습니다.",
          });
        } else {
          throw new Error(result.message || 'Generation failed');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Generation failed');
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "서버 연결에 실패했습니다. Rhino Compute 서버가 실행 중인지 확인하세요.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleParameterChange = (key: string, value: number) => {
    setParameters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Rhino Compute 데이터를 Three.js 형태로 변환하는 함수
  const processRhinoComputeData = (data: any) => {
    if (!data.values) return [];
    
    const processedGeometry: any[] = [];
    
    data.values.forEach((value: any) => {
      if (value.InnerTree) {
        Object.keys(value.InnerTree).forEach(key => {
          const items = value.InnerTree[key];
          items.forEach((item: any) => {
            if (item.data) {
              try {
                // Base64 디코딩된 3dm 파일 데이터 처리
                // 실제 구현에서는 rhino3dm 라이브러리를 사용해야 함
                // 지금은 간단한 더미 데이터로 테스트
                processedGeometry.push({
                  vertices: generateDummyVertices(),
                  faces: generateDummyFaces(),
                });
              } catch (error) {
                console.error('Error processing geometry data:', error);
              }
            }
          });
        });
      }
    });
    
    return processedGeometry;
  };

  // 더미 데이터 생성 함수 (실제 Rhino 데이터 파싱 전까지 사용)
  const generateDummyVertices = () => {
    const vertices = [];
    // 단순한 박스 하나만 생성
    const x = 0, z = 0;
    const y = parameters.height;
    
    // 박스의 8개 꼭짓점
    const size = 500;
    vertices.push(
      [x - size, 0, z - size], [x + size, 0, z - size],
      [x + size, y, z - size], [x - size, y, z - size],
      [x - size, 0, z + size], [x + size, 0, z + size],
      [x + size, y, z + size], [x - size, y, z + size]
    );
    return vertices;
  };

  const generateDummyFaces = () => {
    // 단순한 박스 하나의 12개 삼각형 면
    const faces = [
      [0, 1, 2], [0, 2, 3], // 앞면
      [4, 7, 6], [4, 6, 5], // 뒷면
      [0, 4, 5], [0, 5, 1], // 아래면
      [2, 6, 7], [2, 7, 3], // 위면
      [0, 3, 7], [0, 7, 4], // 왼쪽면
      [1, 5, 6], [1, 6, 2]  // 오른쪽면
    ];
    return faces;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate("/")}
              className="flex items-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>홈으로</span>
            </Button>
            <h1 className="text-2xl font-bold text-primary">시뮬레이터</h1>
            <Badge variant="secondary" className="bg-cad-accent text-white">
              Rhino Compute
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === "3d" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("3d")}
            >
              <Box className="w-4 h-4 mr-2" />
              3D 뷰
            </Button>
            <Button
              variant={viewMode === "top" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("top")}
            >
              <Grid3x3 className="w-4 h-4 mr-2" />
              평면 뷰
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Parameter Panel */}
        <aside className="w-80 bg-cad-sidebar border-r border-cad-border min-h-[calc(100vh-73px)]">
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-6">
              <Settings2 className="w-5 h-5 text-cad-accent" />
              <h2 className="text-lg font-semibold text-cad-dark-foreground">
                Grasshopper 파라미터
              </h2>
            </div>

            <div className="space-y-6">
              {/* Height Parameter */}
              <Card className="p-4 bg-cad-panel border-cad-border">
                <h3 className="font-medium mb-3 text-cad-panel-foreground">파라미터 설정</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="height" className="text-cad-panel-foreground">높이 (Height)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={parameters.height}
                      onChange={(e) => handleParameterChange('height', parseInt(e.target.value))}
                      className="bg-cad-dark border-cad-border text-cad-dark-foreground"
                    />
                  </div>
                </div>
              </Card>

              <Separator className="bg-cad-border" />
              
              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-cad-accent hover:bg-cad-accent/90 text-white"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    생성하기
                  </>
                )}
              </Button>
            </div>
          </div>
        </aside>

        {/* 3D Viewer */}
        <main className="flex-1 p-6">
          <Card className="h-[calc(100vh-140px)] relative overflow-hidden">
            <div className="absolute top-4 right-4 z-10 flex space-x-2">
              <Button variant="outline" size="sm">
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4" />
              </Button>
            </div>
            
            {geometryData.length > 0 ? (
              <ThreeViewer 
                geometryData={geometryData} 
                viewMode={viewMode}
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-cad-dark to-cad-panel flex items-center justify-center">
                <div className="text-center text-cad-dark-foreground">
                  <Box className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-medium mb-2">3D 뷰어</h3>
                  <p className="text-sm opacity-75">
                    {viewMode === "3d" ? "3D 모델 뷰" : "평면 뷰"}
                  </p>
                  <p className="text-xs opacity-50 mt-2">
                    파라미터를 설정하고 '생성하기'를 클릭하세요
                  </p>
                </div>
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Simulator;