import React from 'react'
import Search from './components/search'
import { useState , useEffect, } from 'react';
import {useDebounce} from 'react-use';
import Spinner from './components/Spinner';
import MovieCard from './components/movieCard';
import { getTrendingMovies, updateSearchCount } from './appwrite';


const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS ={
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }

}

const App = () => {
  const [searchTerm, setSearchTerm] = useState(''); //default input field is empty
  const [errorMessage, setErrorMessage] = useState('');//to show error message
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [trendingMovies, setTrendingMovies] = useState('');

  //debounces the search term
  useDebounce(()=> setDebouncedSearchTerm(searchTerm), 500, [searchTerm])

  const fetchmovies = async (query = '') => {

    setIsLoading(true);
    setErrorMessage('');

    try {
    
      const endpoint = query
      ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);
      console.log("Status:", response.status);

      if(!response.ok){
        throw new Error ('Failed to fetch movies');
      }
      const data = await response.json();

      if(data.response === 'False'){
        setErrorMessage(data.Error || 'Failed to Fetch movies');
        setMovieList ([]);
        return;
      }

      setMovieList(data.results || []);

      if(query && data.results.length > 0){
        await updateSearchCount(query, data.results[0]);
      }

    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Error fetching movies. Please try again Later.');
    } finally {
      setIsLoading(false);
    }
  }

  const loadTrendingMovies = async () => {
    try{
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch(error) {
      console.error(`Error fetching movies: ${error}`);
      // setErrorMessage('Error fetching trending movies. Please try again later.');
    }
  }
  useEffect(()=>{
    fetchmovies(debouncedSearchTerm);
  },[debouncedSearchTerm])

  useEffect(()=>{
    loadTrendingMovies();
  },[])

  return (
    <main>
      <div className="pattern" />

      <div className="wrapper">
        <header>
          <img src= "./hero.png" alt ="Hero Banner" />
          <h1>Find <span className="text-gradient">Movies</span> you like</h1>
        

        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>


          {trendingMovies.length > 0 && (
            <section className='trending'>
              <h2>Trending Movies</h2>
              <ul>
                {trendingMovies.map((movie, index) => (
                  <li key={movie.$id}>
                    <p>{index + 1}</p>
                    <img src ={movie.poster_url} alt={movie.title} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className='all-movies'>
            <h2>All Movies</h2>

            {isLoading ? (
              <Spinner />
            ) : errorMessage ? (
              <p className='text-red-500'>{errorMessage}</p>
            ) :(
              <ul>
                {movieList.map((movie) => (
                  <MovieCard key={movie.id} movie={movie}></MovieCard>
                ))}
              </ul>
            )}
            
          </section>
        <h1 className="text-white">{searchTerm}</h1>
      </div>
    </main>
  )
}

export default App