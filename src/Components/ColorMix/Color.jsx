import React, { useState, useEffect } from 'react';
import logoImage from '../../assets/images/image.jpg';

// Color Mixing Utility with Weighted Proportions
const mixColorsWithWeights = (colors, weights) => {
  if (colors.length === 0) return '#FFFFFF';
  
  // Validate inputs
  const validColors = colors.filter(color => /^#[0-9A-Fa-f]{6}$/.test(color));
  if (validColors.length === 0) return '#FFFFFF';
  
  // Convert hex to RGB with validation
  const rgbColors = validColors.map(color => {
    const hex = color.replace('#', '');
    return {
      r: parseInt(hex.substr(0, 2), 16),
      g: parseInt(hex.substr(2, 2), 16),
      b: parseInt(hex.substr(4, 2), 16)
    };
  });
  
  // Filter out colors with zero or negative weights
  const validWeights = weights.filter(weight => weight > 0);
  const validColorIndices = weights.map((weight, index) => weight > 0 ? index : -1).filter(index => index !== -1);
  
  if (validWeights.length === 0) {
    return '#FFFFFF'; // Return white if no valid weights
  }
  
  let totalWeight = 0;
  let r = 0, g = 0, b = 0;
  
  // Calculate weighted average only for colors with positive weights
  validColorIndices.forEach((colorIndex, weightIndex) => {
    const weight = validWeights[weightIndex];
    totalWeight += weight;
    
    r += rgbColors[colorIndex].r * weight;
    g += rgbColors[colorIndex].g * weight;
    b += rgbColors[colorIndex].b * weight;
  });
  
  // Normalize by total weight
  if (totalWeight > 0) {
    r = Math.round(r / totalWeight);
    g = Math.round(g / totalWeight);
    b = Math.round(b / totalWeight);
  } else {
    return '#FFFFFF';
  }
  
  // Ensure values are within valid range (0-255)
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  
  // Convert back to hex with proper padding
  const toHex = (c) => {
    const hex = Math.round(c).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// Alternative: Subtractive Color Mixing (more accurate for paint/ink)
const mixColorsSubtractive = (colors, weights) => {
  if (colors.length === 0) return '#FFFFFF';
  
  // Validate inputs
  const validColors = colors.filter(color => /^#[0-9A-Fa-f]{6}$/.test(color));
  if (validColors.length === 0) return '#FFFFFF';
  
  // Filter out colors with zero or negative weights
  const validWeights = weights.filter(weight => weight > 0);
  const validColorIndices = weights.map((weight, index) => weight > 0 ? index : -1).filter(index => index !== -1);
  
  if (validWeights.length === 0) {
    return '#FFFFFF';
  }
  
  // Convert to CMYK-like subtractive mixing
  let totalWeight = 0;
  let r = 255, g = 255, b = 255; // Start with white
  
  validColorIndices.forEach((colorIndex, weightIndex) => {
    const weight = validWeights[weightIndex];
    totalWeight += weight;
    
    const hex = validColors[colorIndex].replace('#', '');
    const colorR = parseInt(hex.substr(0, 2), 16);
    const colorG = parseInt(hex.substr(2, 2), 16);
    const colorB = parseInt(hex.substr(4, 2), 16);
    
    // Subtractive mixing: multiply colors (like paint mixing)
    const weightRatio = weight / totalWeight;
    r = Math.round(r * (1 - weightRatio) + colorR * weightRatio);
    g = Math.round(g * (1 - weightRatio) + colorG * weightRatio);
    b = Math.round(b * (1 - weightRatio) + colorB * weightRatio);
  });
  
  // Ensure values are within valid range
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  
  const toHex = (c) => {
    const hex = Math.round(c).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// Get color name from hex
const getColorName = (hex) => {
  const colorMap = {
    '#FF0000': 'Red', '#FF4500': 'Orange Red', '#FF8C00': 'Dark Orange', '#FFD700': 'Gold',
    '#FFFF00': 'Yellow', '#ADFF2F': 'Green Yellow', '#00FF00': 'Lime', '#00FA9A': 'Medium Spring Green',
    '#00FFFF': 'Cyan', '#00BFFF': 'Deep Sky Blue', '#0000FF': 'Blue', '#8A2BE2': 'Blue Violet',
    '#FF00FF': 'Magenta', '#FF1493': 'Deep Pink', '#FF69B4': 'Hot Pink', '#FFB6C1': 'Light Pink',
    '#FFE4E1': 'Misty Rose', '#F5F5DC': 'Beige', '#DEB887': 'Burly Wood', '#D2691E': 'Chocolate',
    '#8B4513': 'Saddle Brown', '#654321': 'Dark Brown', '#2F4F4F': 'Dark Slate Gray', '#000000': 'Black',
    '#FFFFFF': 'White', '#C0C0C0': 'Silver', '#808080': 'Gray', '#404040': 'Dark Gray',
    '#202020': 'Very Dark Gray', '#101010': 'Almost Black', '#080808': 'Near Black', '#2563EB': 'Blue',
    '#EF4444': 'Red', '#22C55E': 'Green'
  };
  return colorMap[hex] || 'Custom';
};

export default function Color() {
  const [selectedColors, setSelectedColors] = useState([
    '#2563EB', '#EF4444', '#22C55E', '#000000'
  ]);
  const [colorWeights, setColorWeights] = useState([0, 0, 0, 0]); // in grams
  const [finalMixedColor, setFinalMixedColor] = useState('#FFFFFF');
  const [showColorPicker, setShowColorPicker] = useState(null);
  const [showFinalColor, setShowFinalColor] = useState(false);
  const [copiedColor, setCopiedColor] = useState('');

  // Calculate final color when weights change
  useEffect(() => {
    const finalColor = mixColorsWithWeights(selectedColors, colorWeights);
    setFinalMixedColor(finalColor);
  }, [selectedColors, colorWeights]);

  const generateColors = () => {
    if (colorWeights.some(weight => weight > 0)) {
      setShowFinalColor(true);
    }
  };

  const handleColorChange = (color, index) => {
    const updatedColors = [...selectedColors];
    updatedColors[index] = color;
    setSelectedColors(updatedColors);
    setShowColorPicker(null);
  };

  const handleWeightChange = (index, value) => {
    const updatedWeights = [...colorWeights];
    updatedWeights[index] = parseFloat(value) || 0;
    setColorWeights(updatedWeights);
  };

  const openColorPicker = (index) => {
    setShowColorPicker(index);
  };

  const getTotalWeight = () => {
    return colorWeights.reduce((sum, weight) => sum + weight, 0);
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(type);
    setTimeout(() => setCopiedColor(''), 2000);
  };

  const resetAll = () => {
    setColorWeights([0, 0, 0, 0]);
    setShowFinalColor(false);
  };

     return (
     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-2 sm:p-4">
       <div className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                          {/* Header */}
         <div className="text-center">
           <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
             <img 
               src={logoImage} 
               alt="Color Mixer Logo" 
               className="w-full h-full object-cover rounded-full shadow-lg"
             />
           </div>
           <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
             Color Mixer
           </h1>
           <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Mix colors with precision using weights</p>
         </div>

                 {/* Select Colors Section */}
         <div className="space-y-3 sm:space-y-4">
           <div className="flex items-center justify-between">
             <h2 className="text-base sm:text-lg font-semibold text-gray-800">Color Selection</h2>
             <button
               onClick={resetAll}
               className="text-xs text-gray-500 hover:text-red-500 transition-colors px-2 py-1 rounded"
             >
               Reset All
             </button>
           </div>
          
                     <div className="space-y-3 sm:space-y-4">
             {selectedColors.map((color, index) => (
               <div key={index} className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:bg-gray-100 transition-colors">
                 <div className="flex items-center gap-3 sm:gap-4">
                   <div
                     onClick={() => openColorPicker(index)}
                     className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl cursor-pointer border-2 sm:border-4 border-white shadow-lg hover:scale-105 transition-transform flex-shrink-0"
                     style={{ backgroundColor: color }}
                   ></div>
                   <div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
                     <div className="flex items-center justify-between">
                       <span className="font-medium text-gray-800 text-sm sm:text-base truncate">{getColorName(color)}</span>
                       <button
                         onClick={() => copyToClipboard(color, `color-${index}`)}
                         className="text-xs text-gray-500 hover:text-blue-600 transition-colors px-2 py-1 rounded flex-shrink-0"
                       >
                         {copiedColor === `color-${index}` ? 'Copied!' : 'Copy'}
                       </button>
                     </div>
                     <div className="flex items-center gap-2 sm:gap-3">
                       <input
                         type="number"
                         step="0.1"
                         value={colorWeights[index]}
                         onChange={(e) => handleWeightChange(index, e.target.value)}
                         placeholder="0"
                         className="flex-1 px-2 sm:px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       />
                       <span className="text-xs sm:text-sm text-gray-600 font-medium flex-shrink-0">grams</span>
                     </div>
                     <div className="flex items-center gap-2">
                       <span className="text-xs text-gray-500 flex-shrink-0">Code:</span>
                       <span className="font-mono text-xs font-bold text-gray-700 truncate">{color}</span>
                     </div>
                   </div>
                 </div>
               </div>
             ))}
           </div>
          
                     {/* Total Weight Display */}
           <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg sm:rounded-xl p-3 sm:p-4 text-white">
             <div className="flex justify-between items-center">
               <span className="font-medium text-sm sm:text-base">Total Mixture Weight</span>
               <span className="text-xl sm:text-2xl font-bold">{getTotalWeight().toFixed(1)}g</span>
             </div>
           </div>
        </div>

                 {/* Final Mixed Color Display */}
         {showFinalColor && getTotalWeight() > 0 && (
           <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-green-200">
             <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 text-center">Final Mixed Color</h3>
             <div className="flex flex-col items-center gap-3 sm:gap-4">
               <div
                 className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-white shadow-lg"
                 style={{ backgroundColor: finalMixedColor }}
               ></div>
               <div className="text-center">
                 <p className="text-xs sm:text-sm text-gray-600 mb-1">Color Code</p>
                 <div className="flex items-center gap-2 flex-wrap justify-center">
                   <span className="font-mono text-sm sm:text-lg font-bold text-gray-800 break-all">{finalMixedColor}</span>
                   <button
                     onClick={() => copyToClipboard(finalMixedColor, 'final')}
                     className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 transition-colors px-2 py-1 rounded"
                   >
                     {copiedColor === 'final' ? '✓' : 'Copy'}
                   </button>
                 </div>
               </div>
             </div>
           </div>
         )}

                 {/* Generate Button */}
         <button
           onClick={generateColors}
           disabled={getTotalWeight() === 0}
           className={`w-full py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg transition-all transform ${
             getTotalWeight() > 0 
               ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:scale-105 shadow-lg' 
               : 'bg-gray-100 text-gray-400 cursor-not-allowed'
           }`}
         >
           {getTotalWeight() > 0 ? 'Generate Mixed Color' : 'Add Color Weights First'}
         </button>

                 {/* Copyright Footer */}
         <div className="text-center pt-4 sm:pt-6 border-t border-gray-200">
           <p className="text-xs sm:text-sm text-gray-600 font-medium">
             © 2025 Ahmed Raza Manjothi. All rights reserved.
           </p>
           <p className="text-xs text-gray-500 mt-1">
             Professional Color Mixing Tool
           </p>
         </div>

                 {/* Color Picker Modal */}
         {showColorPicker !== null && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
             <div className="bg-white rounded-lg sm:rounded-2xl p-4 sm:p-6 w-full max-w-xs sm:max-w-sm">
               <div className="flex items-center justify-between mb-3 sm:mb-4">
                 <h3 className="text-base sm:text-lg font-semibold">Choose Color</h3>
                 <button
                   onClick={() => setShowColorPicker(null)}
                   className="text-gray-500 hover:text-gray-700 p-1"
                 >
                   <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                   </svg>
                 </button>
               </div>
               <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 sm:gap-3 mb-3 sm:mb-4">
                 {[
                   '#FF0000', '#FF4500', '#FF8C00', '#FFD700', '#FFFF00', '#ADFF2F', '#00FF00', '#00FA9A',
                   '#00FFFF', '#00BFFF', '#0000FF', '#8A2BE2', '#FF00FF', '#FF1493', '#FF69B4', '#FFB6C1',
                   '#FFE4E1', '#F5F5DC', '#DEB887', '#D2691E', '#8B4513', '#654321', '#2F4F4F', '#000000',
                   '#FFFFFF', '#C0C0C0', '#808080', '#404040', '#202020', '#101010', '#080808', '#000000'
                 ].map((color, index) => (
                   <div
                     key={index}
                     onClick={() => handleColorChange(color, showColorPicker)}
                     className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg cursor-pointer border-2 border-gray-300 hover:border-blue-500 hover:scale-110 transition-all shadow-sm"
                     style={{ backgroundColor: color }}
                   ></div>
                 ))}
               </div>
             </div>
           </div>
         )}
      </div>
    </div>
  );
}
