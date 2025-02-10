import React, { useState, useRef, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';

const COMMAND_SUGGESTIONS = [
  { command: '/check airdrops', description: 'Check available airdrops' },
  { command: '/check liquidity', description: 'Check liquidity positions' },
  { command: '/market', description: 'View market trends based on tweets' },
  { command: '/help', description: 'Show available commands' }
];

// Function to get latest blob ID from transactions
async function getLatestBlobId() {
  try {
    const response = await fetch('/api/get-latest-blob');
    const data = await response.json();
    return data.blobId;
  } catch (error) {
    console.error('Error fetching latest blob ID:', error);
    return null;
  }
}

const TaskbarTerminal = ({ isOpen, onClose, onSubmit, onChange, theme }) => {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const inputRef = useRef(null);

  const terminalSpring = useSpring({
    width: isOpen ? '400px' : '0px',
    opacity: isOpen ? 1 : 0,
    config: {
      tension: 220,
      friction: 24
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    let commandToSubmit = input;

    // If a suggestion is selected, use that instead of the input
    if (showSuggestions && selectedSuggestionIndex >= 0) {
      commandToSubmit = filteredSuggestions[selectedSuggestionIndex].command;
    }

    // Handle /market command
    if (commandToSubmit === '/market') {
      const blobId = await getLatestBlobId();
      if (blobId) {
        onSubmit(`/market ${blobId}`);
      } else {
        onSubmit('Error: Could not fetch market analysis');
      }
    } else {
      onSubmit(commandToSubmit);
    }
    
    setInput('');
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setInput(value);
    onChange?.(value);

    // Show suggestions when typing '/'
    if (value.startsWith('/')) {
      const filtered = COMMAND_SUGGESTIONS.filter(suggestion =>
        suggestion.command.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
      setSelectedSuggestionIndex(filtered.length > 0 ? 0 : -1);
    } else {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  const handleSuggestionClick = (command) => {
    setInput(command);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;

    switch (e.code) {
      case 'ArrowUp':
      case 'KeyW':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev <= 0 ? filteredSuggestions.length - 1 : prev - 1
        );
        break;
      case 'ArrowDown':
      case 'KeyS':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev >= filteredSuggestions.length - 1 ? 0 : prev + 1
        );
        break;
      case 'Enter':
      case 'Space':
        if (selectedSuggestionIndex >= 0) {
          e.preventDefault();
          handleSuggestionClick(filteredSuggestions[selectedSuggestionIndex].command);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <animated.div style={terminalSpring} className="overflow-visible relative">
      <form onSubmit={handleSubmit} className="h-full">
        <div 
          className="flex items-center gap-2 rounded-lg px-3 py-1.5"
          style={{ 
            background: theme ? `${theme.colors.secondary}80` : 'transparent',
            borderColor: theme ? theme.colors.border : 'transparent',
            boxShadow: theme.colors.effects?.glow
          }}
        >
          <span style={{ color: theme ? theme.colors?.text?.secondary || theme.colors.text : 'inherit' }}>❯</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm outline-none min-w-[300px]"
            style={{ 
              color: theme ? theme.colors?.text?.primary || theme.colors.text : 'inherit',
              '::placeholder': { color: theme ? theme.colors?.text?.secondary || theme.colors.text : 'inherit' }
            }}
            placeholder="Type a command or / for suggestions..."
          />
        </div>

        {/* Command suggestions */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div 
            className="absolute bottom-full left-0 w-full mb-2 rounded-lg overflow-hidden"
            style={{ 
              background: theme ? `${theme.colors.secondary}E6` : 'rgba(0,0,0,0.9)',
              borderColor: theme ? theme.colors.border : 'transparent',
              boxShadow: theme.colors.effects?.glow
            }}
          >
            {filteredSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`px-4 py-2 cursor-pointer hover:bg-black/20 flex justify-between items-center ${
                  index === selectedSuggestionIndex ? 'bg-black/30' : ''
                }`}
                onClick={() => handleSuggestionClick(suggestion.command)}
                style={{ 
                  color: theme ? theme.colors?.text?.primary || theme.colors.text : 'inherit',
                  outline: index === selectedSuggestionIndex ? `1px solid ${theme.colors.accent}` : 'none',
                  boxShadow: index === selectedSuggestionIndex ? `0 0 10px ${theme.colors.accent}40` : 'none'
                }}
              >
                <span className="font-mono">{suggestion.command}</span>
                <span className="text-sm opacity-60">{suggestion.description}</span>
              </div>
            ))}
          </div>
        )}
      </form>
    </animated.div>
  );
};

export default TaskbarTerminal; 