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
    const fetchCountries = async () => {
      try {
        const response = await axios.get("https://restcountries.com/v3.1/all");
        setCountries(response.data);
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };

    fetchCountries();
  }, []);

  useEffect(() => {
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

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleInputClick = () => {
    // Show the search results when the input is clicked
    document.querySelector(".search-results").style.display = "block";

    // Add a click event listener to the document
    document.addEventListener("click", handleDocumentClick);
  };

  const handleDocumentClick = (event) => {
    // Check if the click occurred outside the input and search results
    const inputContainer = document.querySelector(".country-selector");
    const searchResultsContainer = document.querySelector(".search-results");

    if (
      !inputContainer.contains(event.target) &&
      !searchResultsContainer.contains(event.target)
    ) {
      // Hide the search results when clicking outside the input and search results
      searchResultsContainer.style.display = "none";

      // Remove the click event listener from the document
      document.removeEventListener("click", handleDocumentClick);
    }
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
      scrollResultsIntoView(hoveredIndex - 1);
    } else if (event.key === "ArrowDown") {
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
        behavior: "smooth",
        block: "nearest",
      });
    }
  };

  const handleSelection = (country) => {
    setSelectedCountry(country);
    setInputValue(country.name.common);

    // Hide the search results after selecting a country
    document.querySelector(".search-results").style.display = "none";

    // Remove the click event listener from the document
    document.removeEventListener("click", handleDocumentClick);
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
      <div className="search-results" style={{ overflowY: "scroll" }}>
        {searchResults.map((result, index) => (
          <div
            key={index}
            className={`result-item ${index === hoveredIndex ? "hovered" : ""}`}
            onClick={() => handleSelection(result.country)}
            onMouseEnter={() => handleHover(index)}
            dangerouslySetInnerHTML={{ __html: result.highlightedName }}
          />
        ))}
      </div>
      {selectedCountry && (
        <p>
          Selected Country: <h1>{selectedCountry.name.common}</h1>
        </p>
      )}
    </div>
  );
};

export default CountrySelector;
