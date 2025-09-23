import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Database, Play } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-cad-accent bg-clip-text text-transparent">
            Rhino Compute Studio
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional computational design platform powered by Grasshopper and Rhino Compute
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="p-8 hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Database className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold">정보보기</h2>
              <p className="text-muted-foreground">
                프로젝트 데이터와 분석 리포트를 PowerBI 대시보드로 확인하세요
              </p>
              <Button 
                onClick={() => navigate("/information")}
                className="w-full"
                size="lg"
              >
                정보보기 열기
              </Button>
            </div>
          </Card>

          <Card className="p-8 hover:shadow-lg transition-all duration-300 border-2 hover:border-cad-accent/50">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-cad-accent/10 rounded-full flex items-center justify-center mx-auto">
                <Play className="w-8 h-8 text-cad-accent" />
              </div>
              <h2 className="text-2xl font-semibold">시뮬레이터</h2>
              <p className="text-muted-foreground">
                Grasshopper 파라미터를 조정하고 실시간으로 3D 모델을 생성하세요
              </p>
              <Button 
                onClick={() => navigate("/simulator")}
                variant="secondary"
                className="w-full bg-cad-accent hover:bg-cad-accent/90 text-white"
                size="lg"
              >
                시뮬레이터 실행
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;