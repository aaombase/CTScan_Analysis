import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Monitor, Server, Brain, Database, Cloud, ArrowRight, Shield, Zap, Globe } from "lucide-react";

export default function ArchitecturePage() {
  const architectureLayers = [
    {
      icon: Monitor,
      title: "Presentation Layer",
      subtitle: "User Interface",
      color: "bg-blue-500",
      items: ["React Web Application", "Responsive Dashboard", "Real-time Updates", "Role-based Access"],
    },
    {
      icon: Server,
      title: "Application Layer",
      subtitle: "Flask REST API",
      color: "bg-green-500",
      items: ["RESTful Endpoints", "JWT Authentication", "Request Validation", "Error Handling"],
    },
    {
      icon: Brain,
      title: "AI Engine",
      subtitle: "CNN–GA–BiLSTM Model",
      color: "bg-purple-500",
      items: ["Image Preprocessing", "Feature Extraction", "Stroke Classification", "Grad-CAM Generation"],
    },
    {
      icon: Database,
      title: "Data Layer",
      subtitle: "MongoDB Database",
      color: "bg-orange-500",
      items: ["Patient Records", "Scan Metadata", "Analysis Results", "Audit Logs"],
    },
    {
      icon: Cloud,
      title: "Infrastructure",
      subtitle: "AWS / Docker",
      color: "bg-cyan-500",
      items: ["Container Orchestration", "Auto-scaling", "Load Balancing", "CDN Distribution"],
    },
  ];

  const dataFlowSteps = [
    { step: 1, title: "Upload", description: "User uploads CT scan images via web interface" },
    { step: 2, title: "Preprocess", description: "Images are normalized, resized, and prepared for analysis" },
    { step: 3, title: "Feature Extraction", description: "CNN extracts spatial features from CT slices" },
    { step: 4, title: "Optimization", description: "Genetic Algorithm optimizes feature selection" },
    { step: 5, title: "Classification", description: "BiLSTM processes temporal sequences for final prediction" },
    { step: 6, title: "Visualization", description: "Grad-CAM generates explainable heatmaps" },
    { step: 7, title: "Report", description: "Structured diagnostic report is generated" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">System Architecture</h1>
        <p className="text-muted-foreground">Technical overview of the AI-powered CT scan analysis platform</p>
      </div>

      {/* Architecture Diagram */}
      <Card>
        <CardHeader>
          <CardTitle>Multi-Layer Architecture</CardTitle>
          <CardDescription>End-to-end system design for brain stroke detection</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
            {architectureLayers.map((layer, index) => (
              <div key={layer.title} className="flex flex-1 items-center gap-2">
                <Card className="flex-1 border-2 transition-all hover:shadow-lg">
                  <CardHeader className="pb-2">
                    <div className={`mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg ${layer.color}`}>
                      <layer.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-base">{layer.title}</CardTitle>
                    <CardDescription>{layer.subtitle}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {layer.items.map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                {index < architectureLayers.length - 1 && (
                  <ArrowRight className="hidden h-6 w-6 shrink-0 text-muted-foreground md:block" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Flow */}
      <Card>
        <CardHeader>
          <CardTitle>Data Processing Pipeline</CardTitle>
          <CardDescription>Step-by-step flow from scan upload to diagnostic report</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 h-full w-0.5 bg-border md:left-1/2" />
            
            <div className="space-y-8">
              {dataFlowSteps.map((item, index) => (
                <div key={item.step} className={`relative flex items-center gap-4 ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                  {/* Content */}
                  <div className={`ml-16 flex-1 md:ml-0 ${index % 2 === 0 ? "md:pr-8 md:text-right" : "md:pl-8"}`}>
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  
                  {/* Step indicator */}
                  <div className="absolute left-0 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold md:left-1/2 md:-translate-x-1/2">
                    {item.step}
                  </div>
                  
                  {/* Spacer for alternating layout */}
                  <div className="hidden flex-1 md:block" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Specifications */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              <CardTitle className="text-base">Security</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Encryption</span>
              <Badge>AES-256</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Authentication</span>
              <Badge>JWT + OAuth2</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Compliance</span>
              <Badge>HIPAA Ready</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <CardTitle className="text-base">Performance</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg. Analysis Time</span>
              <Badge>2.3 sec</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">API Response</span>
              <Badge>&lt; 200ms</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Uptime SLA</span>
              <Badge>99.9%</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-base">Scalability</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Max Concurrent</span>
              <Badge>1000 users</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Storage</span>
              <Badge>Unlimited</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Auto-scaling</span>
              <Badge>Enabled</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
          <CardDescription>RESTful API structure for frontend-backend communication</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-3 text-left font-semibold">Method</th>
                  <th className="py-3 text-left font-semibold">Endpoint</th>
                  <th className="py-3 text-left font-semibold">Description</th>
                  <th className="py-3 text-left font-semibold">Auth</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { method: "POST", endpoint: "/api/v1/auth/login", desc: "User authentication", auth: "Public" },
                  { method: "POST", endpoint: "/api/v1/auth/register", desc: "User registration", auth: "Public" },
                  { method: "GET", endpoint: "/api/v1/scans", desc: "List all scans", auth: "Required" },
                  { method: "POST", endpoint: "/api/v1/scans/upload", desc: "Upload CT images", auth: "Required" },
                  { method: "POST", endpoint: "/api/v1/scans/:id/analyze", desc: "Trigger AI analysis", auth: "Required" },
                  { method: "GET", endpoint: "/api/v1/scans/:id/results", desc: "Get prediction results", auth: "Required" },
                  { method: "GET", endpoint: "/api/v1/scans/:id/heatmap", desc: "Get Grad-CAM visualization", auth: "Required" },
                  { method: "GET", endpoint: "/api/v1/reports/:id", desc: "Generate diagnostic report", auth: "Required" },
                ].map((api) => (
                  <tr key={api.endpoint}>
                    <td className="py-3">
                      <Badge variant={api.method === "GET" ? "secondary" : "default"}>{api.method}</Badge>
                    </td>
                    <td className="py-3 font-mono text-xs">{api.endpoint}</td>
                    <td className="py-3 text-muted-foreground">{api.desc}</td>
                    <td className="py-3">
                      <Badge variant={api.auth === "Public" ? "outline" : "default"}>{api.auth}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
