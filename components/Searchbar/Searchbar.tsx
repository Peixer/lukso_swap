import React, { useState, ChangeEvent, MouseEvent} from 'react';
import styles from './Searchbar.module.css'; 

export interface Suggestion{
    name: string;
    address: string;
    profileImageUrl: string;
    backgroundImageUrl: string;
}

interface SearchBarProps {
  onSearch: (value: string) => void;
  suggestions: Suggestion[];
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, suggestions }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
  
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchTerm(value);
      onSearch(value);
      setShowSuggestions(true);
    };
  
    const handleSuggestionClick = (e: MouseEvent, suggestion: Suggestion) => {
      setSearchTerm(suggestion.address);
      onSearch(suggestion.address);
      setShowSuggestions(false);
    };

  return (
    <div className={styles.searchBar}>
      <input
        type="text"
        placeholder="Search Lukso addresses"
        value={searchTerm}
        onChange={handleInputChange}
        className={styles.searchInput}
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className={styles.suggestionList}>
          {suggestions.map((suggestion, index) => (
            <li key={index} onClick={(e) => handleSuggestionClick(e, suggestion)}>
              <span className={styles.name}>@{suggestion.name}</span>#{suggestion.address.substr(2, 4)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
