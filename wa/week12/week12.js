const API_KEY = 'f74fc534'; 
let resultDiv;
let movieInput;
let yearFrom, yearTo, ratingFilter, genreFilter, typeFilter;

// Popular movies will be loaded from JSON file
let popularMovies = [];

// Load movies from JSON file
async function loadMovies() {
    try {
        const response = await fetch('movies.json');
        const data = await response.json();
        popularMovies = data.movies;
        console.log(`Loaded ${popularMovies.length} movies from database`);
    } catch (error) {
        console.error('Error loading movies:', error);
        // Fallback to a small default list if JSON fails to load
        popularMovies = [
            'The Shawshank Redemption', 'The Godfather', 'The Dark Knight', 
            'Pulp Fiction', 'Forrest Gump', 'Inception', 'Fight Club',
            'The Matrix', 'Goodfellas', 'Interstellar'
        ];
    }
}

// Populate year dropdowns
function populateYearDropdowns() {
    const currentYear = 2025;
    const startYear = 1895; // Early cinema era
    
    // Populate yearFrom dropdown (newest to oldest)
    for (let year = currentYear; year >= startYear; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFrom.appendChild(option);
    }
    
    // Populate yearTo dropdown (newest to oldest)
    for (let year = currentYear; year >= startYear; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearTo.appendChild(option);
    }
}

// Wait for DOM to load before accessing elements
document.addEventListener('DOMContentLoaded', async function() {
    resultDiv = document.getElementById('result');
    movieInput = document.getElementById('movieInput');
    yearFrom = document.getElementById('yearFrom');
    yearTo = document.getElementById('yearTo');
    ratingFilter = document.getElementById('ratingFilter');
    genreFilter = document.getElementById('genreFilter');
    typeFilter = document.getElementById('typeFilter');
    
    // Load movies from JSON file
    await loadMovies();
    
    // Populate the year dropdowns
    populateYearDropdowns();
    
    // Add year range validation
    yearFrom.addEventListener('change', validateYearRange);
    yearTo.addEventListener('change', validateYearRange);
    
    // Allow Enter key to search
    movieInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchMovie();
        }
    });
});

function validateYearRange() {
    const fromYear = parseInt(yearFrom.value);
    const toYear = parseInt(yearTo.value);
    
    // Clear any previous validation messages
    const existingError = document.getElementById('year-validation-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Check if both years are selected
    if (yearFrom.value && yearTo.value) {
        if (fromYear > toYear) {
            // Show error message
            const errorDiv = document.createElement('div');
            errorDiv.id = 'year-validation-error';
            errorDiv.className = 'year-error';
            errorDiv.textContent = 'Invalid year range: "From" year cannot be later than "To" year';
            
            const filterSection = document.querySelector('.filters');
            filterSection.insertBefore(errorDiv, filterSection.querySelector('.filter-grid'));
        }
    }
}

async function searchMovie() {
    const movieTitle = movieInput.value.trim();
    
    if (!movieTitle) {
        resultDiv.innerHTML = '<div class="error">Please enter a movie title</div>';
        return;
    }

    resultDiv.innerHTML = '<div class="loading">Searching...</div>';

    // First, try fuzzy matching against our local movie database
    const fuse = new Fuse(popularMovies, {
        threshold: 0.4, // 0 = perfect match, 1 = match anything
        distance: 100,
        includeScore: true
    });
    
    const fuzzyResults = fuse.search(movieTitle);
    
    // If we found close matches in our database, use the best match
    if (fuzzyResults.length > 0) {
        const bestMatch = fuzzyResults[0].item;
        const score = fuzzyResults[0].score;
        
        // If it's a really close match (score < 0.3), use it directly
        if (score < 0.3) {
            console.log(`Fuzzy match: "${movieTitle}" -> "${bestMatch}" (score: ${score})`);
            await searchOMDB(bestMatch, movieTitle);
            return;
        }
        
        // If it's a moderate match, show suggestions
        if (score < 0.5 && fuzzyResults.length > 1) {
            displaySuggestions(movieTitle, fuzzyResults.slice(0, 5));
            return;
        }
    }
    
    // If no good fuzzy match, try OMDB search directly
    await searchOMDB(movieTitle, null);
}

// New function to search OMDB
async function searchOMDB(searchTerm, originalQuery) {
    try {
        // Use search endpoint (s=) for multiple results
        const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();

        if (data.Response === 'True') {
            // If we used fuzzy matching, show a note
            if (originalQuery && originalQuery !== searchTerm) {
                resultDiv.innerHTML = `<div class="info-message">Showing results for "<strong>${searchTerm}</strong>" (searched for: "${originalQuery}")</div>`;
            }
            displaySearchResults(data.Search);
        } else {
            // Try one more time with just the first word if multi-word search failed
            const firstWord = searchTerm.split(' ')[0];
            if (firstWord !== searchTerm && firstWord.length > 3) {
                const retryResponse = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(firstWord)}`);
                const retryData = await retryResponse.json();
                
                if (retryData.Response === 'True') {
                    resultDiv.innerHTML = `<div class="info-message">No exact matches found. Showing results for "<strong>${firstWord}</strong>"</div>`;
                    displaySearchResults(retryData.Search);
                    return;
                }
            }
            
            resultDiv.innerHTML = `<div class="error">No movies found for "${searchTerm}". Please check your spelling and try again.</div>`;
        }
    } catch (error) {
        resultDiv.innerHTML = '<div class="error">Error fetching movie data.</div>';
    }
}

// New function to display "Did you mean?" suggestions
function displaySuggestions(originalQuery, suggestions) {
    let html = '<div class="suggestions-container">';
    html += `<h3>No exact match for "${originalQuery}". Did you mean:</h3>`;
    html += '<div class="suggestions-list">';
    
    suggestions.forEach(result => {
        html += `
            <button class="suggestion-btn" onclick="searchFromSuggestion('${result.item.replace(/'/g, "\\'")}')">
                ${result.item}
            </button>
        `;
    });
    
    html += '</div>';
    html += `<p class="suggestions-note">Or try searching with a different spelling</p>`;
    html += '</div>';
    
    resultDiv.innerHTML = html;
}

// Function to search from a suggestion
async function searchFromSuggestion(movieTitle) {
    movieInput.value = movieTitle;
    resultDiv.innerHTML = '<div class="loading">Searching...</div>';
    await searchOMDB(movieTitle, null);
}

// New function to display search results
function displaySearchResults(movies) {
    let html = '<div class="search-results">';
    html += '<h3>Search Results - Click on a movie to see details:</h3>';
    html += '<div class="results-grid">';
    
    movies.forEach(movie => {
        const posterUrl = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster';
        html += `
            <div class="result-card" onclick="getMovieDetails('${movie.imdbID}')">
                <img src="${posterUrl}" alt="${movie.Title} poster">
                <div class="result-info">
                    <div class="result-title">${movie.Title}</div>
                    <div class="result-year">${movie.Year}</div>
                    <div class="result-type">${movie.Type}</div>
                </div>
            </div>
        `;
    });
    
    html += '</div></div>';
    resultDiv.innerHTML = html;
}

// New function to get full movie details by IMDb ID
async function getMovieDetails(imdbID) {
    resultDiv.innerHTML = '<div class="loading">Loading movie details...</div>';
    
    try {
        const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${imdbID}`);
        const data = await response.json();

        if (data.Response === 'True') {
            displayMovie(data);
        } else {
            resultDiv.innerHTML = '<div class="error">Error loading movie details.</div>';
        }
    } catch (error) {
        resultDiv.innerHTML = '<div class="error">Error fetching movie data.</div>';
    }
}

async function suggestMovie() {
    // Check for valid year range first
    const fromYear = parseInt(yearFrom.value);
    const toYear = parseInt(yearTo.value);
    
    if (yearFrom.value && yearTo.value && fromYear > toYear) {
        resultDiv.innerHTML = '<div class="error">Please fix the year range before suggesting a movie.</div>';
        return;
    }
    
    resultDiv.innerHTML = '<div class="loading">Finding a suggestion...</div>';
    
    const maxAttempts = 20;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
        attempts++;
        
        // Pick a random movie from the list
        const randomMovie = popularMovies[Math.floor(Math.random() * popularMovies.length)];
        
        try {
            const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&t=${encodeURIComponent(randomMovie)}`);
            const data = await response.json();

            if (data.Response === 'True' && meetsFilterCriteria(data)) {
                movieInput.value = randomMovie;
                displayMovie(data);
                return;
            }
        } catch (error) {
            console.error('Error fetching movie:', error);
        }
    }
    
    resultDiv.innerHTML = '<div class="error">Could not find a movie matching your filters. Try adjusting your criteria.</div>';
}

function meetsFilterCriteria(movie) {
    // Check year range
    const movieYear = parseInt(movie.Year);
    const fromYear = yearFrom.value ? parseInt(yearFrom.value) : 0;
    const toYear = yearTo.value ? parseInt(yearTo.value) : 9999;
    
    if (movieYear < fromYear || movieYear > toYear) {
        return false;
    }
    
    // Check rating
    const minRating = parseFloat(ratingFilter.value);
    const movieRating = parseFloat(movie.imdbRating);
    
    if (movieRating < minRating) {
        return false;
    }
    
    // Check genre
    const selectedGenre = genreFilter.value;
    if (selectedGenre && !movie.Genre.includes(selectedGenre)) {
        return false;
    }
    
    // Check type
    const selectedType = typeFilter.value;
    if (selectedType && movie.Type !== selectedType) {
        return false;
    }
    
    return true;
}

function clearFilters() {
    yearFrom.value = '';
    yearTo.value = '';
    ratingFilter.value = '7';
    genreFilter.value = '';
    typeFilter.value = 'movie';
}

function displayMovie(movie) {
    const posterHTML = movie.Poster !== 'N/A' 
        ? `<img src="${movie.Poster}" alt="${movie.Title} poster">`
        : '<div class="no-poster">No Poster Available</div>';

    resultDiv.innerHTML = `
        <div class="movie-result">
            <div class="movie-poster">
                ${posterHTML}
            </div>
            <div class="movie-details">
                <div class="movie-title">${movie.Title}</div>
                <div class="movie-year">${movie.Year}</div>
                
                <div class="movie-info">
                    <div class="info-item">
                        <div class="info-label">Rated</div>
                        <div class="info-value">${movie.Rated}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Runtime</div>
                        <div class="info-value">${movie.Runtime}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Genre</div>
                        <div class="info-value">${movie.Genre}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Director</div>
                        <div class="info-value">${movie.Director}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">IMDb Rating</div>
                        <div class="info-value">${movie.imdbRating}/10</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Box Office</div>
                        <div class="info-value">${movie.BoxOffice !== 'N/A' ? movie.BoxOffice : 'N/A'}</div>
                    </div>
                </div>

                <div class="info-item">
                    <div class="info-label">Cast</div>
                    <div class="info-value">${movie.Actors}</div>
                </div>

                <div class="info-item">
                    <div class="info-label">Plot</div>
                    <div class="movie-plot">${movie.Plot}</div>
                </div>
            </div>
        </div>
    `;
}