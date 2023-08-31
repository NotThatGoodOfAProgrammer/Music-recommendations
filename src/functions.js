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

export {errorHandling, addTypesToUrl};