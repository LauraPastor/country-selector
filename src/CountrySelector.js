import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const CountrySelector = () => {
  const [inputValue, setInputValue] = useState('');
  const [countries, setCountries] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const inputRef = useRef(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get(
          'https://restcountries.com/v3.1/all?fields=name,flags'
        );
        setCountries(response.data);
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };
    fetchCountries();
  }, []);
  useEffect(() => {
    // In summary, this `useEffect` is responsible for updating the search results based on user input (`inputValue`) and the list of countries (`countries`). It creates an array of filtered and sorted result objects, updates the state with these results, and resets the hovered index. The effect runs whenever `inputValue` or `countries` change.
    const filterCountries = () => {
      const filteredResults = countries
        .map((country) => {
          const countryName = String(country.name.common);
          const matchIndex = countryName
            .toLowerCase()
            .indexOf(inputValue.toLowerCase());
          return {
            country,
            rank: matchIndex === -1 ? Infinity : matchIndex,
            highlightedName:
              // Represents the position where the input value is found in the country name.
              matchIndex !== -1
                ? `${countryName.substring(
                    0,
                    matchIndex
                  )}<b>${countryName.substring(
                    matchIndex,
                    matchIndex + inputValue.length
                  )}</b>${countryName.substring(
                    matchIndex + inputValue.length
                  )}`
                : countryName,
          };
        })
        .filter((result) => result.rank !== Infinity)
        .sort((a, b) => a.rank - b.rank);

      setSearchResults(filteredResults);
      setHoveredIndex(null);
    };

    filterCountries();
  }, [inputValue, countries]);
  // - Specifies the dependency array for the `useEffect`. This means the effect will re-run if `inputValue` or `countries` change.

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleInputClick = () => {
    // Show the search results when the input is clicked
    document.querySelector('.search-results').style.display = 'block';

    // Add a click event listener to the document
    document.addEventListener('click', handleDocumentClick);
  };

  const handleDocumentClick = (event) => {
    // Check if the click occurred outside the input and search results
    const inputContainer = document.querySelector('.country-selector');
    const searchResultsContainer = document.querySelector('.search-results');

    if (
      !inputContainer.contains(event.target) &&
      !searchResultsContainer.contains(event.target)
    ) {
      // Hide the search results when clicking outside the input and search results
      searchResultsContainer.style.display = 'none';

      // Remove the click event listener from the document
      document.removeEventListener('click', handleDocumentClick);
    }
  };
  // Could be improved by when clicking input result this get selected, then user can deleted and search for new one.

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      if (searchResults.length > 0) {
        handleSelection(searchResults[hoveredIndex || 0].country);
      }
    } else if (event.key === 'ArrowUp' && hoveredIndex !== null) {
      setHoveredIndex((prevIndex) =>
        prevIndex === null ? null : Math.max(prevIndex - 1, 0)
      );
      scrollResultsIntoView(hoveredIndex - 1);
    } else if (event.key === 'ArrowDown') {
      setHoveredIndex((prevIndex) =>
        prevIndex === null
          ? 0
          : Math.min((prevIndex || 0) + 1, searchResults.length - 1)
      );
      scrollResultsIntoView(hoveredIndex + 1);
    }
  };

  const scrollResultsIntoView = (index) => {
    const resultItem = document.querySelector(
      `.search-results .result-item:nth-child(${index + 1})`
    );

    if (resultItem) {
      // Scroll the selected result into view
      resultItem.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  };

  const handleSelection = (country) => {
    setSelectedCountry(country);
    setInputValue(country.name.common);

    // Hide the search results after selecting a country
    document.querySelector('.search-results').style.display = 'none';

    // Remove the click event listener from the document
    document.removeEventListener('click', handleDocumentClick);
  };

  const handleHover = (index) => {
    setHoveredIndex(index);
  };
  return (
    <div className='country-selector'>
      <input
        name=''
        ref={inputRef}
        type='text'
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onClick={handleInputClick}
        placeholder='Type to search for a country'
      />
      <div className='search-results'>
        {searchResults.map((result, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src={result.country.flags.png}
              alt={result.country.flags.alt || result.country.name.common}
              style={{
                width: '20px',
                height: '15px',
                marginRight: '8px',
                verticalAlign: 'middle',
                borderRadius: '2px',
              }}
            />
            <div
              className={`result-item ${
                index === hoveredIndex ? 'hovered' : ''
              }`}
              onClick={() => handleSelection(result.country)}
              onMouseEnter={() => handleHover(index)}
              dangerouslySetInnerHTML={{ __html: result.highlightedName }}
            />
          </div>
        ))}
      </div>
      {selectedCountry && (
        <div className='result-country'>
          Selected Country: <h1>{selectedCountry.name.common}</h1>
          <img
            src={selectedCountry.flags.png}
            alt={selectedCountry.flags.alt || selectedCountry.name.common}
            className='country-flag-bg'
          />
        </div>
      )}
    </div>
  );
};

export default CountrySelector;

// 1.`handleInputClick`:
// -Adds a click event listener to the document when the input is clicked.
// -Shows the search results.

// 2.`handleDocumentClick`:
// -Checks if the click occurred outside the input and search results.
// -Hides the search results when clicking outside and removes the click event listener from the document.

// 3.`handleSelection`:
// -Hides the search results after selecting a country.
// -Removes the click event listener from the document.
