import './App.css';
import React, { useEffect, useState, useRef } from "react"

export const TokenContext = React.createContext();

function errorHandling(response) {
  if (response.status === 400) {
    window.alert("Make sure to select type and either type search term or choose genre")
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
  
  const typeIndexStart = url.indexOf("&type", url.indexOf("?q="));
  if (typeIndexStart !== -1){
    const typeIndexEnd = url.indexOf("&", typeIndexStart +1);

    let newUrl = url.slice(0, typeIndexStart) + typeParameter;
    newUrl += (typeIndexEnd !== -1 ? url.slice(typeIndexEnd) : "");
    
    return newUrl;

  } else return url;
}


function AddButton({idForTracks, artistId, type, pickedArt, setPickedArt}) {
  function addArt(e) {
    const pickedNode = e.target.closest(".search-result");
    
    
    let pickedData = {type: type, id: idForTracks, artists: artistId};

    pickedData.images = [{url: pickedNode.getElementsByClassName("result-image")[0].src}];
    pickedData.name = pickedNode.getElementsByClassName("name")[0].innerText.slice(6);
    let spotifyHref = pickedNode.getElementsByClassName("result-info-container")[0].getElementsByTagName("a")[0].href
    pickedData.external_urls = {};
    pickedData.external_urls.spotify = spotifyHref;
    
    if (pickedArt.every(art => art.external_urls.spotify !== spotifyHref)) setPickedArt([...pickedArt, pickedData]);
  }


  return (
    <div className='result-button-container'>
      <button className='result-button' onClick={addArt}>
        <img src='/add.png' alt='add' loading='lazy'/>
      </button>
    </div>
  );
}


function ThrashButton({pickedArt, setPickedArt}) {
  function removeArt(e) {
    const pickedNode = e.target.closest(".search-result");
    const toDelete = pickedNode.getElementsByClassName("result-info-container")[0].getElementsByTagName("a")[0].href;

    setPickedArt(pickedArt.filter((elem) => {
      return elem.external_urls.spotify !== toDelete;
    }))
  }


  return (
    <div className='result-button-container'>
      <button className='result-button' onClick={removeArt}>
        <img src='/thrash.png' alt='thrash' loading='lazy'/>
      </button>
    </div>
  );
}


function ResultTemplate({type, img, name, idForTracks, artistId, spotifyUrl,
   setAlbumsData, setArtistsData, setPlaylistsData, setTracksData,
  setPrevPage, setNextPage, pickedArt, setPickedArt, isPicked}) {
  
  const token = React.useContext(TokenContext);

  let imgUrl = '';
  if (img !== undefined) {
    try {
      imgUrl = img[0].url;
    } catch(e) {
      imgUrl = img.url;
    }
  }
  
  let id = [];
  if (Array.isArray(artistId)) artistId.forEach(artist => id = [...id, artist.id]);
  else id = artistId;


  async function artistFetching() {
    let url;
    if (type === "artist") url = "https://api.spotify.com/v1/artists/" + id + "/albums";
    else if (type === "album"  ||  type === "track") url =  "https://api.spotify.com/v1/artists?ids=" + id;
    
    const response = await fetch(url, {
      headers: {
          Authorization: `Bearer ${token}`
    }})

    if (response.ok) {
      const data = await response.json();
      
      setAlbumsData(data.items ? data.items : []);
      setArtistsData(data.artists ? data.artists : []);
      setPlaylistsData([]);
      setTracksData([]);
      
      const typeParameter = "&type=" + data.items ? "album" : "artist";
      setPrevPage(addTypesToUrl(data.previous, typeParameter));
      setNextPage(addTypesToUrl(data.next, typeParameter));
    
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
    }})

    if (response.ok) {
      let data = await response.json();

      let playlistTracks = [];
      if (type === "album") {
        data.items.forEach(track => track.images = img);

      } else if (type === "playlist") {
        data.items.forEach(item => playlistTracks = [...playlistTracks, item.track])
      }

      setArtistsData([]);
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
      <img className='result-image' alt={imgUrl ? name : ""} src={imgUrl || "/noImage.png"} loading='lazy'></img>
      <div className='result-info-container'>
        <span className='name'>{"Name: " + name}</span>
        {type !== "playlist"  &&  <button onClick={artistFetching}>{"See " + (type === "artist" ? "albums" : "artists")}</button>}
        {type !== "track"  &&  <button onClick={trackFetching}>See tracks</button>}
        <a href={spotifyUrl}>Check in Spotify</a>
      </div>
        {(type === "album"  ||  type === "artist") &&
        (isPicked ?
        <ThrashButton
          pickedArt={pickedArt}
          setPickedArt={setPickedArt}/>
        :
        <AddButton
          idForTracks={idForTracks}
          artistId={artistId}
          type={type}
          pickedArt={pickedArt}
          setPickedArt={setPickedArt}/>
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
  const types = ["album", "artist", "playlist", "track"]

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
      <button className='filter-button'>Release Date</button>
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
      if (genres.genres[i].toLowerCase().indexOf(text) > -1) {
        elements[i].classList.remove("hidden");
      } else {
        elements[i].classList.add("hidden");
      }
    }
  }
  

  return(
    <>
      <input className='genres-search-bar' onChange={searchGenres} type="text"></input>
      <ul>
        {genres.genres.length ? genres.genres.map(genre => <FilterOptionCheckbox name={genre} key={genre}/>) : <div>Loading</div>}
      </ul>
    </>
  );
}


function Placeholder() {
  return (
    <div className='placeholder'>
      <h2>Results not found</h2>
      <img src="/notFound.png" alt="results not found" />
      <span>Try changing filters and search text</span>
    </div>
  )
}


function App() {
  const CLIENT_ID = "eae286ae2c30452f876d62116733da2a";
  const REDIRECT_URI = "http://localhost:3000";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";
  
  const [token, setToken] = useState("");
  const searchInput = useRef();
  const [albumsData, setAlbumsData] = useState([]);
  const [artistsData, setArtistsData] = useState([]);
  const [playlistsData, setPlaylistsData] = useState([]);
  const [tracksData, setTracksData] = useState([]);
  const [genres, setGenres] = useState([]);
  const [prevPage, setPrevPage] = useState("");
  const [nextPage, setNextPage] = useState("");
  const [pickedArt, setPickedArt] = useState([]);
  
  useEffect(() => {
    const hash = window.location.hash;
    let tmpToken = window.localStorage.getItem("token");

    if (!tmpToken && hash) {
        const tmpToken = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1];

        window.location.hash = "";
        window.localStorage.setItem("token", tmpToken);
    }

    setToken(tmpToken);

  }, [])

  
  useEffect(() => {
    const fetchGenres =  async() => {
      if (token) {
        let response = await fetch("https://api.spotify.com/v1/recommendations/available-genre-seeds", {
          headers: {
              Authorization: `Bearer ${token}`
          }});
    
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

    const tagParameter = dateOptions.querySelector("input[type=checkbox]:checked") ? " tag:new" : "";

    const yearInputs = dateOptions.querySelectorAll("input[type=text]");
    const regex = /1|2\d\d\d/;
    const startDate = yearInputs[0].value;
    const endDate = yearInputs[1].value;
    const yearParameter = (regex.test(startDate)  &&  regex.test(endDate)) ? " year:" + startDate + '-' + endDate : "";

    const genreCheckboxes = genreOptions.querySelectorAll("input[type=checkbox]:checked");
    let genreParameter = " ";
    Array.from(genreCheckboxes).forEach(checkbox => {
      genreParameter += (" genre:\"" + checkbox.parentElement.innerText + "\"");
    })

    const typeCheckboxes = typesOptions.querySelectorAll("input[type=checkbox]:checked");
    let types = [];
    Array.from(typeCheckboxes).forEach(checkbox => {
      types = [...types, checkbox.parentElement.innerText];
    })
    const typeParameter = "&type=" + types;
    
    const url = "https://api.spotify.com/v1/search?q=" + searchInput.current.value + tagParameter + yearParameter + genreParameter + typeParameter;

    return url;
  }


  async function searchDisplayData(url) {
    
    const typeIndexStart = url.indexOf("&type", url.indexOf("?q="));
    const typeIndexEnd = url.indexOf("&", typeIndexStart +1);
    
    let typeParameter;
    if (typeIndexEnd !== -1) typeParameter = url.slice(typeIndexStart, typeIndexEnd);
    else typeParameter = url.slice(typeIndexStart);
  
    const response = await fetch(url, {
      headers: {
          Authorization: `Bearer ${token}`
      }})
    
    if (response.ok) {
      const data = await response.json();
      
      setAlbumsData(data.albums ? data.albums.items : []);
      setArtistsData(data.artists ? data.artists.items : []);
      setPlaylistsData(data.playlists ? data.playlists.items : []);
      if (data.items) {
        let playlistTracks = [];
        data.items.forEach(item => playlistTracks = [...playlistTracks, item.track]);

        setTracksData(playlistTracks);
        setPrevPage(data.previous);
        setNextPage(data.next);

      } else {
        setTracksData(data.tracks ? data.tracks.items : []);

        const pageData = data.albums || data.artists || data.playlists || data.tracks;
        setPrevPage(addTypesToUrl(pageData.previous || null, typeParameter));
        setNextPage(addTypesToUrl(pageData.next || null, typeParameter));
      }

    } else errorHandling(response);
  }


  function renderDisplayData(displayData, isPicked) {
    let idx = 0;
    return displayData.map(elem => (
      <ResultTemplate
        type={elem.type}
        img={elem.images  ||  elem.album.images}
        name={elem.name}
        idForTracks={elem.id}
        artistId={elem.artists ? elem.artists : elem.id}
        spotifyUrl={elem.external_urls.spotify}
        setAlbumsData={setAlbumsData}
        setArtistsData={setArtistsData}
        setPlaylistsData={setPlaylistsData}
        setTracksData={setTracksData}
        setPrevPage={setPrevPage}
        setNextPage={setNextPage}
        pickedArt={pickedArt}
        setPickedArt={setPickedArt}
        isPicked={isPicked}
        key={'' + elem.id + elem.external_urls.spotify + idx++}
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
    <TokenContext.Provider value={token}>
      <div className="App">
        <nav>
          <div className='picked-art-tab-container'>
            <button className='picked-art-tab' onClick={() =>document.getElementsByClassName("slide-in")[0].classList.add("shown")}><img src="/sideBar.png" alt='side bar'></img></button>
          </div>
          <div className='filters-slider-container'>
            <ul className='filters-list'>
              <li className='filter'>
                <TypesFilterButton />
              </li>
              <li className='filter'>
                <DateFilterButton />
              </li>
              <li className='filter'>
                <GenreFilterButton genres={genres}/>
              </li>
            </ul>
          </div>
          <div className='pop-up-button-container'>
            <button className='pop-up-button' onClick={() => localStorage.clear()}><img src="/cloudDataDelete.png" alt='info'></img></button>
          </div>
        </nav>
        <SlideIn 
          genres={genres}
          setAlbumsData={setAlbumsData}
          setArtistsData={setArtistsData}
          setPlaylistsData={setPlaylistsData}
          setTracksData={setTracksData}
          setPrevPage={setPrevPage}
          setNextPage={setNextPage}
          pickedArt={pickedArt}
          setPickedArt={setPickedArt}
          renderPicked={renderDisplayData}/>
        <div className='site-content'>
          <div className='user-contribution'>
            <div className='default-button-container'>
              <a className='default-button' href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>Get a Token</a>
            </div>
            <div className='default-button-container'>
              <button className='default-button' onClick={resetFilters}>Reset Filters</button>
            </div>
            <div className='search-container'>
              <form className='search-form' onSubmit={e => searchDisplayData(getUrlFromClient(e))}>
                <input className='search-input' type="text" ref={searchInput}></input>
                <button className='submit-button' type='submit'>Submit</button>
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
          <div className='prev-page-button-container'>
            <button className={'prev-page-button' + (prevPage ? '' : " disabled")} disabled={prevPage === null} onClick={() => searchDisplayData(prevPage)}>
              <img src="/prevPage.png" alt='prev page'/>
            </button>
          </div>
          <div className='credits-container'>
            <label>
              Made by: Armatys Konrad
              <br/>
              <a href='https://github.com/NotThatGoodOfAProgrammer' target="_blank">Github</a>
            </label>
          </div>
          <div className='next-page-button-container'>
            <button className={'next-page-button' + (nextPage ? '' : " disabled")} disabled={nextPage === null} onClick={() => searchDisplayData(nextPage)}>
              <img src="/nextPage.png" alt='next page'/>
            </button>
          </div>
        </footer>
      </div>  
    </TokenContext.Provider>
  );
}

export default App;


function SlideIn({genres, setAlbumsData, setArtistsData, setPlaylistsData, setTracksData,
  setPrevPage, setNextPage, pickedArt, setPickedArt, renderPicked}) {
  
    const token = React.useContext(TokenContext);

  async function seeResults() {
    const checkboxes = document.getElementsByClassName("fluid-row-content")[0].querySelectorAll("input[type=checkbox]:checked");
    let genres = [];
    Array.from(checkboxes).forEach(checkbox => genres = [...genres, checkbox.parentElement.innerText]);

    const pickedSearchResults = document.getElementsByClassName("picked-art-grid")[0].getElementsByClassName("search-result");
    
    const itemsCount = genres.length + pickedSearchResults.length;
    if (itemsCount > 0  &&  itemsCount <= 5) {
      let url = "https://api.spotify.com/v1/recommendations?market=PL";
      
      let albums = [];
      let artists = [];
      pickedArt.forEach(art => {
        if (art.type === "album") albums = [...albums, art.id];
        else if (art.type === "artist") artists = [...artists, art.id];
      })

      url += albums ? "&seed_albums=" + albums : "";
      url += artists ? "&seed_artists=" + artists : "";
      url += genres.length ? "&seed_genres=" + genres : "";
      
      const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }})

      if (response.ok) {
        let data = await response.json();
        
        setAlbumsData([]);
        setArtistsData([]);
        setPlaylistsData([]);
        setTracksData(data.tracks);

        setPrevPage("");
        setNextPage("");

        document.getElementsByClassName("slide-in")[0].classList.remove("shown");

      } else errorHandling(response);

    } else window.alert("Please choose between 1 and 5 items to get recommendations on.")
  }


  function resetProgress() {
    const checkboxes = document.getElementsByClassName("fluid-row-content")[0].querySelectorAll("input[type=checkbox]:checked");
    Array.from(checkboxes).forEach(checkbox => checkbox.checked = false);

    setPickedArt([]);
  }

  
  return (
    <div className='slide-in'>
      <div className='slide-in-header'>
        <div className='close-slide-in-container'>
          <button className='close-slide-in' onClick={(e) => e.target.closest(".slide-in").classList.remove("shown")}><img src="/close.png" alt='close'></img></button>
        </div>
        <div className='note-container'>
          <span className='note'>Only up to 5 choices can be selected including genres, artists and tracks.</span>
        </div>
      </div>
      <div className='user-contribution'>
        <div className='add-genres'>
            <div className='default-button-container'>
            <button className='default-button'>Add genre</button>
          </div>
          <div className='fluid-row'>
            <div className='fluid-row-content'>
              <GenresList genres={genres}/>
            </div>
          </div>
        </div>
        <div className='default-button-container'>
          <button className='default-button' onClick={seeResults}>See results</button>
        </div>
        <div className='default-button-container'>
          <button className='default-button' onClick={resetProgress}>Reset progress</button>
        </div>
      </div>
      <div className='picked-art-container'>
        <div className='picked-art-grid'>
          {pickedArt.length && renderPicked(pickedArt, true)}
        </div>
      </div>
    </div>
);
}


function PopUp() {
  return (
    <div className='pop-up'>
      <div className='grayed-background'>
        <div className='important-notice'>
          <div className='log-out-container'>
            <button className='default-button'>Log out</button>
          </div>
          <div className='close-slide-in-container'>
            <button className='close-slide-in' onClick={(e) => e.target.closest(".pop-up").classList.remove("shown")}><img src="/close.png" alt='close'></img></button>
          </div>
          <div className='data-storage-notice'>
            <span>
              Bla bla bla.
            </span>
          </div>
          <div className='client-id-notice'>
            <span>
              Ble ble ble.
            </span>
          </div>
          <a>Guide on how to get Spotify Client Id</a>
        </div>
      </div>
    </div>
  );
}