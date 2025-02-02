import { useState } from 'react';

interface PropertyTypeSwitchProps {
  onSwitch: (type: 'residential' | 'commercial') => void;
}

export default function PropertyTypeSwitch({ onSwitch }: PropertyTypeSwitchProps) {
  const [selected, setSelected] = useState<'residential' | 'commercial'>('residential');
  
  const handleSwitch = (type: 'residential' | 'commercial') => {
    setSelected(type);
    onSwitch(type);
  };

  return (
    <div className="flex gap-8">
      <button
        onClick={() => handleSwitch('residential')}
        className={`text-lg ${
          selected === 'residential' ? 'text-[#E55C5C]' : 'text-gray-600'
        }`}
      >
        Residential
      </button>
      <button
        onClick={() => handleSwitch('commercial')}
        className={`text-lg ${
          selected === 'commercial' ? 'text-[#E55C5C]' : 'text-gray-600'
        }`}
      >
        Commercial
      </button>
    </div>
  );
} 