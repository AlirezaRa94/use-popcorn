import { useEffect, useState } from "react";
import StarRating from "./StarRating";
import Loader from "./Loader";
import ErrorMessage from "./ErrorMessage";

const API_KEY = process.env.REACT_APP_OMDB_API_KEY;

export default function MovieDetails({
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
