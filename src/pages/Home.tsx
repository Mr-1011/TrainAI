import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Sparkles, Video, TrendingUp, Clock, FileText } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Total Videos",
      value: "24",
      description: "Training videos generated",
      icon: Video,
      trend: "+3 this week",
    },
    {
      title: "Knowledge Items",
      value: "156",
      description: "Manuals, models & images",
      icon: BookOpen,
      trend: "+12 this month",
    },
    {
      title: "Equipment Models",
      value: "8",
      description: "Different models covered",
      icon: FileText,
      trend: "3 manufacturers",
    },
    {
      title: "Total Views",
      value: "1,287",
      description: "Video views this month",
      icon: TrendingUp,
      trend: "+23% from last month",
    },
  ];

  const quickActions = [
    {
      title: "Create Training Video",
      description: "Generate a new AI-powered maintenance video",
      icon: Sparkles,
      action: () => navigate("/prompt"),
      color: "bg-primary text-primary-foreground",
    },
    {
      title: "Upload Knowledge",
      description: "Add manuals, 3D models, or reference images",
      icon: BookOpen,
      action: () => navigate("/knowledge"),
      color: "bg-secondary text-secondary-foreground",
    },
    {
      title: "Browse Library",
      description: "View and manage your training videos",
      icon: Video,
      action: () => navigate("/library"),
      color: "bg-accent text-accent-foreground",
    },
  ];

  const recentActivity = [
    {
      title: "Door Replacement - SCC 101",
      time: "2 hours ago",
      type: "Video Generated",
      icon: Video,
    },
    {
      title: "SCC 102 Manual Uploaded",
      time: "5 hours ago",
      type: "Knowledge Added",
      icon: BookOpen,
    },
    {
      title: "Heating Element Cleaning",
      time: "Yesterday",
      type: "Video Generated",
      icon: Video,
    },
    {
      title: "3D Model - Complete Unit",
      time: "2 days ago",
      type: "Knowledge Added",
      icon: BookOpen,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Welcome to TrainAI</h1>
        <p className="text-muted-foreground mt-2">
          Create professional maintenance training videos powered by AI
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>{stat.title}</CardDescription>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
                <p className="text-xs text-primary mt-2">{stat.trend}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card
                key={action.title}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={action.action}
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-2 ${action.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {recentActivity.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.type}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground flex-shrink-0">
                      <Clock className="h-4 w-4" />
                      {activity.time}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
