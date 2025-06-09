
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Github, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const License = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to LangCanvas
          </Button>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">License</h1>
          <p className="text-muted-foreground">MIT License for LangCanvas</p>
        </div>

        {/* Repository Information */}
        <div className="bg-card border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
            <Github className="w-5 h-5 mr-2" />
            Repository & Contributions
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-foreground mb-2">Source Code</h3>
              <p className="text-muted-foreground text-sm mb-3">
                The complete source code for LangCanvas is available on GitHub:
              </p>
              <a 
                href="https://github.com/LangCanvas/langcanvas" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
              >
                github.com/your-username/langcanvas
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
            
            <div>
              <h3 className="font-medium text-foreground mb-2">Contributing</h3>
              <p className="text-muted-foreground text-sm mb-2">
                We welcome contributions! Here's how you can help:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Report bugs and request features via GitHub Issues</li>
                <li>• Submit pull requests for bug fixes and new features</li>
                <li>• Improve documentation and examples</li>
                <li>• Share feedback and suggestions</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-foreground mb-2">Development Setup</h3>
              <p className="text-sm text-muted-foreground">
                Check the README.md file in the repository for development setup instructions and contribution guidelines.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">MIT License</h2>
            
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">Copyright (c) 2025 Balazs Devay</strong>
              </p>
              
              <p>
                Permission is hereby granted, free of charge, to any person obtaining a copy
                of this software and associated documentation files (the "Software"), to deal
                in the Software without restriction, including without limitation the rights
                to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
                copies of the Software, and to permit persons to whom the Software is
                furnished to do so, subject to the following conditions:
              </p>
              
              <p>
                The above copyright notice and this permission notice shall be included in all
                copies or substantial portions of the Software.
              </p>
              
              <div className="bg-muted/50 p-4 rounded border-l-4 border-blue-500">
                <p className="font-medium text-foreground mb-2">
                  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND
                </p>
                <p>
                  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
                  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
                  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
                  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
                  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
                  SOFTWARE.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-lg font-medium text-foreground mb-3">What this means for you:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                You can use LangCanvas for any purpose, including commercial projects
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                You can modify and distribute the software
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                You can use it in private projects
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                You must include the copyright notice and license in any distribution
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">!</span>
                The software comes without warranty - use at your own risk
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default License;
