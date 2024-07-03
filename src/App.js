import { useState } from "react";
import Loader from "./Loader";
import MovieDetails from "./MovieDetails";
import ErrorMessage from "./ErrorMessage";
import { Navbar, NumResults, SearchBar } from "./Navbar";
import MoviesList from "./MoviesList";
import WatchedMoviesList from "./WatchedMoviesList";
import WatchedSummary from "./WatchedSummary";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";

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
  const [selectedMovieID, setSelectedMovieID] = useState(null);
  const { movies, error, isLoading } = useMovies(query);
  const [watched, setWatched] = useLocalStorageState("watched", []);

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
