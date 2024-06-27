import { useEffect, useState } from "react";
import StarRating from "./starRating";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const API_KEY = process.env.REACT_APP_OMDB_API_KEY;

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function SearchBar({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function Navbar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MoviesList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie key={movie.imdbID} movie={movie} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(1)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(1)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(0)} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => onDeleteWatched(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}

function WatchedMoviesList({ watched, onDeleteWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          key={movie.imdbID}
          movie={movie}
          onDeleteWatched={onDeleteWatched}
        />
      ))}
    </ul>
  );
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>🛑</span> {message}
    </p>
  );
}

function MovieDetails({
  selectedMovieID,
  onCloseMovie,
  watchedMovies,
  onAddToWatched,
  onRemoveFromWatched,
}) {
  const [movieDetails, setMovieDetails] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState("");
  const isWatched = watchedMovies.some(
    (movie) => movie.imdbID === selectedMovieID
  );
  const prevUserRating =
    watchedMovies.find((movie) => movie.imdbID === selectedMovieID)
      ?.userRating || null;

  function handleAddToWatched() {
    const newWatchedMovie = {
      imdbID: movieDetails.imdbID,
      title: movieDetails.Title,
      year: movieDetails.Year,
      poster: movieDetails.Poster,
      runtime: parseInt(movieDetails.Runtime),
      imdbRating: parseFloat(movieDetails.imdbRating),
      userRating,
    };

    onAddToWatched(newWatchedMovie);
    onCloseMovie();
  }

  function handleRemoveFromWatched() {
    onRemoveFromWatched(selectedMovieID);
    onCloseMovie();
  }

  useEffect(() => {
    async function getMovieDetails() {
      try {
        setIsLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${API_KEY}&i=${selectedMovieID}`
        );
        if (!res.ok)
          throw new Error("Something went wrong while fetching movie!");

        const data = await res.json();
        setMovieDetails(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    getMovieDetails();
  }, [selectedMovieID]);

  const moviePoster = (
    <>
      <header>
        <button className="btn-back" onClick={onCloseMovie}>
          &larr;
        </button>
        <img
          src={movieDetails.Poster}
          alt={`Poster of ${movieDetails.Title}`}
        />
        <div className="details-overview">
          <h2>{movieDetails.Title}</h2>
          <p>
            {movieDetails.Released} &bull; {movieDetails.Runtime}
          </p>
          <p>{movieDetails.Genre}</p>
          <p>
            <span>⭐️</span>IMDB Rating: <b>{movieDetails.imdbRating}</b>/10
          </p>
        </div>
      </header>

      <section>
        <div className="rating">
          {isWatched ? (
            <>
              <p>Your Rating: {prevUserRating}</p>
              <button className="btn-add" onClick={handleRemoveFromWatched}>
                Remove from List
              </button>
            </>
          ) : (
            <>
              <StarRating
                maxRating={10}
                size={24}
                onSetRating={setUserRating}
              />
              {userRating && (
                <button className="btn-add" onClick={handleAddToWatched}>
                  +Add to List
                </button>
              )}
            </>
          )}
        </div>
        <p>
          <em>{movieDetails.Plot}</em>
        </p>
        <p>Starring: {movieDetails.Actors}</p>
        <p>Directed by {movieDetails.Director}</p>
      </section>
    </>
  );

  return (
    <div className="details">
      {isLoading && <Loader />}
      {error && <ErrorMessage message={error} />}
      {!isLoading && !error && moviePoster}
    </div>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMovieID, setSelectedMovieID] = useState(null);

  function handleSelectMovie(id) {
    setSelectedMovieID((curID) => (curID === id ? null : id));
  }

  function handleCloseMovie() {
    setSelectedMovieID(null);
  }

  function handleAddToWatched(movie) {
    setWatched((prevWatched) => [...prevWatched, movie]);
  }

  function handleRemoveFromWatched(id) {
    setWatched((prevWatched) =>
      prevWatched.filter((movie) => movie.imdbID !== id)
    );
  }

  async function fetchMovies(curQuery) {
    try {
      setIsLoading(true);
      const res = await fetch(
        `http://www.omdbapi.com/?apikey=${API_KEY}&s=${curQuery}`
      );

      if (!res.ok)
        throw new Error("Something went wrong while fetching movies!");

      const data = await res.json();
      if (data.Error) throw new Error(data.Error);

      setMovies(data.Search || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    setError(null);
    if (query.trim().length < 3) {
      setMovies([]);
      return;
    }
    fetchMovies(query);
  }, [query]);

  return (
    <>
      <Navbar>
        <SearchBar query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </Navbar>

      <Main>
        <Box>
          {isLoading && <Loader />}
          {error && <ErrorMessage message={error} />}
          {!isLoading && !error && (
            <MoviesList movies={movies} onSelectMovie={handleSelectMovie} />
          )}
        </Box>

        <Box>
          {selectedMovieID ? (
            <MovieDetails
              selectedMovieID={selectedMovieID}
              onCloseMovie={handleCloseMovie}
              watchedMovies={watched}
              onAddToWatched={handleAddToWatched}
              onRemoveFromWatched={handleRemoveFromWatched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList
                watched={watched}
                onDeleteWatched={handleRemoveFromWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}
