import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useParams, useNavigate } from 'react-router-dom';
import "./App.css";

const API_KEY = '266f7755';
const BASE_URL = 'http://www.omdbapi.com/';
const moviesPerPage = 10;

function MovieApp() {
    const [keyword, setKeyword] = useState('');
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    const fetchMoviesByKeyword = async (keyword, page = 1) => {
        try {
            const response = await fetch(`${BASE_URL}?apikey=${API_KEY}&s=${keyword}&page=${page}`);
            const data = await response.json();
            if (data.Response === "True") {
                setTotalResults(parseInt(data.totalResults));
                return data.Search;
            }
            return [];
        } catch (error) {
            console.error(`Error fetching data for page ${page} with keyword "${keyword}":`, error);
            return [];
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!keyword.trim()) return;

        setLoading(true);
        setCurrentPage(1);
        const fetchedMovies = await fetchMoviesByKeyword(keyword, 1);
        setMovies(fetchedMovies);
        setLoading(false);
    };

    const fetchLatestMovies = async () => {
        setLoading(true);
        const fetchedMovies = await fetchMoviesByKeyword('latest', 1); // Using a generic "latest" keyword
        setMovies(fetchedMovies);
        setLoading(false);
    };

    useEffect(() => {
        fetchLatestMovies();
    }, []);

    const handlePageChange = async (newPage) => {
        setLoading(true);
        setCurrentPage(newPage);
        const fetchedMovies = await fetchMoviesByKeyword(keyword || 'latest', newPage);
        setMovies(fetchedMovies);
        setLoading(false);
    };

    const renderMovies = () => {
        return movies.map((movie) => (
            <div key={movie.imdbID} className="movie-card">
                <Link to={`/movie/${movie.imdbID}`}>
                    <img 
                        src={movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/200x300"} 
                        alt={movie.Title} 
                    />
                    <h3>{movie.Title}</h3>
                    <p>Year: {movie.Year}</p>
                    <p>Type: {movie.Type}</p>
                </Link>
            </div>
        ));
    };

    const renderPagination = () => {
        const totalPages = Math.ceil(totalResults / moviesPerPage);
        const pages = [];

        const startPage = Math.max(1, currentPage - 3);
        const endPage = Math.min(totalPages, currentPage + 3);

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button 
                    key={i} 
                    onClick={() => handlePageChange(i)} 
                    className={i === currentPage ? 'active' : ''}
                >
                    {i}
                </button>
            );
        }

        return (
            <div className="pagination">
                {currentPage > 1 && (
                    <button onClick={() => handlePageChange(currentPage - 1)}>Previous</button>
                )}
                {pages}
                {currentPage < totalPages && (
                    <button onClick={() => handlePageChange(currentPage + 1)}>Next</button>
                )}
            </div>
        );
    };

    return (
        <div className="App">
            <h1>Movie Search Engine</h1>
            <form onSubmit={handleSearch}>
                <input 
                    type="text" 
                    placeholder="Enter a keyword..." 
                    value={keyword} 
                    onChange={(e) => setKeyword(e.target.value)}
                    required
                />
                <button type="submit">Search</button>
            </form>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="movie-results">{renderMovies()}</div>
            )}

            {renderPagination()}
        </div>
    );
}

function MovieDetails() {
    const { movieId } = useParams();
    const [movie, setMovie] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMovieDetails = async () => {
            try {
                const response = await fetch(`${BASE_URL}?apikey=${API_KEY}&i=${movieId}`);
                const data = await response.json();
                setMovie(data);
            } catch (error) {
                console.error("Error fetching movie details:", error);
            }
        };

        fetchMovieDetails();
    }, [movieId]);

    return (
        <div className="movie-details">
            {movie ? (
                <>
                    <button onClick={() => navigate(-1)}>Back</button> {/* Back button */}
                    <h2>{movie.Title}</h2>
                    <img 
                        src={movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/200x300"} 
                        alt={movie.Title} 
                    />
                    <p><strong>Year:</strong> {movie.Year}</p>
                    <p><strong>Genre:</strong> {movie.Genre}</p>
                    <p><strong>Director:</strong> {movie.Director}</p>
                    <p><strong>Actors:</strong> {movie.Actors}</p>
                    <p><strong>Plot:</strong> {movie.Plot}</p>
                </>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MovieApp />} />
                <Route path="/movie/:movieId" element={<MovieDetails />} />
            </Routes>
        </Router>
    );
}
