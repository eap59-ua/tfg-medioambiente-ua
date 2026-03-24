import React from 'react';
import { Leaf, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-primary-400" />
            <span className="text-sm">EcoAlerta © 2026 — TFG Universidad de Alicante</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a href="https://github.com/eap59-ua/tfg-medioambiente-ua" target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-1 hover:text-white transition-colors">
              <Github className="w-4 h-4" /> GitHub
            </a>
            <span>Erardo Aldana Pessoa</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
