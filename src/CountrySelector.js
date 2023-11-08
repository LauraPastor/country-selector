import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const CountrySelector = () => {
  const [inputValue, setInputValue] = useState("");
  const [countries, setCountries] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const inputRef = useRef(null);

  useEffect(() => {
    const handleDocumentClick = (event) => {
      const inputContainer = document.querySelector(".country-selector");
      const searchResults = document.querySelector(".search-results");

      if (
        !inputContainer.contains(event.target) &&
        !searchResults.contains(event.target)
      ) {
        searchResults.style.display = "none";
      }
    };

    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get("https://restcountries.com/v3.1/all");
        setCountries(response.data);
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };

    fetchCountries();

    const filterCountries = () => {
      const filteredResults = countries
        .map((country) => {
          const matchIndex = country.name.common
            .toLowerCase()
            .indexOf(inputValue.toLowerCase());
          return {
            country,
            rank: matchIndex === -1 ? Infinity : matchIndex,
            highlightedName:
              matchIndex !== -1
                ? `${country.name.common.substring(
                    0,
                    matchIndex
                  )}<b>${country.name.common.substring(
                    matchIndex,
                    matchIndex + inputValue.length
                  )}</b>${country.name.common.substring(
                    matchIndex + inputValue.length
                  )}`
                : country.name.common,
          };
        })
        .filter((result) => result.rank !== Infinity)
        .sort((a, b) => a.rank - b.rank);

      setSearchResults(filteredResults);
      setHoveredIndex(null);
    };

    filterCountries();
  }, [inputValue, countries]);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleInputClick = () => {
    document.querySelector(".search-results").style.display = "block";
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      if (searchResults.length > 0) {
        handleSelection(searchResults[hoveredIndex || 0].country);
      }
    } else if (event.key === "ArrowUp" && hoveredIndex !== null) {
      setHoveredIndex((prevIndex) =>
        prevIndex === null ? null : Math.max(prevIndex - 1, 0)
      );
    } else if (event.key === "ArrowDown") {
      setHoveredIndex((prevIndex) =>
        prevIndex === null
          ? 0
          : Math.min((prevIndex || 0) + 1, searchResults.length - 1)
      );
    }
  };

  const handleSelection = (country) => {
    setSelectedCountry(country);
    setInputValue(country.name.common);
    document.querySelector(".search-results").style.display = "none";
  };

  const handleHover = (index) => {
    setHoveredIndex(index);
  };

  return (
    <div className="country-selector">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onClick={handleInputClick}
        placeholder="Type to search for a country"
      />
      <div className="search-results">
        {searchResults.map((result, index) => (
          <div
            key={index}
            className={`result-item ${index === hoveredIndex ? "hovered" : ""}`}
            onClick={() => handleSelection(result.country)}
            onMouseEnter={() => handleHover(index)}
          >
            <div dangerouslySetInnerHTML={{ __html: result.highlightedName }} />
          </div>
        ))}
      </div>
      {selectedCountry && (
        <p>Selected Country: {selectedCountry.name.common}</p>
      )}
    </div>
  );
};

export default CountrySelector;
