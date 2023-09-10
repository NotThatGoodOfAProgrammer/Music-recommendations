import React from "react";


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


function FiltersBar({genres}) {
  return (
    <div className='filters-bar'>
      <div className='picked-music-tab-container'>
        <button className='picked-music-tab'onClick={() =>document.getElementsByClassName("slide-in")[0].classList.add("shown")}>
          <img src={process.env.PUBLIC_URL + "/images/sideBar.webp"} alt='side bar'/>
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
          <img src={process.env.PUBLIC_URL + "/images/cloudDataDelete.webp"} alt='clear data'/>
        </button>
      </div>
    </div>
  )
}

export {FiltersBar, GenresList};