import './App.css';
import React, { useEffect, useState, useRef } from "react";
import {errorHandling, addTypesToUrl} from "./functions.js";
import ResultTemplate from "./ResultTemplate.js";
import {FiltersBar} from "./FiltersBar.js";
import SlideIn from "./SlideIn.js";


function Placeholder() {
  return (
    <div className='placeholder'>
      <h2>No results found</h2>
      <img src={process.env.PUBLIC_URL + "/images/notFound.png"} alt="results not found" />
      <span>Try changing filters and search text</span>
    </div>
  )
}


function App() {
  const CLIENT_ID = "eae286ae2c30452f876d62116733da2a";
  const REDIRECT_URI = "https://notthatgoodofaprogrammer.github.io/RECOMmusicENDATIONS";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";

  let maxPerPage = 10;
  if (window.innerWidth >= 700) maxPerPage = 20;
  
  const [token, setToken] = useState("");
  const searchInput = useRef();
  const [albumsData, setAlbumsData] = useState([]);
  const [artistsData, setMusicistsData] = useState([]);
  const [playlistsData, setPlaylistsData] = useState([]);
  const [tracksData, setTracksData] = useState([]);
  const [genres, setGenres] = useState([]);
  const [prevPage, setPrevPage] = useState("");
  const [nextPage, setNextPage] = useState("");
  const [pickedMusic, setPickedMusic] = useState([]);
  const typeParameter = useRef("");
  
  useEffect(() => {
    const hash = window.location.hash;

    let tokenVariable = window.localStorage.getItem("token");

    if (hash) {
      tokenVariable = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1];

      window.location.hash = "";
      window.localStorage.setItem("token", tokenVariable);
    }

    setToken(tokenVariable);
  }, [])

  
  useEffect(() => {
    const fetchGenres = async() => {
      if (token) {
        let response = await fetch("https://api.spotify.com/v1/recommendations/available-genre-seeds", {
          headers: {
              Authorization: `Bearer ${token}`
          }
        });
    
        if (response.ok) {
          let data = await response.json();
          setGenres(data.genres);
          
        } else errorHandling(response);
      }
    }
    
    fetchGenres()
    .catch(console.error);
  }, [token])

  
  function getUrlFromClient(e) {
    e.preventDefault();
    
    const typesOptions = document.getElementById("type-options");
    const dateOptions = document.getElementById("date-options");
    const genreOptions = document.getElementById("genre-options");


    const typeCheckboxes = typesOptions.querySelectorAll("input[type=checkbox]:checked");
    let types = [];
    Array.from(typeCheckboxes).forEach(checkbox => {
      types = [...types, (checkbox.parentElement.innerText || checkbox.parentElement.textContent)];
    })

    typeParameter.current = "&type=" + types;
    typeParameter.dataLimit = Math.floor(maxPerPage / types.length);


    const isTagChecked = dateOptions.querySelector("input[type=checkbox]:checked");
    const tagParameter = (isTagChecked  &&  (typeParameter.current === "&type=album")) ? " tag:new" : "";


    let yearParameter = '';
    if (! types.includes("playlist")) {
      const yearInputs = dateOptions.querySelectorAll("input[type=text]");

      let startDate = Number(yearInputs[0].value);
      let endDate = Number(yearInputs[1].value);

      if (startDate || endDate) { // checking if inputs weren't empty or only made with 0s
        if (startDate <= endDate) {
          yearParameter =  " year:" + Math.max(startDate, 1000) + '-' + Math.min(endDate, 2999);

        } else {
          window.alert("Incorrect year range logic inputted");
        }
      }
    }


    const genreCheckboxes = genreOptions.querySelectorAll("input[type=checkbox]:checked");
    let genreParameter = "";

    Array.from(genreCheckboxes).forEach(checkbox => {
      genreParameter += (" genre:\"" + (checkbox.parentElement.innerText  ||  checkbox.parentElement.textContent) + "\"");
    })
    

    const url = "https://api.spotify.com/v1/search?q=" + searchInput.current.value
                    + tagParameter + yearParameter + genreParameter + typeParameter.current
                    + "&limit=" + typeParameter.dataLimit;
    
    return url;
  }

  
  async function fetchData(url, notify = false) {
    const response = await fetch(url, {
      headers: {
          Authorization: `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      const data = await response.json();
      

      if (notify) {
        const popUp = document.querySelector(".notification.left");
        popUp.classList.add("shown-notification");
        setTimeout(() => popUp.classList.remove("shown-notification"), 3000);
      }


      if (! data.items) { // default search for items
        setAlbumsData(data.albums ? data.albums.items : []);
        setMusicistsData(data.artists ? (data.artists.items ? data.artists.items: data.artists) : []);
        setPlaylistsData(data.playlists ? data.playlists.items : []);
        setTracksData(data.tracks ? (data.tracks.items ? data.tracks.items : data.tracks) : []);

        const pageData = data.albums || data.artists || data.playlists || data.tracks;
        setPrevPage(addTypesToUrl(pageData.previous || null, typeParameter.current));
        setNextPage(addTypesToUrl(pageData.next || null, typeParameter.current));


      } else { // always one type of data

        let playlistTracks = [];
        
        if (data.items[0].disc_number) { // disc_number is unique for album tracks
          const img = {url: document.getElementsByClassName("search-results-grid")[0].getElementsByClassName("result-image")[0].src};
          // tracks from album by default don't have image provided
          data.items.forEach(track => track.images || (track.images = [img]));
          
        } else if (data.items[0].added_by) {// added_by is unique for plalists tracks
          data.items.forEach(item => playlistTracks = [...playlistTracks, item.track]); // formatting data
        }

        const type = data.items[0].type;
        setAlbumsData(type === "album" ? data.items : []);
        setMusicistsData(data.artists ? data.artists.items : []);
        setPlaylistsData(data.playlists ? data.playlists.items : []);
        setTracksData(type === "track" ? data.items : (playlistTracks.length ? playlistTracks : []));

        setPrevPage(data.previous);
        setNextPage(data.next);
      }
    } else errorHandling(response);
  }


  function renderData(displayData, isPicked) {
    let idx = 0; // makes sure that keys are unique
    return displayData.map(elem => (
      <ResultTemplate
        type={elem.type}
        img={(elem.images  &&  elem.images.length
              ? elem.images[0].url : '')
              ||
              (elem.album  &&  elem.album.images  &&  elem.album.images.length
              ? elem.album.images[0].url : '')
            }
        name={elem.name.length < 30 ? elem.name : (elem.name.slice(0, 25) + "...")}
        idForTracks={elem.id}
        artistId={elem.artists ? elem.artists.map(artist => artist.id) : elem.id}
        spotifyUrl={elem.external_urls.spotify}
        typeParameter={typeParameter}
        maxPerPage={maxPerPage}
        isPicked={isPicked}
        fetchData={fetchData}
        pickedMusic={pickedMusic}
        setPickedMusic={setPickedMusic}
        key={'' + elem.id + idx++}
      />
    ))
  }

  
  function resetFilters() {
    const filtersList = document.getElementsByClassName("filters-list")[0];

    const inputs = filtersList.querySelectorAll("input[type=text]");
    Array.from(inputs).forEach(input => input.value = "");

    const checkboxes = filtersList.querySelectorAll("input[type=checkbox]:checked");
    Array.from(checkboxes).forEach(checkbox => checkbox.checked = false);
    
    const hiddenGenres = document.getElementById("genre-options").getElementsByClassName("hidden");
    Array.from(hiddenGenres).forEach(genre => genre.classList.remove("hidden"));
  }

  
  return (
    <div className="App">
      <FiltersBar genres={genres}/>
      <SlideIn
        token={token}
        maxPerPage={maxPerPage}
        genres={genres}
        renderPicked={renderData}
        setAlbumsData={setAlbumsData}
        setMusicistsData={setMusicistsData}
        setPlaylistsData={setPlaylistsData}
        setTracksData={setTracksData}
        setPrevPage={setPrevPage}
        setNextPage={setNextPage}
        pickedMusic={pickedMusic}
        setPickedMusic={setPickedMusic}
      />
      <div className='site-content'>
        <div className='user-contribution'>
          <div className='default-button-container'>
            <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>Get token</a>
          </div>
          <div className='default-button-container'>
            <button onClick={resetFilters}>Reset filters</button>
          </div>
          <div className='search-form-container'>
            <form className='search-form' onSubmit={e => fetchData(getUrlFromClient(e), true)}>
              <input className='search-input' type="text" placeholder='Search for music' ref={searchInput}/>
              <button className='submit-button' type='submit'>Submit</button>
              <div className='fluid-row'>
                <div className='notification left'>
                  <span>Submitted</span>
                </div>
              </div>
            </form>
          </div>
          <div className='search-results-container'>
            <div className='search-results-grid'>
              {!! albumsData.length  &&  renderData(albumsData, false)}
              {!! artistsData.length  &&  renderData(artistsData, false)}
              {!! playlistsData.length  &&  renderData(playlistsData, false)}
              {!! tracksData.length  &&  renderData(tracksData, false)}
              {!! (albumsData.length  ||  artistsData.length  ||  playlistsData.length  ||  tracksData.length)
              ||  <Placeholder />}
            </div>
          </div>
        </div>
      </div>
      <footer>
        <div className='change-page-button-container'>
          <button className='change-page-button' disabled={! prevPage} onClick={() => fetchData(prevPage)}>
            <img src={process.env.PUBLIC_URL + "/images/prevPage.png"} alt='prev page'/>
          </button>
        </div>
        <div className='credits-container'>
          <label>
            Made by: Armatys Konrad
            <br/>
            Check me on <a href='https://github.com/NotThatGoodOfAProgrammer' target="_blank" rel='noreferrer'>GitHub</a>
          </label>
        </div>
        <div className='change-page-button-container'>
          <button
            className='change-page-button'
            disabled={
              nextPage === null  || // Spotify allows setting an offset larger than the number of elements. This is in order to prevent empty pages being shown
              (albumsData.length < typeParameter.dataLimit  &&  artistsData.length < typeParameter.dataLimit
              &&  playlistsData.length < typeParameter.dataLimit  &&  tracksData.length < typeParameter.dataLimit)
            }
            onClick={() => fetchData(nextPage)}
          >
            <img src={process.env.PUBLIC_URL + "/images/nextPage.png"} alt='next page'/>
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;