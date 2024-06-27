import { useEffect, useState } from "react";
import Loader from "./Loader";
import MovieDetails from "./MovieDetails";
import ErrorMessage from "./ErrorMessage";
import { Navbar, NumResults, SearchBar } from "./Navbar";
import MoviesList from "./MoviesList";
import WatchedMoviesList from "./WatchedMoviesList";
import WatchedSummary from "./WatchedSummary";

const API_KEY = process.env.REACT_APP_OMDB_API_KEY;

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

  useEffect(() => {
    const controller = new AbortController();

    async function fetchMovies(curQuery) {
      try {
        setIsLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${API_KEY}&s=${curQuery}`,
          { signal: controller.signal }
        );

        if (!res.ok)
          throw new Error("Something went wrong while fetching movies!");

        const data = await res.json();
        if (data.Error) throw new Error(data.Error);

        setMovies(data.Search || []);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    setError(null);
    if (query.trim().length < 3) {
      setMovies([]);
      return;
    }

    handleCloseMovie();
    fetchMovies(query);

    return function () {
      controller.abort();
    };
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
