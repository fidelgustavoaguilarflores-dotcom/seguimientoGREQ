// Reusable multi-select dropdown with checkbox list.
// Manages open/close state and closes on outside click.
import React, { useState, useRef, useEffect } from 'react';

interface MultiSelectProps {
    label: string;
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({ label, options, selected, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Toggle an option in the selected list.
    const toggleOption = (option: string) => {
        if (selected.includes(option)) {
            onChange(selected.filter(s => s !== option));
        } else {
            onChange([...selected, option]);
        }
    };

    return (
        <div className="relative" ref={containerRef} style={{ position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '0.85em', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                {label}
            </label>
            <div
                className="form-select"
                onClick={() => setIsOpen(!isOpen)}
                style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {selected.length === 0 ? 'Todos' : `${selected.length} seleccionados`}
                </span>
                <span style={{ fontSize: '0.8em', marginLeft: '8px' }}>▼</span>
            </div>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 50,
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    maxHeight: '250px',
                    overflowY: 'auto',
                    marginTop: '4px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                }}>
                    {options.map(opt => (
                        <div
                            key={opt}
                            onClick={() => toggleOption(opt)}
                            style={{
                                padding: '8px 12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                backgroundColor: selected.includes(opt) ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                color: selected.includes(opt) ? 'var(--primary)' : 'var(--text-primary)'
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={selected.includes(opt)}
                                readOnly
                                style={{ marginRight: '8px' }}
                            />
                            <span style={{ fontSize: '0.9em' }}>{opt}</span>
                        </div>
                    ))}
                    {options.length === 0 && (
                        <div style={{ padding: '8px 12px', color: 'var(--text-muted)', fontSize: '0.9em' }}>
                            Sin opciones
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
