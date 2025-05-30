import React from 'react'
import Search from './components/search'
import { useState , useEffect } from 'react';
import Spinner from './components/Spinner';
import MovieCard from './components/movieCard';

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
  
  const fetchmovies = async () => {

    setIsLoading(true);
    setErrorMessage('');

    try {
    
      const endpoint = `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      console.log("TMDB API KEY:", import.meta.env.VITE_TMDB_API_KEY);

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
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Error fetching movies. Please try again Later.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(()=>{
    fetchmovies();
  },[searchTerm])

  return (
    <main>
      <div className="pattern" />

      <div className="wrapper">
        <header>
          <img src= "./hero.png" alt ="Hero Banner" />
          <h1>Find <span className="text-gradient">Movies</span> you like</h1>
        </header>

        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <header>
          <section className='all-movies'>
            <h2 className='mt-[40px]'>Currently Trending</h2>

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
        </header>
        <h1 className="text-white">{searchTerm}</h1>
      </div>
    </main>
  )
}

export default App