import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Activity, 
  Home,
  Settings
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Information = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  const tabs = [
    { id: "dashboard", label: "대시보드", icon: BarChart3 },
    { id: "analytics", label: "분석", icon: TrendingUp },
    { id: "reports", label: "리포트", icon: PieChart },
    { id: "monitoring", label: "모니터링", icon: Activity },
    { id: "settings", label: "설정", icon: Settings },
  ];

  const powerBiUrl = "https://app.powerbi.com/view?r=eyJrIjoiNjA0YjU5YWQtNGU3MC00NTlmLWIzN2UtMzUzMmY2YTYxNjQ2IiwidCI6IjMzYWQ4ZTk5LWI1YjItNDg0Yy1hNWEzLTZlNTUzOWUzYmQ0YyIsImMiOjF9"; // Example PowerBI URL

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
            <h1 className="text-2xl font-bold text-primary">정보보기</h1>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-cad-sidebar border-r border-cad-border min-h-[calc(100vh-73px)]">
          <nav className="p-4">
            <div className="space-y-2">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "secondary" : "ghost"}
                  className={`w-full justify-start text-left ${
                    activeTab === tab.id 
                      ? "bg-cad-accent text-white hover:bg-cad-accent/90" 
                      : "text-cad-dark-foreground hover:bg-cad-panel"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <tab.icon className="w-4 h-4 mr-3" />
                  {tab.label}
                </Button>
              ))}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Card className="h-[calc(100vh-140px)]">
            <div className="p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold capitalize">
                  {tabs.find(tab => tab.id === activeTab)?.label}
                </h2>
                <div className="text-sm text-muted-foreground">
                  PowerBI 대시보드
                </div>
              </div>
              
              {/* PowerBI iframe container */}
              <div className="w-full h-[calc(100%-80px)] border border-border rounded-lg overflow-hidden">
                <iframe
                  src={powerBiUrl}
                  className="w-full h-full"
                  frameBorder="0"
                  allowFullScreen
                  title={`PowerBI - ${tabs.find(tab => tab.id === activeTab)?.label}`}
                />
              </div>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Information;