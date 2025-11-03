const API_KEY = 'f74fc534'; 
let resultDiv;
let movieInput;

// Popular movies for random suggestions
const popularMovies = [
    'The Shawshank Redemption', 'The Godfather', 'The Dark Knight', 
    'Pulp Fiction', 'Forrest Gump', 'Inception', 'Fight Club',
    'The Matrix', 'Goodfellas', 'Interstellar', 'The Prestige',
    'The Lord of the Rings', 'Gladiator', 'The Lion King',
    'Back to the Future', 'Star Wars', 'Jurassic Park', 'Titanic',
    'Avatar', 'The Avengers', 'Toy Story', 'Finding Nemo',
    'The Silence of the Lambs', 'Saving Private Ryan', 'Braveheart'
];

// Wait for DOM to load before accessing elements
document.addEventListener('DOMContentLoaded', function() {
    resultDiv = document.getElementById('result');
    movieInput = document.getElementById('movieInput');
    
    // Allow Enter key to search
    movieInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchMovie();
        }
    });
});

async function searchMovie() {
    const movieTitle = movieInput.value.trim();
    
    if (!movieTitle) {
        resultDiv.innerHTML = '<div class="error">Please enter a movie title</div>';
        return;
    }

    resultDiv.innerHTML = '<div class="loading">Searching...</div>';

    try {
        const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&t=${encodeURIComponent(movieTitle)}`);
        const data = await response.json();

        if (data.Response === 'True') {
            displayMovie(data);
        } else {
            resultDiv.innerHTML = `<div class="error">Movie not found: ${data.Error}</div>`;
        }
    } catch (error) {
        resultDiv.innerHTML = '<div class="error">Error fetching movie data.</div>';
    }
}

async function suggestMovie() {
    const randomMovie = popularMovies[Math.floor(Math.random() * popularMovies.length)];
    movieInput.value = randomMovie;
    
    resultDiv.innerHTML = '<div class="loading">Finding a suggestion...</div>';

    try {
        const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&t=${encodeURIComponent(randomMovie)}`);
        const data = await response.json();

        if (data.Response === 'True') {
            displayMovie(data);
        } else {
            resultDiv.innerHTML = '<div class="error">Could not fetch suggestion. Please try again.</div>';
        }
    } catch (error) {
        resultDiv.innerHTML = '<div class="error">Error fetching movie data. Please check your API key and try again.</div>';
    }
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