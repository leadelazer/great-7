import React from 'react';
import { Link } from 'react-router-dom';
import { TOOLS_CONFIG } from '../constants';
import { ArrowRight } from 'lucide-react';

const DashboardPage: React.FC = () => {
  return (
    <div className="container mx-auto">
      <header className="mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-sans font-semibold text-brand-text-light dark:text-brand-text-dark mb-2">The Great 7</h1>
        <p className="text-base font-mono text-brand-text-muted-light dark:text-brand-text-muted-dark max-w-xl mx-auto">
          Master 7 Essential Tools for Decision-Making, Planning, and Prioritization
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {TOOLS_CONFIG.map((tool) => (
          <Link
            key={tool.key}
            to={tool.path}
            className="block p-5 bg-brand-card-light dark:bg-brand-card-dark rounded-lg border border-brand-border-light dark:border-brand-border-dark shadow-sm hover:shadow-md transform hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="flex items-center mb-3">
              <tool.icon className="h-8 w-8 text-brand-text-muted-light dark:text-brand-text-muted-dark mr-3 transition-colors duration-300 group-hover:text-brand-accent" />
              <h2 className="text-xl font-sans font-medium text-brand-text-light dark:text-brand-text-dark transition-colors duration-300 group-hover:text-brand-accent">{tool.name}</h2>
            </div>
            <p className="text-brand-text-muted-light dark:text-brand-text-muted-dark mb-4 text-xs font-mono leading-relaxed">{tool.description}</p>
            <div className="flex items-center text-xs font-mono text-brand-text-muted-light dark:text-brand-text-muted-dark font-medium transition-colors duration-300 group-hover:text-brand-accent">
              Use Tool <ArrowRight size={14} className="ml-1 transition-transform duration-300 group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>

      <section className="mt-12 p-6 bg-brand-card-light dark:bg-brand-card-dark rounded-lg border border-brand-border-light dark:border-brand-border-dark shadow-sm">
        <h2 className="text-2xl font-sans font-medium text-brand-text-light dark:text-brand-text-dark mb-4 text-center">Why These Tools?</h2>
        <p className="text-brand-text-muted-light dark:text-brand-text-muted-dark leading-relaxed text-center max-w-2xl mx-auto text-sm font-mono">
          In a world of choices, clarity is key. "The Great 7" offers time-tested methods, simplified for modern use, to bring focus and confidence to your actions.
        </p>
      </section>
    </div>
  );
};

export default DashboardPage;