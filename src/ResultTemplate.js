import React from "react"
import {errorHandling} from './functions.js';


function AddButton({idForTracks, artistId, type, pickedMusic, setPickedMusic}) {
  function addMusic(e) {
    const pickedNode = e.target.closest(".search-result");
    
    // processing data to make it same as from Spotify whilst including only necessary data
    let pickedData = {type: type, id: idForTracks, artists: [{url: artistId}]};


    pickedData.images = [{url: pickedNode.getElementsByClassName("result-image")[0].src}];
    pickedData.name = pickedNode.getElementsByClassName("name")[0].innerText;

    let spotifyHref = pickedNode.getElementsByClassName("result-info-container")[0].getElementsByTagName("a")[0].href;
    pickedData.external_urls = {};
    pickedData.external_urls.spotify = spotifyHref;
    

    if (pickedMusic.every(music => music.external_urls.spotify !== spotifyHref)) setPickedMusic([...pickedMusic, pickedData]); // avoiding duplicates

    
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
  maxPerPage, typeParameter, isPicked, fetchData, pickedMusic, setPickedMusic}) {
  

  async function artistFetching() {
    typeParameter.current = "&type=" + type;
    typeParameter.dataLimit = maxPerPage;

    let url;
    if (type === "artist") url = "https://api.spotify.com/v1/artists/" + artistId + "/albums?limit=" + typeParameter.dataLimit;
    else if (type === "album"  ||  type === "track") url =  "https://api.spotify.com/v1/artists?ids=" + artistId;
    

    fetchData(url);
  }


  async function trackFetching() {
    typeParameter.current = "&type=" + type;
    typeParameter.dataLimit = maxPerPage;

    let url;
    if (type === "album") url = "https://api.spotify.com/v1/albums/" + idForTracks + "/tracks?market=pl&limit=" + typeParameter.dataLimit;
    else if (type === "artist") url = "https://api.spotify.com/v1/artists/" + idForTracks + "/top-tracks?market=pl";
    else if (type === "playlist") url = "https://api.spotify.com/v1/playlists/" + idForTracks + "/tracks?market=pl&limit=" + typeParameter.dataLimit;
    

    fetchData(url);
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

export default ResultTemplate;