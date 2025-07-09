'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface GenerateSurveyDialogProps {
  onSurveyGenerated: (survey: {
    title: string;
    description: string;
    questions: Array<{
      questionText: string;
      questionType: 'multiple_choice' | 'text' | 'rating';
      isRequired: boolean;
      options?: Array<{ text: string }>;
    }>;
  }) => void;
}

export function GenerateSurveyDialog({ onSurveyGenerated }: GenerateSurveyDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description for your survey');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate survey');
      }

      const survey = await response.json();
      onSurveyGenerated(survey);
      setIsOpen(false);
      setPrompt('');
      toast.success('Survey generated successfully!');
    } catch (error) {
      console.error('Error generating survey:', error);
      toast.error('Failed to generate survey. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Generate Survey
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate Survey with AI</DialogTitle>
          <DialogDescription>
            Describe what kind of survey you want to create, and AI will generate it for you.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="prompt">Survey Description</Label>
            <Textarea
              id="prompt"
              placeholder="e.g., Generate a survey about Liverpool FC fan satisfaction, or Create a survey about user experience with our registration form"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="mt-2"
              rows={4}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 