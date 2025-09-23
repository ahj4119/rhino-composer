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

const Simulator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<"3d" | "top">("3d");
  
  // Grasshopper parameters
  const [parameters, setParameters] = useState({
    x_count: 11,
    y_count: 14,
    height: 690,
    x_grid: 10800,
    y_grid: 10800,
    z_height: 9000,
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    toast({
      title: "생성 시작",
      description: "Rhino Compute 서버와 통신 중...",
    });
    
    try {
      // Simulate API call to Flask server
      const response = await fetch('http://localhost:6500/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parameters),
      });
      
      if (response.ok) {
        toast({
          title: "생성 완료",
          description: "3D 모델이 성공적으로 생성되었습니다.",
        });
      } else {
        throw new Error('Generation failed');
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
              {/* Grid Parameters */}
              <Card className="p-4 bg-cad-panel border-cad-border">
                <h3 className="font-medium mb-3 text-cad-panel-foreground">그리드 설정</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="x_count" className="text-cad-panel-foreground">X 개수</Label>
                    <Input
                      id="x_count"
                      type="number"
                      value={parameters.x_count}
                      onChange={(e) => handleParameterChange('x_count', parseInt(e.target.value))}
                      className="bg-cad-dark border-cad-border text-cad-dark-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="y_count" className="text-cad-panel-foreground">Y 개수</Label>
                    <Input
                      id="y_count"
                      type="number"
                      value={parameters.y_count}
                      onChange={(e) => handleParameterChange('y_count', parseInt(e.target.value))}
                      className="bg-cad-dark border-cad-border text-cad-dark-foreground"
                    />
                  </div>
                </div>
              </Card>

              {/* Dimension Parameters */}
              <Card className="p-4 bg-cad-panel border-cad-border">
                <h3 className="font-medium mb-3 text-cad-panel-foreground">치수 설정</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="height" className="text-cad-panel-foreground">높이</Label>
                    <Input
                      id="height"
                      type="number"
                      value={parameters.height}
                      onChange={(e) => handleParameterChange('height', parseInt(e.target.value))}
                      className="bg-cad-dark border-cad-border text-cad-dark-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="x_grid" className="text-cad-panel-foreground">X 그리드</Label>
                    <Input
                      id="x_grid"
                      type="number"
                      value={parameters.x_grid}
                      onChange={(e) => handleParameterChange('x_grid', parseInt(e.target.value))}
                      className="bg-cad-dark border-cad-border text-cad-dark-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="y_grid" className="text-cad-panel-foreground">Y 그리드</Label>
                    <Input
                      id="y_grid"
                      type="number"
                      value={parameters.y_grid}
                      onChange={(e) => handleParameterChange('y_grid', parseInt(e.target.value))}
                      className="bg-cad-dark border-cad-border text-cad-dark-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="z_height" className="text-cad-panel-foreground">Z 높이</Label>
                    <Input
                      id="z_height"
                      type="number"
                      value={parameters.z_height}
                      onChange={(e) => handleParameterChange('z_height', parseInt(e.target.value))}
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
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Simulator;