// TMDB API Key
const apiKey = ${{secrets.YOUR_TMDB_API_KEY}}; // Replace with your TMDB API key

document.getElementById("getRandom").addEventListener("click", function () {
    // Show loading spinner
    document.getElementById("loading").style.display = "block";
    document.getElementById("result").classList.remove("show-result");
    document.getElementById("description").classList.remove("show-description");

    // Get the selected category
    const selectedCategory = document.querySelector('input[name="category"]:checked').value;

    // Fetch data based on selected category
    if (selectedCategory === 'movie') {
        fetchRandomMovie();
    } else if (selectedCategory === 'tv') {
        fetchRandomTVShow();
    } else {
        fetchRandomAnime();
    }
});

function fetchRandomMovie() {
    const randomPage = Math.floor(Math.random() * 100) + 1; // Fetch from random page

    fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=${randomPage}`)
        .then(response => {
            if (!response.ok) {
                console.error(`Movie fetch failed: ${response.status} ${response.statusText}`);
                throw new Error("Network response was not ok.");
            }
            return response.json();
        })
        .then(data => {
            if (data.results && data.results.length > 0) {
                const randomMovie = data.results[Math.floor(Math.random() * data.results.length)];
                displayResult(`Movie: <a href="https://www.themoviedb.org/movie/${randomMovie.id}" target="_blank">${randomMovie.title}</a>`);
                displayDescription(randomMovie.title, randomMovie.release_date ? randomMovie.release_date.split('-')[0] : 'Unknown', randomMovie.overview);
            } else {
                throw new Error("No movies found.");
            }
        })
        .catch(error => {
            console.error('Error fetching movie:', error);
            displayResult('Failed to load movie. Please try again.', true);
        });
}

function fetchRandomTVShow() {
    const randomPage = Math.floor(Math.random() * 100) + 1; // Fetch from random page

    fetch(`https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&language=en-US&page=${randomPage}`)
        .then(response => {
            if (!response.ok) {
                console.error(`TV Show fetch failed: ${response.status} ${response.statusText}`);
                throw new Error("Network response was not ok.");
            }
            return response.json();
        })
        .then(data => {
            if (data.results && data.results.length > 0) {
                const randomShow = data.results[Math.floor(Math.random() * data.results.length)];
                displayResult(`TV Show: <a href="https://www.themoviedb.org/tv/${randomShow.id}" target="_blank">${randomShow.name}</a>`);
                displayDescription(randomShow.name, randomShow.first_air_date ? randomShow.first_air_date.split('-')[0] : 'Unknown', randomShow.overview);
            } else {
                throw new Error("No TV shows found.");
            }
        })
        .catch(error => {
            console.error('Error fetching TV show:', error);
            displayResult('Failed to load TV show. Please try again.', true);
        });
}

function fetchRandomAnime() {
    // Query for a list of anime instead of a single result
    const query = `
        query {
            Page(perPage: 50) {
                media(type: ANIME, sort: POPULARITY_DESC, isAdult: false) {
                    title {
                        english
                    }
                    id
                    description
                    startDate {
                        year
                    }
                }
            }
        }`;

    fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({ query: query })
    })
    .then(response => {
        if (!response.ok) {
            console.error(`Anime fetch failed: ${response.status} ${response.statusText}`);
            throw new Error("Network response was not ok.");
        }
        return response.json();
    })
    .then(data => {
        if (data.data && data.data.Page && data.data.Page.media) {
            const animeList = data.data.Page.media;
            if (animeList.length > 0) {
                // Randomly select an anime from the list
                const randomAnime = animeList[Math.floor(Math.random() * animeList.length)];
                displayResult(`Anime: <a href="https://anilist.co/anime/${randomAnime.id}" target="_blank">${randomAnime.title.english || 'Title not available in English'}</a>`);
                displayDescription(randomAnime.title.english || 'Title not available in English', randomAnime.startDate.year || 'Unknown', randomAnime.description || 'No description available');
            } else {
                throw new Error("No anime found.");
            }
        } else {
            throw new Error("No anime data available.");
        }
    })
    .catch(error => {
        console.error('Error fetching anime:', error);
        displayResult('Failed to load anime. Please try again.', true);
    });
}


function displayResult(result, isError = false) {
    // Hide loading spinner
    document.getElementById("loading").style.display = "none";

    const resultDiv = document.getElementById("result");
    if (result) {
        resultDiv.innerHTML = `You should watch: ${result}`;
        resultDiv.classList.add("show-result");
        if (isError) {
            resultDiv.classList.add("error");
        }
    } else {
        resultDiv.innerHTML = "Sorry, something went wrong!";
    }
}

function displayDescription(title, year, description) {
    const descriptionDiv = document.getElementById("description");
    descriptionDiv.innerHTML = `
        <strong>${title}</strong><br>
        <em>Released: ${year}</em><br><br>
        ${description}
    `;
    descriptionDiv.classList.add("show-description");
}
