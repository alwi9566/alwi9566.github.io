// API Configuration
const API_KEY = 'f74fc534';

// DOM Elements (initialized on page load)
let resultDiv;
let movieInput;
let yearFrom, yearTo, ratingFilter, genreFilter, typeFilter;

// Movie Database
let popularMovies = [];

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    // Get DOM element references
    resultDiv = document.getElementById('result');
    movieInput = document.getElementById('movieInput');
    yearFrom = document.getElementById('yearFrom');
    yearTo = document.getElementById('yearTo');
    ratingFilter = document.getElementById('ratingFilter');
    genreFilter = document.getElementById('genreFilter');
    typeFilter = document.getElementById('typeFilter');
    
    // Load movie database
    await loadMovies();
    
    // Populate year dropdowns
    populateYearDropdowns();
    
    // Setup event listeners
    yearFrom.addEventListener('change', validateYearRange);
    yearTo.addEventListener('change', validateYearRange);
    movieInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchMovie();
        }
    });
});

// Load movies from JSON file
async function loadMovies() {
    try {
        const response = await fetch('movies.json');
        const data = await response.json();
        popularMovies = data.movies;
        console.log(`Loaded ${popularMovies.length} movies from database`);
    } catch (error) {
        console.error('Error loading movies:', error);
        // Fallback to default list if JSON fails
        popularMovies = [
            'The Shawshank Redemption', 'The Godfather', 'The Dark Knight', 
            'Pulp Fiction', 'Forrest Gump', 'Inception', 'Fight Club',
            'The Matrix', 'Goodfellas', 'Interstellar'
        ];
    }
}

// Populate year dropdown menus
function populateYearDropdowns() {
    const currentYear = 2025;
    const startYear = 1900;
    
    for (let year = currentYear; year >= startYear; year--) {
        // Add to "From" dropdown
        const optionFrom = document.createElement('option');
        optionFrom.value = year;
        optionFrom.textContent = year;
        yearFrom.appendChild(optionFrom);
        
        // Add to "To" dropdown
        const optionTo = document.createElement('option');
        optionTo.value = year;
        optionTo.textContent = year;
        yearTo.appendChild(optionTo);
    }
}

// Validate year range selection
function validateYearRange() {
    const fromYear = parseInt(yearFrom.value);
    const toYear = parseInt(yearTo.value);
    
    // Clear previous error message
    const existingError = document.getElementById('year-validation-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Show error if range is invalid
    if (yearFrom.value && yearTo.value && fromYear > toYear) {
        const errorDiv = document.createElement('div');
        errorDiv.id = 'year-validation-error';
        errorDiv.className = 'year-error';
        errorDiv.textContent = 'Invalid year range: "From" year cannot be later than "To" year';
        
        const filterSection = document.querySelector('.filters');
        filterSection.insertBefore(errorDiv, filterSection.querySelector('.filter-grid'));
    }
}

// Main search function with fuzzy matching
async function searchMovie() {
    const movieTitle = movieInput.value.trim();
    
    if (!movieTitle) {
        resultDiv.innerHTML = '<div class="error">Please enter a movie title</div>';
        return;
    }

    showLoadingState('Searching');

    // Use Fuse.js for fuzzy matching
    const fuse = new Fuse(popularMovies, {
        threshold: 0.4,
        distance: 100,
        includeScore: true
    });
    
    const fuzzyResults = fuse.search(movieTitle);
    
    if (fuzzyResults.length > 0) {
        const bestMatch = fuzzyResults[0].item;
        const score = fuzzyResults[0].score;
        
        // Close match - search directly
        if (score < 0.3) {
            console.log(`Fuzzy match: "${movieTitle}" -> "${bestMatch}" (score: ${score})`);
            await searchOMDB(bestMatch, movieTitle);
            return;
        }
        
        // Moderate match - show suggestions
        if (score < 0.5 && fuzzyResults.length > 1) {
            displaySuggestions(movieTitle, fuzzyResults.slice(0, 5));
            return;
        }
    }
    
    // No fuzzy match - search OMDB directly
    await searchOMDB(movieTitle, null);
}

// Search OMDB API
async function searchOMDB(searchTerm, originalQuery) {
    try {
        showLoadingState('Searching');
        
        const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();

        if (data.Response === 'True') {
            // Show fuzzy match message if applicable
            if (originalQuery && originalQuery !== searchTerm) {
                resultDiv.innerHTML = `<div class="info-message">Showing results for "<strong>${searchTerm}</strong>" (searched for: "${originalQuery}")</div>`;
            }
            displaySearchResults(data.Search);
        } else {
            // Retry with first word only
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

// Display "Did you mean?" suggestions
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

// Search from clicked suggestion
async function searchFromSuggestion(movieTitle) {
    movieInput.value = movieTitle;
    showLoadingState('Searching');
    await searchOMDB(movieTitle, null);
}

// Suggest random movie based on filters
async function suggestMovie() {
    const fromYear = parseInt(yearFrom.value);
    const toYear = parseInt(yearTo.value);
    
    // Validate year range
    if (yearFrom.value && yearTo.value && fromYear > toYear) {
        resultDiv.innerHTML = '<div class="error">Please fix the year range before suggesting a movie.</div>';
        return;
    }
    
    showLoadingState('Finding a suggestion');
    
    const maxAttempts = 20;
    let attempts = 0;
    
    // Try random movies until one matches filters
    while (attempts < maxAttempts) {
        attempts++;
        
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

// Check if movie meets filter criteria
function meetsFilterCriteria(movie) {
    // Year range filter
    const movieYear = parseInt(movie.Year);
    const fromYear = yearFrom.value ? parseInt(yearFrom.value) : 0;
    const toYear = yearTo.value ? parseInt(yearTo.value) : 9999;
    
    if (movieYear < fromYear || movieYear > toYear) {
        return false;
    }
    
    // Rating filter
    const minRating = parseFloat(ratingFilter.value);
    const movieRating = parseFloat(movie.imdbRating);
    
    if (movieRating < minRating) {
        return false;
    }
    
    // Genre filter
    const selectedGenre = genreFilter.value;
    if (selectedGenre && !movie.Genre.includes(selectedGenre)) {
        return false;
    }
    
    // Type filter
    const selectedType = typeFilter.value;
    if (selectedType && movie.Type !== selectedType) {
        return false;
    }
    
    return true;
}

// Clear all filters
function clearFilters() {
    yearFrom.value = '';
    yearTo.value = '';
    ratingFilter.value = '7';
    genreFilter.value = '';
    typeFilter.value = 'movie';
}

// Display search results with filtering
async function displaySearchResults(movies) {
    let filteredMovies = [];
    
    showLoadingState('Filtering results');
    
    // Fetch full details and apply filters
    for (const movie of movies) {
        try {
            const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${movie.imdbID}`);
            const data = await response.json();
            
            if (data.Response === 'True' && meetsFilterCriteria(data)) {
                filteredMovies.push(data);
            }
        } catch (error) {
            console.error('Error fetching movie details:', error);
        }
    }
    
    // Show error if no matches
    if (filteredMovies.length === 0) {
        resultDiv.innerHTML = '<div class="error">No movies found matching your search and filter criteria. Try adjusting your filters.</div>';
        return;
    }
    
    // Display all filtered movies
    let html = '<div class="multiple-results">';
    html += `<h3 class="results-header">Found ${filteredMovies.length} result(s)</h3>`;
    
    filteredMovies.forEach(movie => {
        html += generateMovieCard(movie);
    });
    
    html += '</div>';
    resultDiv.innerHTML = html;
}

// Display single movie
function displayMovie(movie) {
    resultDiv.innerHTML = generateMovieCard(movie);
}

// Get movie details by IMDb ID
async function getMovieDetails(imdbID) {
    showLoadingState('Loading movie details');
    
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

// Generate HTML for movie card
function generateMovieCard(movie) {
    const posterHTML = movie.Poster !== 'N/A' 
        ? `<img src="${movie.Poster}" alt="${movie.Title} poster">`
        : '<div class="no-poster">No Poster Available</div>';

    return `
        <div class="movie-result">
            <div class="movie-poster">
                ${posterHTML}
            </div>
            <div class="movie-details">
                <a href="https://www.imdb.com/title/${movie.imdbID}/" target="_blank" rel="noopener noreferrer" class="movie-title-link">
                    <div class="movie-title">${movie.Title}</div>
                </a>
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

// Show loading animation
function showLoadingState(message) {
    resultDiv.innerHTML = `
        <div class="loading">
            <div class="loading-spinner"></div>
            <div class="loading-text">${message}<span class="loading-dots"></span></div>
        </div>
    `;
}