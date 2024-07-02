import { useState, useEffect } from "react";

const API_KEY = process.env.REACT_APP_OMDB_API_KEY;

export function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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

    fetchMovies(query);

    return function () {
      controller.abort();
    };
  }, [query]);

  return { movies, isLoading, error };
}
