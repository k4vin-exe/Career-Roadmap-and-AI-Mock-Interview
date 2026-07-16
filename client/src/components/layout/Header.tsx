import { Link } from 'react-router-dom';
import { BrainCircuit } from 'lucide-react';

export function Header() {
  return (
    <header className="w-full border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-text-primary hover:text-accent-light transition-colors group">
          <div className="p-1.5 rounded-lg bg-accent-glow group-hover:bg-accent/20 transition-colors">
            <BrainCircuit size={22} className="text-accent" />
          </div>
          <span className="font-bold text-lg tracking-tight">AI Mock Interview</span>
        </Link>
        
        <nav className="hidden sm:flex items-center gap-6 text-sm font-medium">
          <a href="#" className="text-text-secondary hover:text-text-primary transition-colors">Features</a>
          <a href="#" className="text-text-secondary hover:text-text-primary transition-colors">How it Works</a>
        </nav>
      </div>
    </header>
  );
}
