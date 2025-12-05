
import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface HeroProps {
  onSearch: (query: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className="relative bg-white overflow-hidden py-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
      {/* Abstract Cross Background Image */}
      {/* 
         NOTE: To use your local image:
         1. Place your 'cross.png' file in the public folder.
         2. Change the src below to: src="/cross.png"
      */}
      <div className="absolute top-0 right-0 -mr-12 -mt-12 md:-mr-20 md:-mt-20 opacity-[0.03] pointer-events-none select-none">
         <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Cross_Bottony_Heraldry.svg/1024px-Cross_Bottony_Heraldry.svg.png"
            alt="Cross Background" 
            className="w-[300px] h-[300px] md:w-[450px] md:h-[450px] lg:w-[600px] lg:h-[600px] object-contain"
         />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <p className="text-slate-500 italic mb-6 font-medium">
          Matthew 16:18 <br/>
          "Upon this rock I will build my church, and the gates of hell shall not prevail against it."
        </p>
        
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-8 leading-tight">
          Find Ethiopian Orthodox Churches <br className="hidden md:block"/> in Your Community
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
          Connect with your faith community. Discover churches, meet clergy, attend events, and support through donations.
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto relative flex shadow-lg rounded-lg">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-4 rounded-l-lg border-gray-300 focus:ring-slate-500 focus:border-slate-500 sm:text-sm md:text-base bg-white"
              placeholder="Search by city, zip code, or church name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center px-6 py-4 border border-transparent text-base font-medium rounded-r-lg shadow-sm text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
          >
            Search
          </button>
        </form>
      </div>
    </div>
  );
};
