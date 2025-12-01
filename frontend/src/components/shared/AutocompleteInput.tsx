import React, { useState, useRef, useEffect } from 'react';

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[] | readonly { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  label?: string;
  required?: boolean;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  value,
  onChange,
  options,
  placeholder = 'SELECCIONE O ESCRIBA...',
  className = '',
  disabled = false,
  label,
  required = false
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Normalizar opciones a formato string[]
  const normalizedOptions = options.map(opt =>
    typeof opt === 'string' ? opt : opt.label
  );

  useEffect(() => {
    // Filtrar opciones basadas en el valor actual
    if (value) {
      const filtered = normalizedOptions.filter(option =>
        option.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(normalizedOptions);
    }
  }, [value, options]);

  useEffect(() => {
    // Cerrar dropdown al hacer click fuera
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowDropdown(true);
  };

  const handleSelectOption = (option: string, index: number) => {
    const selectedValue = typeof options[index] === 'string'
      ? option
      : (options[index] as { value: string; label: string }).value;

    onChange(selectedValue);
    setShowDropdown(false);
  };

  const handleFocus = () => {
    setShowDropdown(true);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
        } ${className}`}
      />

      {showDropdown && filteredOptions.length > 0 && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredOptions.map((option, index) => {
            const originalIndex = normalizedOptions.indexOf(option);
            return (
              <div
                key={index}
                onClick={() => handleSelectOption(option, originalIndex)}
                className="px-3 py-2 cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                {option}
              </div>
            );
          })}
        </div>
      )}

      {showDropdown && filteredOptions.length === 0 && value && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="px-3 py-2 text-gray-500 text-sm">
            NO SE ENCONTRARON COINCIDENCIAS. PUEDE ESCRIBIR UN VALOR PERSONALIZADO.
          </div>
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;
