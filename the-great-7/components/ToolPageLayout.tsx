
import React, { useState } from 'react';
import { Tool } from '../types'; 
import { EDUCATIONAL_CONTENT, UI_ICONS } from '../constants';
import Tooltip from './Tooltip';
import Modal from './Modal';
import { exportToImage, exportToPDF, copyToClipboard } from '../services/exportService';
import { BookOpen, Download, Share2 } from 'lucide-react';

interface ToolPageLayoutProps {
  tool: Tool;
  children: React.ReactNode;
  exportContentId: string;
  getShareMessage: () => string;
  customActions?: React.ReactNode;
}

const ToolPageLayout: React.FC<ToolPageLayoutProps> = ({ tool, children, exportContentId, getShareMessage, customActions }) => {
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
  const education = EDUCATIONAL_CONTENT[tool.key];

  const handleExportImage = () => {
    exportToImage(exportContentId, `${tool.key}-export.png`);
  };

  const handleExportPDF = () => {
    exportToPDF(exportContentId, `${tool.key}-export.pdf`, tool.name);
  };
  
  const handleShare = () => {
    const message = `${getShareMessage()} - via The Great 7 (${tool.name})`;
    copyToClipboard(message, "Share message copied to clipboard!");
  };

  const baseButtonClass = "px-4 py-2 rounded-md text-sm font-sans font-medium transition-all duration-200 flex items-center shadow-sm hover:shadow-md";
  const primaryButtonClass = `${baseButtonClass} bg-brand-accent text-brand-accent-text hover:bg-brand-accent-hover`;
  const secondaryButtonClass = `${baseButtonClass} bg-brand-card-light dark:bg-brand-card-dark border border-brand-border-light dark:border-brand-border-dark text-brand-text-light dark:text-brand-text-dark hover:bg-zinc-200 dark:hover:bg-zinc-700`;


  return (
    <div className="container mx-auto font-mono">
      <header className="mb-6 border-b border-brand-border-light dark:border-brand-border-dark pb-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="flex items-center mb-2 sm:mb-0">
            <tool.icon className="h-8 w-8 text-brand-accent mr-3" />
            <h1 className="text-2xl lg:text-3xl font-sans font-semibold text-brand-text-light dark:text-brand-text-dark">{tool.name}</h1>
          </div>
          {education && (
            <Tooltip text={`Learn about the ${tool.name}`}>
              <button
                onClick={() => setIsEducationModalOpen(true)}
                className={`${secondaryButtonClass} text-xs`}
                aria-label={`Learn more about ${tool.name}`}
              >
                <BookOpen size={16} className="mr-1.5" /> Why This Works
              </button>
            </Tooltip>
          )}
        </div>
        <p className="text-sm font-mono text-brand-text-muted-light dark:text-brand-text-muted-dark mt-1 max-w-2xl">{tool.description}</p>
      </header>

      <div className="bg-brand-card-light dark:bg-brand-card-dark p-4 sm:p-6 rounded-lg border border-brand-border-light dark:border-brand-border-dark shadow-sm mb-6">
        {children}
      </div>

      <div className="mt-8 p-4 sm:p-6 bg-brand-card-light dark:bg-brand-card-dark rounded-lg border border-brand-border-light dark:border-brand-border-dark shadow-sm">
        <h3 className="text-lg font-sans font-medium text-brand-text-light dark:text-brand-text-dark mb-3">Actions</h3>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handleExportImage}
            className={secondaryButtonClass}
          >
            <Download size={16} className="mr-1.5"/> Export Image
          </button>
          <button
            onClick={handleExportPDF}
            className={secondaryButtonClass}
          >
            <Download size={16} className="mr-1.5"/> Export PDF
          </button>
           <button
            onClick={handleShare}
            className={primaryButtonClass}
          >
            <Share2 size={16} className="mr-1.5"/> Share Insight
          </button>
          {customActions}
        </div>
        <p className="text-xs font-mono text-brand-text-muted-light dark:text-brand-text-muted-dark mt-3">
            E.g., "My {tool.name} results: {tool.tagline}"
        </p>
      </div>

      {education && (
        <Modal
          isOpen={isEducationModalOpen}
          onClose={() => setIsEducationModalOpen(false)}
          title={`Understanding the ${tool.name}`}
          size="lg"
        >
          <div className="prose prose-sm dark:prose-invert max-w-none font-mono text-brand-text-light dark:text-brand-text-dark prose-headings:font-sans prose-headings:text-brand-text-light dark:prose-headings:text-brand-text-dark prose-strong:text-brand-text-light dark:prose-strong:text-brand-text-dark prose-p:text-brand-text-muted-light dark:prose-p:text-brand-text-muted-dark">
            <p className="lead">{education.principle}</p>
            {education.tooltip && <p className="p-3 bg-brand-card-light dark:bg-brand-card-dark border-l-2 border-brand-accent rounded-r-md my-3 text-xs"><strong className="font-sans text-brand-accent">Quick Tip:</strong> {education.tooltip}</p>}
            
            {education.guide && <div className="mt-3"><h4 className="font-sans font-medium">Step-by-Step Guide:</h4><div className="whitespace-pre-wrap text-xs">{education.guide}</div></div>}
            {education.examples && <div className="mt-3"><h4 className="font-sans font-medium">Examples:</h4><div className="whitespace-pre-wrap text-xs">{education.examples}</div></div>}
            {education.caseStudy && <div className="mt-3"><h4 className="font-sans font-medium">Case Study:</h4><div className="whitespace-pre-wrap text-xs">{education.caseStudy}</div></div>}
            
            {education.video && (
              <div className="mt-4">
                <h4 className="font-sans font-medium">Video Tutorial:</h4>
                <div className="aspect-video rounded-md overflow-hidden shadow-sm border border-brand-border-light dark:border-brand-border-dark mt-1">
                  <iframe
                    src={education.video}
                    title={`${tool.name} Tutorial`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ToolPageLayout;
