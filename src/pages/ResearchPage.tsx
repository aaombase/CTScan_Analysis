import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Dna, Activity, TrendingUp, Database, CheckCircle, BookOpen, Target } from "lucide-react";

export default function ResearchPage() {
  const modelComparison = [
    { model: "CNN Only", accuracy: 89, sensitivity: 87, specificity: 91 },
    { model: "CNN + GA", accuracy: 92, sensitivity: 90, specificity: 94 },
    { model: "CNN–GA–BiLSTM (Ours)", accuracy: 96, sensitivity: 95, specificity: 97 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Model & Research</h1>
        <p className="text-muted-foreground">Understanding the CNN–GA–BiLSTM hybrid deep learning approach</p>
      </div>

      {/* Model Overview */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-3">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">CNN–GA–BiLSTM Hybrid Model</CardTitle>
              <CardDescription>Advanced deep learning architecture for brain stroke detection</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Our hybrid model combines Convolutional Neural Networks (CNN) for spatial feature extraction, 
            Genetic Algorithms (GA) for optimal feature selection, and Bidirectional Long Short-Term Memory (BiLSTM) 
            for temporal pattern recognition. This innovative combination achieves state-of-the-art accuracy of 96% 
            in detecting brain strokes from CT scan images.
          </p>
        </CardContent>
      </Card>

      {/* Model Components */}
      <Tabs defaultValue="cnn" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cnn" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            CNN
          </TabsTrigger>
          <TabsTrigger value="ga" className="flex items-center gap-2">
            <Dna className="h-4 w-4" />
            Genetic Algorithm
          </TabsTrigger>
          <TabsTrigger value="bilstm" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            BiLSTM
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cnn">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-500" />
                Convolutional Neural Network (CNN)
              </CardTitle>
              <CardDescription>Spatial feature extraction from CT images</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                The CNN component uses a VGG16-based architecture pre-trained on ImageNet and fine-tuned for 
                medical imaging. It excels at extracting hierarchical spatial features from CT scan slices, 
                identifying patterns indicative of stroke lesions.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold">Architecture</h4>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>• 16 convolutional layers</li>
                    <li>• Max pooling layers</li>
                    <li>• ReLU activation functions</li>
                    <li>• Batch normalization</li>
                  </ul>
                </div>
                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold">Key Features</h4>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>• Edge and texture detection</li>
                    <li>• Lesion boundary identification</li>
                    <li>• Multi-scale feature maps</li>
                    <li>• Transfer learning capability</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ga">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dna className="h-5 w-5 text-green-500" />
                Genetic Algorithm (GA)
              </CardTitle>
              <CardDescription>Evolutionary feature optimization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                The Genetic Algorithm optimizes the feature selection process by mimicking natural evolution. 
                It selects the most discriminative features extracted by CNN, reducing dimensionality while 
                maintaining classification accuracy.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold">GA Process</h4>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>• Population initialization</li>
                    <li>• Fitness evaluation</li>
                    <li>• Selection & crossover</li>
                    <li>• Mutation & evolution</li>
                  </ul>
                </div>
                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold">Benefits</h4>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>• Reduces feature dimensionality by 40%</li>
                    <li>• Eliminates redundant features</li>
                    <li>• Improves model generalization</li>
                    <li>• Faster inference time</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bilstm">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-500" />
                Bidirectional LSTM (BiLSTM)
              </CardTitle>
              <CardDescription>Sequential pattern recognition</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                The BiLSTM component processes the optimized features as sequential data, capturing temporal 
                dependencies between CT slices. It analyzes patterns in both forward and backward directions, 
                providing comprehensive context for classification.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold">Architecture</h4>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>• 256 LSTM units per direction</li>
                    <li>• Dropout regularization (0.5)</li>
                    <li>• Dense output layer</li>
                    <li>• Softmax activation</li>
                  </ul>
                </div>
                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold">Advantages</h4>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>• Captures long-range dependencies</li>
                    <li>• Bidirectional context awareness</li>
                    <li>• Handles variable-length sequences</li>
                    <li>• Gradient flow preservation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Performance Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Comparison
          </CardTitle>
          <CardDescription>Model accuracy improvements over baseline CNN</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {modelComparison.map((item) => (
              <div key={item.model} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{item.model}</span>
                  <div className="flex gap-4">
                    <Badge variant="outline">Accuracy: {item.accuracy}%</Badge>
                    <Badge variant="outline">Sensitivity: {item.sensitivity}%</Badge>
                    <Badge variant="outline">Specificity: {item.specificity}%</Badge>
                  </div>
                </div>
                <Progress value={item.accuracy} className="h-3" />
              </div>
            ))}
          </div>
          <Separator className="my-6" />
          <div className="rounded-lg bg-green-500/10 p-4">
            <p className="text-sm text-green-700 dark:text-green-300">
              <strong>Key Finding:</strong> The CNN–GA–BiLSTM hybrid model achieves a 7% improvement in accuracy 
              over standalone CNN models, with significantly better sensitivity for early stroke detection.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Datasets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Training Datasets
          </CardTitle>
          <CardDescription>Data sources used for model training and validation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <h4 className="font-semibold">Kaggle Brain CT Dataset</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Curated collection of brain CT scans with stroke and non-stroke labels. 
                Contains 2,500+ annotated images with expert radiologist verification.
              </p>
              <div className="mt-2 flex gap-2">
                <Badge variant="secondary">2,500+ images</Badge>
                <Badge variant="secondary">Binary labels</Badge>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <h4 className="font-semibold">TCIA (Cancer Imaging Archive)</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Open-access repository of medical images including brain CT scans. 
                Used for model validation and cross-dataset generalization testing.
              </p>
              <div className="mt-2 flex gap-2">
                <Badge variant="secondary">Public access</Badge>
                <Badge variant="secondary">DICOM format</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Explainable AI Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Explainable AI (XAI)
          </CardTitle>
          <CardDescription>Transparency and interpretability in medical AI</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Explainable AI is crucial in medical applications where clinicians need to understand and validate 
            AI predictions. Our system uses Gradient-weighted Class Activation Mapping (Grad-CAM) to visualize 
            which regions of CT scans influence the model's decision.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4 text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold">Grad-CAM Heatmaps</h4>
              <p className="mt-1 text-sm text-muted-foreground">Visual highlighting of decision-critical regions</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold">Clinical Validation</h4>
              <p className="mt-1 text-sm text-muted-foreground">Enables radiologist verification of AI findings</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold">Trust Building</h4>
              <p className="mt-1 text-sm text-muted-foreground">Increases confidence in AI-assisted diagnosis</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Research Papers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Research Publications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4">
            <h4 className="font-semibold">Automated Brain Stroke Detection from CT Images Using Hybrid Deep Learning Models</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Conference paper presenting the CNN–GA–BiLSTM architecture and its superior performance 
              in stroke detection compared to traditional methods.
            </p>
            <div className="mt-2 flex gap-2">
              <Badge>Deep Learning</Badge>
              <Badge>Medical Imaging</Badge>
              <Badge>Stroke Detection</Badge>
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <h4 className="font-semibold">Design and Implementation of an AI-Powered CT Scan Report Analyzer</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Review paper covering the system architecture, web platform design, and integration 
              of explainable AI techniques for clinical deployment.
            </p>
            <div className="mt-2 flex gap-2">
              <Badge>System Design</Badge>
              <Badge>Web Platform</Badge>
              <Badge>Explainable AI</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
