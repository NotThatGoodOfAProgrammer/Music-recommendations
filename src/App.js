import './App.css';
import React, { useEffect, useState, useRef } from "react"

export const TokenContext = React.createContext();

function errorHandling(response) {
  if (response.status === 400) {
    window.alert("Make sure to select type and either type search term or choose genre");

  } else if (response.status === 401) {
    localStorage.removeItem("token");
    window.alert("Please get a new token");

  } else if (response.status === 429) {
    window.alert("This App is currently overloaded");

  } else {
    window.alert("Error: " + response.status + " have occured");
  }
}


function addTypesToUrl(url, typeParameter) {
  if (url === null  ||  url === undefined) return url;
  
  const typeStart = url.indexOf("&type", url.indexOf("?q="));
  if (typeStart !== -1){
    const typeEnd = url.indexOf("&", typeStart +1);

    let newUrl = url.slice(0, typeStart) + typeParameter;
    newUrl += (typeEnd !== -1 ? url.slice(typeEnd) : "");
    
    return newUrl;

  } else return url;
}


function AddButton({idForTracks, artistId, type, pickedMusic, setPickedMusic}) {
  function addMusic(e) {
    const pickedNode = e.target.closest(".search-result");
    
    // processing data to make it same as from Spotify whilst including only necessary data
    let pickedData = {type: type, id: idForTracks, artists: [{url: artistId}]};


    pickedData.images = [{url: pickedNode.getElementsByClassName("result-image")[0].src}];
    pickedData.name = pickedNode.getElementsByClassName("name")[0].innerText; // slicing "Name: "

    let spotifyHref = pickedNode.getElementsByClassName("result-info-container")[0].getElementsByTagName("a")[0].href;
    pickedData.external_urls = {};
    pickedData.external_urls.spotify = spotifyHref;
    

    if (pickedMusic.every(music => music.external_urls.spotify !== spotifyHref)) setPickedMusic([...pickedMusic, pickedData]); // avoiding duplicates

    console.log("p", pickedData);
    const popUp = document.querySelector(".notification.down");
    popUp.classList.add("shown-notification");
    setTimeout(() => popUp.classList.remove("shown-notification"), 3000)
  }


  return (
    <div className='result-button-container'>
      <button className='result-button' onClick={addMusic}>
        <img src={process.env.PUBLIC_URL + '/images/add.png'} alt='add' loading='lazy'/>
      </button>
    </div>
  );
}


function ThrashButton({pickedMusic, setPickedMusic}) {
  function removeMusic(e) {
    const pickedNode = e.target.closest(".search-result");
    const toDelete = pickedNode.getElementsByClassName("result-info-container")[0].getElementsByTagName("a")[0].href; // spotify links are unique (no duplicates are allowed)

    setPickedMusic(pickedMusic.filter((elem) => {
      return elem.external_urls.spotify !== toDelete;
    }))
  }


  return (
    <div className='result-button-container'>
      <button className='result-button' onClick={removeMusic}>
        <img src={process.env.PUBLIC_URL + '/images/thrash.png'} alt='thrash' loading='lazy'/>
      </button>
    </div>
  );
}


function ResultTemplate({type, img, name, idForTracks, artistId, spotifyUrl,
   setAlbumsData, setMusicistsData, setPlaylistsData, setTracksData,
  setPrevPage, setNextPage, pickedMusic, setPickedMusic, typeparameter, isPicked}) {
  
  const token = React.useContext(TokenContext);
  

  async function artistFetching() {
    let url;
    if (type === "artist") url = "https://api.spotify.com/v1/artists/" + artistId + "/albums";
    else if (type === "album"  ||  type === "track") url =  "https://api.spotify.com/v1/artists?ids=" + artistId;
    
    const response = await fetch(url, {
      headers: {
          Authorization: `Bearer ${token}`
      }
    })

    if (response.ok) {
      const data = await response.json();
      
      setAlbumsData(data.items ? data.items : []);
      setMusicistsData(data.artists ? data.artists : []);
      setPlaylistsData([]);
      setTracksData([]);
      
      typeparameter.current = "&type=" + (data.artists ? "artist" : "album");
      
      setPrevPage(data.previous);
      setNextPage(data.next);
      
    } else errorHandling(response);
  }


  async function trackFetching() {
    let url;
    if (type === "album") url = "https://api.spotify.com/v1/albums/" + idForTracks + "/tracks?market=pl";
    else if (type === "artist") url = "https://api.spotify.com/v1/artists/" + idForTracks + "/top-tracks?market=pl";
    else if (type === "playlist") url = "https://api.spotify.com/v1/playlists/" + idForTracks + "/tracks?market=pl";
    
    const response = await fetch(url, {
      headers: {
          Authorization: `Bearer ${token}`
      }
    })

    if (response.ok) {
      let data = await response.json();
      
      let playlistTracks = [];
      if (type === "album") { // tracks of album by default don't have image provided
        data.items.forEach(track => track.images = [{url: img}]);
        
      } else if (type === "playlist") {
        data.items.forEach(item => playlistTracks = [...playlistTracks, item.track]);
      }

      setMusicistsData([]);
      setAlbumsData([]);
      setPlaylistsData([]);

      if (type === "album") setTracksData(data.items ? data.items : []);
      else if (type === "artist") setTracksData(data.tracks ? data.tracks : []);
      else if (type === "playlist") setTracksData(playlistTracks);
      
      setPrevPage(data.previous);
      setNextPage(data.next);

    } else errorHandling(response);
  }

  
  return (
    <div className='search-result'>
      <img className='result-image' alt={img && name} src={img || (process.env.PUBLIC_URL + "/images/noImage.png")} loading='lazy'/>
      <div className='result-info-container'>
        <span className='name'>{name}</span>
        {type !== "playlist"  &&  <button onClick={artistFetching}>{"See " + (type === "artist" ? "albums" : "artists")}</button>}
        {type !== "track"  &&  <button onClick={trackFetching}>See tracks</button>}
        <a href={spotifyUrl}>Check in Spotify</a>
      </div>
        {(type === "artist"  ||  type === "track") &&
        (isPicked ?
        <ThrashButton
          pickedMusic={pickedMusic}
          setPickedMusic={setPickedMusic}/>
        :
        <AddButton
          idForTracks={idForTracks}
          artistId={artistId}
          type={type}
          pickedMusic={pickedMusic}
          setPickedMusic={setPickedMusic}/>
        )}
    </div>
  );
}


function FilterOptionCheckbox({name}) {
  return (
    <li>
      <label>
        <input type='checkbox'/>
        {name}
      </label>
    </li>
  );
}


function TypesFilterButton() {
  const types = ["album", "artist", "playlist", "track"];

  return (
    <div className='filter-button-container' id='type-options'>
      <button className='filter-button'>Types</button>
      <div className='filter-options'>
        <ul>
          {types.map(type => <FilterOptionCheckbox name={type} key={type}/>)}
        </ul>
      </div>
    </div>
  );
}


function DateFilterButton() {
  return (
    <div className='filter-button-container'>
      <button className='filter-button'>Release date</button>
      <div className='filter-options' id='date-options'>
        <ul>
          <FilterOptionCheckbox name='Past two weeks only' value='new'/>
          <li>
            <label>
              From: <input className='input-year' type="text" placeholder='YEAR'/>
            </label>
          </li>
          <li>
            <label>
              Up to: <input className='input-year' type="text" placeholder='YEAR'/>
            </label>
          </li>
        </ul>
      </div>
    </div>
  );
}


function GenreFilterButton({genres}) {
  return (
    <div className='filter-button-container'>
      <button className='filter-button'>Genres</button>
      <div className='filter-options' id="genre-options">
        <GenresList genres={genres}/>
      </div>
    </div>
  );
}


function GenresList(genres) {
  function searchGenres(e) {
    const text = e.target.value.toLowerCase();
    let elements = e.target.parentElement.getElementsByTagName("li");
    
    for (let i=0; i<elements.length; i++) {
      if (genres.genres[i].includes(text)) {
        elements[i].classList.remove("hidden");
      } else {
        elements[i].classList.add("hidden");
      }
    }
  }
  

  return(
    <>
      <input className='genres-search-bar' onChange={searchGenres} type="text"/>
      <ul>
        {genres.genres.length ? genres.genres.map(genre => <FilterOptionCheckbox name={genre} key={genre}/>) : <div>Get token to load genres</div>}
      </ul>
    </>
  );
}


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
  const REDIRECT_URI = "https://notthatgoodofaprogrammer.github.io/Music-recommendations";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";
  const perPage = 20; // default limit of elements on most API responses
  
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
  const typeparameter = useRef("");
  
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

    typeparameter.current = "&type=" + types;


    const isTagChecked = dateOptions.querySelector("input[type=checkbox]:checked");
    const tagParameter = (isTagChecked  &&  (typeparameter.current === "&type=album")) ? " tag:new" : "";


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
                    + tagParameter + yearParameter + genreParameter + typeparameter.current;
    
    return url;
  }

  
  async function searchDisplayData(url, notify = false) {
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
        setMusicistsData(data.artists ? data.artists.items : []);
        setPlaylistsData(data.playlists ? data.playlists.items : []);
        setTracksData(data.tracks ? data.tracks.items : []);

        const pageData = data.albums || data.artists || data.playlists || data.tracks;
        setPrevPage(addTypesToUrl(pageData.previous || null, typeparameter.current));
        setNextPage(addTypesToUrl(pageData.next || null, typeparameter.current));


      } else { // either artists albums, album tracks or playlist tracks; so there is only one type of data
        let playlistTracks = [];
        // disc_number is unique for album tracks  and  added_by is unique for plalists tracks
        if (data.items[0].disc_number) { // tracks from album by default don't have image provided
          const img = {url: document.getElementsByClassName("search-results-grid")[0].getElementsByClassName("result-image")[0].src};
          
          data.items.forEach(track => track.images = [img]);
          
        } else if (data.items[0].added_by) { // formatting data
          data.items.forEach(item => playlistTracks = [...playlistTracks, item.track]);
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


  function renderDisplayData(displayData, isPicked) {
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
        setAlbumsData={setAlbumsData}
        setMusicistsData={setMusicistsData}
        setPlaylistsData={setPlaylistsData}
        setTracksData={setTracksData}
        setPrevPage={setPrevPage}
        setNextPage={setNextPage}
        pickedMusic={pickedMusic}
        setPickedMusic={setPickedMusic}
        typeparameter={typeparameter}
        isPicked={isPicked}
        key={'' + elem.id + idx++}
      />
    ))
  }

  console.log(pickedMusic)
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
    <TokenContext.Provider value={token}>
      <div className="App">
        <div className='filters-bar'>
          <div className='picked-music-tab-container'>
            <button className='picked-music-tab'onClick={() =>document.getElementsByClassName("slide-in")[0].classList.add("shown")}>
              <img src={process.env.PUBLIC_URL + "/images/sideBar.png"} alt='side bar'/>
            </button>
            <div className='notification down'>
              <span>Added</span>
            </div>
          </div>
          <div className='filters-container'>
            <ul className='filters-list'>
              <li className='filter'>
                <TypesFilterButton/>
              </li>
              <li className='filter'>
                <DateFilterButton/>
              </li>
              <li className='filter'>
                <GenreFilterButton genres={genres}/>
              </li>
            </ul>
          </div>
          <div className='clear-data-button-container'>
            <button className='clear-data-button' onClick={() => localStorage.clear()}>
              <img src={process.env.PUBLIC_URL + "/images/cloudDataDelete.png"} alt='clear data'/>
            </button>
          </div>
        </div>
        <SlideIn 
          genres={genres}
          setAlbumsData={setAlbumsData}
          setMusicistsData={setMusicistsData}
          setPlaylistsData={setPlaylistsData}
          setTracksData={setTracksData}
          setPrevPage={setPrevPage}
          setNextPage={setNextPage}
          pickedMusic={pickedMusic}
          setPickedMusic={setPickedMusic}
          renderPicked={renderDisplayData}
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
              <form className='search-form' onSubmit={e => searchDisplayData(getUrlFromClient(e), true)}>
                <input className='search-input' type="text" ref={searchInput}/>
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
                {!! albumsData.length  &&  renderDisplayData(albumsData, false)}
                {!! artistsData.length  &&  renderDisplayData(artistsData, false)}
                {!! playlistsData.length  &&  renderDisplayData(playlistsData, false)}
                {!! tracksData.length  &&  renderDisplayData(tracksData, false)}
                {!! (albumsData.length  ||  artistsData.length  ||  playlistsData.length  ||  tracksData.length)
                ||  <Placeholder />}
              </div>
            </div>
          </div>
        </div>
        <footer>
          <div className='change-page-button-container'>
            <button className='change-page-button' disabled={! prevPage} onClick={() => searchDisplayData(prevPage)}>
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
              disabled={nextPage === null  || // Spotify allows setting an offset larger than the number of elements. This is in order to prevent empty pages being shown
                ! (albumsData.length >= perPage  ||  artistsData.length >= perPage  ||  playlistsData.length >= perPage  ||  tracksData.length >= perPage)}
              onClick={() => searchDisplayData(nextPage)}
            >
              <img src={process.env.PUBLIC_URL + "/images/nextPage.png"} alt='next page'/>
            </button>
          </div>
        </footer>
      </div>  
    </TokenContext.Provider>
  );
}

export default App;


function SlideIn({genres, setAlbumsData, setMusicistsData, setPlaylistsData, setTracksData,
  setPrevPage, setNextPage, pickedMusic, setPickedMusic, renderPicked}) {
  
  const token = React.useContext(TokenContext);

  async function seeResults() {
    let genres = [];

    const checkboxes = document.getElementsByClassName("fluid-row-content")[0].querySelectorAll("input[type=checkbox]:checked");
    Array.from(checkboxes).forEach(checkbox => genres = [...genres, checkbox.parentElement.innerText]);


    const pickedSearchResults = document.getElementsByClassName("picked-music-grid")[0].getElementsByClassName("search-result");
    
    const itemsCount = genres.length + pickedSearchResults.length;
    if (itemsCount > 0  &&  itemsCount <= 5) {
      let tracks = [];
      let artists = [];
      pickedMusic.forEach(music => {
        if (music.type === "track") tracks = [...tracks, music.id];
        else if (music.type === "artist") artists = [...artists, music.id];
      })


      let url = "https://api.spotify.com/v1/recommendations?market=PL";
      url += artists.length ? "&seed_artists=" + artists : "";
      url += genres.length ? "&seed_genres=" + genres : "";
      url += tracks.length ? "&seed_tracks=" + tracks : "";
      

      const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        let data = await response.json();
        
        setAlbumsData([]);
        setMusicistsData([]);
        setPlaylistsData([]);
        setTracksData(data.tracks);

        setPrevPage("");
        setNextPage("");


        document.getElementsByClassName("slide-in")[0].classList.remove("shown"); // show results immediately

      } else errorHandling(response);

    } else window.alert("Please choose between 1 and 5 items to get recommendations on.");
  }


  function resetProgress() {
    const checkboxes = document.getElementsByClassName("fluid-row-content")[0].querySelectorAll("input[type=checkbox]:checked");
    Array.from(checkboxes).forEach(checkbox => checkbox.checked = false);

    setPickedMusic([]);
  }

  
  return (
    <div className='slide-in'>
      <div className='slide-in-header'>
        <div className='close-slide-in-container'>
          <button className='close-slide-in' onClick={(e) => e.target.closest(".slide-in").classList.remove("shown")}>
            <img src={process.env.PUBLIC_URL + "/images/close.png"} alt='close'/>
          </button>
        </div>
        <div className='note-container'>
          <span className='note'>Only up to 5 choices can be selected in total from genres, artists and tracks.</span>
        </div>
      </div>
      <div className='user-contribution'>
        <div className='add-genres-container'>
          <div className='default-button-container'>
            <button>Add genre</button>
          </div>
          <div className='fluid-row'>
            <div className='fluid-row-content'>
              <GenresList genres={genres}/>
            </div>
          </div>
        </div>
        <div className='default-button-container'>
          <button onClick={seeResults}>See results</button>
        </div>
        <div className='default-button-container'>
          <button onClick={resetProgress}>Reset progress</button>
        </div>
      </div>
      <div className='picked-music-container'>
        <div className='picked-music-grid'>
          {pickedMusic.length && renderPicked(pickedMusic, true)}
        </div>
      </div>
    </div>
  );
}