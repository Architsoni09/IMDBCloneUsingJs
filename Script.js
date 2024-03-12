// Selecting DOM elements
const searchInputField = document.getElementById('movieSearch');
const searchForm = document.querySelector('form[role="search"]');
let favouriteMovieArray = [];
let movieDetailsArray = [];
let defaultHtmlContents=''
// let rightSideDivOfTypeFavourites='<div class="favMovieHeader" style="display:none;"><h2>ListOfMyFavouriteMovies</h2></div><ul id="favouriteMovieUl" style="width:100%" class="mt-5h-100d-flexflex-column"></ul>`;';
let movieDetailsShouldBeDisplayed = true;
let favouriteMoviesShouldBeDisplayed = false;
let movieDescriptionViewIsEnabled=false;
// Adding a click event listener to the document
document.addEventListener('click', function (event) {
    if (event.target !== searchInputField && !searchForm.contains(event.target) && event.target.id !== 'movieSuggestions') {
        removeSuggestions();
        searchInputField.value = '';
    }
});
// Switch the image every 5 seconds
let slideIndex = 0;
let intervalId = setInterval(() => {
    if(movieDetailsShouldBeDisplayed) {
        // Remove 'active' class from current active item
        const activeItem = document.querySelector('.carousel-item.active');
        activeItem.classList.remove('active');

        // Increment slideIndex and select next item
        slideIndex = (slideIndex + 1) % 3;
        const nextItem = document.querySelectorAll('.carousel-item')[slideIndex];

        // Add 'active' class to next item
        nextItem.classList.add('active');
        displayMovieDetails();
    }
}, 5000);


// Event listeners for search functionality
searchForm.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the default form submission
    movieSearchResult(); // Execute movie search
    removeSuggestions(); // Remove search suggestions
    hideUl(); // Hide the search results list
});
searchInputField.addEventListener('input', movieSuggestions); // Event listener for input changes
document.addEventListener('DOMContentLoaded', defaultMovies); // Event listener for page load

// Fetch functions

async function movieSearchResult() {
    const searchTerm = searchInputField.value.toString();
    const response = await fetch(`https://www.omdbapi.com/?s=${searchTerm}&apikey=d6b1fc20`);
    const data = await response.json();
    moviePageEventHandler(data.Search[0]); // Update main carousel
    data.Search.forEach((obj) => movieDetailsArray.push(obj));
}

async function defaultMovies() {
    const response = await fetch(`https://www.omdbapi.com/?s=spider&type=movie&apikey=d6b1fc20`);
    const movieData = await response.json();
    console.log(movieData);
    defaultCarouselContents(movieData.Search); // Update default carousel
    movieData.Search.forEach((obj) => movieDetailsArray.push(obj));
    displayMovieDetails();
}

async function movieSuggestions(event) {
    removeSuggestions(); // Remove existing suggestions
    if (event.target.value.length >= 3) {
        const response = await fetch(`https://www.omdbapi.com/?s=${event.target.value}&type=movie&apikey=d6b1fc20`);
        const result = await response.json();
        result.Search.forEach((obj) => movieDetailsArray.push(obj));

        displayUl(event);
        for (let i = 0; i < 4; i++) {
            if (result.Search[i]) {
                displaySuggestions(result.Search[i]);
            }
        }
        for (let i = 0; i < 4; i++) {
            if (result.Search[i]) {
                addToFavouritesIcon(result.Search[i]);
            }
        }
    }
}

// Utility functions

function defaultCarouselContents(movieArray) {
    let indexSet = new Set;
    while (indexSet.size < 3) {
        indexSet.add(Math.floor(Math.random() * movieArray.length));
    }
    const index = Array.from(indexSet);
    // Main
    const mainImg = document.getElementById('mainImage');
    mainImg.src = movieArray[index[0]].Poster;

    // Second
    const secondImg = document.getElementById('secondImage');
    secondImg.src = movieArray[index[1]].Poster;

    // Third
    const thirdImg = document.getElementById('thirdImage');
    thirdImg.src = movieArray[index[2]].Poster;
}


function displayUl(event) {
    const list = document.getElementById('movieSuggestions');
    if (!list.classList.contains('d-block')) {
        list.classList.add('d-block');
    } else if (event.target.value === '' && list.classList.contains('d-block')) {
        list.classList.remove('d-block');
    }
}

function hideUl() {
    const list = document.getElementById('movieSuggestions');
    list.classList.remove('d-block');
}

function displaySuggestions(object) {
    const listItemHTML = `
    <div class="bg-black text-warning">
        <div class="d-flex">
            <div class="col-md-3">
                <img id="img+${object.Title}" src="${object.Poster}" class="img-fluid rounded-start" style="height: 80px; width: 80px;" alt="...">
            </div>
            <div class="col-md-7 p-2">
                <h6>${object.Title}</h6>Movie Released Year ${object.Year}
            </div>
            <div id="iconParent" class="col-md-2 p-2 align-self-center">
            <i class="fa-regular fa-star fa-lg" style="color: #FFD43B;"></i>
            </div>
        </div>
    </div>
`;
    const tempLi = document.createElement('li');
    tempLi.style.width = '100%';
    tempLi.classList.add('mb-1');
    tempLi.id = object.Title;
    tempLi.innerHTML = listItemHTML;
    const list = document.getElementById('movieSuggestions');
    list.appendChild(tempLi);
    const img=document.getElementById(`img+${object.Title}`)
    img.addEventListener('click',()=>moviePageEventHandler(object));
}
function moviePageEventHandler(object){
    if(!movieDescriptionViewIsEnabled){
    movieDetailsShouldBeDisplayed=false;
    const container = document.getElementById('container');
    removeDefaultHtmlContent();
    let movieDescPage=`<div id="movieDescView" class="row" style="height: 95vh;">
        <div class=" d-flex justify-content-center align-items-center h-100 col-6">
            <img src="${object.Poster}" class="img-fluid h-75" alt="">
        </div>
        <div class="col-6 d-flex justify-content-center align-items-center">
            <div class="card bg-black h-50 w-50 " style="color: white; max-width: 18rem;border: 2px solid #ffc107">
                <div class="card-header">Movie Details</div>
                <div class="card-body" style="border-top: 2px solid #ffc107">
                    <h5 class="card-title">${object.Title}</h5>
                    <p class="card-text">Type:- ${object.Type} <br> Release Year:- ${object.Year} <br> </p>
                </div>
            </div>
        </div>
    </div>`;
    container.insertAdjacentHTML('beforeend', movieDescPage);
    movieDescriptionViewIsEnabled=true;
    removeSuggestions();

    }
    else {
        updateMovieDetails(object);
        removeSuggestions();
    }
}
function removeDefaultHtmlContent(){
    const div=document.getElementById('defaultViewDiv');
    defaultHtmlContents=div.outerHTML;
    console.log(defaultHtmlContents);
    div.remove();
}
function updateMovieDetails(object){
    console.log(object);
 let newDiv=`<div class=" d-flex justify-content-center align-items-center h-100 col-6">
            <img src="${object.Poster}" class="img-fluid h-75" alt="">
        </div>
        <div class="col-6 d-flex justify-content-center align-items-center">
            <div class="card bg-black h-50 w-50 " style="color: white; max-width: 18rem;border: 2px solid #ffc107">
                <div class="card-header">Movie Details</div>
                <div class="card-body" style="border-top: 2px solid #ffc107">
                    <h5 class="card-title">${object.Title}</h5>
                    <p class="card-text">Type:- ${object.Type} <br> Release Year:- ${object.Year} <br> </p>
                </div>
            </div>
        </div>`;
 const movieDescView=document.getElementById('movieDescView');
 movieDescView.innerHTML=newDiv;
}
function removeSuggestions() {
    const list = document.getElementById('movieSuggestions');
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }
}


function addToFavouritesIcon(movieObject) {
    const listItem = document.getElementById(movieObject.Title); // Select the list item by its ID
    if (listItem) {
        const star = listItem.querySelector('.fa-regular');
        if (star) {
            star.addEventListener('click', (event) => addToFavHandler(event, listItem)); // Pass the movie object to addToFavHandler
        }
    }

}

function addToFavHandler(event, listItem) {
    const star = event.target;
    const movieTitle = listItem.querySelector('h6').innerText;
    const movieHTML = listItem.innerHTML;
    const movie = {title: movieTitle, html: movieHTML};

    if (star.classList.contains('fa-regular')) {
        star.classList.remove('fa-regular');
        star.classList.add('fa-solid');
        console.log("Adding movie:", movie);
        favouriteMovieArray.push(movie);
        console.log("Favourites array after adding:", favouriteMovieArray);
    } else {
        star.classList.remove('fa-solid');
        star.classList.add('fa-regular');
        console.log("Removing movie:", movie);
        favouriteMovieArray = favouriteMovieArray.filter((m) => m.title.trim() !== movie.title.trim());
        console.log("Favourites array after removing:", favouriteMovieArray);
    }
}

// Favourite Movies

const favouriteMovieBtn = document.getElementById('favouritesBtn');
favouriteMovieBtn.addEventListener('click', favouriteMoviesDisplayEventHandler);

function favouriteMoviesDisplayEventHandler() {
   if(favouriteMoviesShouldBeDisplayed===true) {
       if (favouriteMovieArray.length === 0) {
           addFavouriteMovieHeader();
           favouriteMoviesShouldBeDisplayed=false;
           movieDetailsShouldBeDisplayed=false;
       } else {
           addFavouriteMovieHeader();
           const ul = document.getElementById('favouriteMovieUl');
           favouriteMovieArray.forEach((movie, index) => {
               const li = document.createElement('li');
               li.innerHTML = movie.html;
               li.id = index.toString();
               li.classList.add('mb-2');
               li.style.backgroundColor = 'gold';
               const iconParent = li.querySelector('#iconParent');
               const starIcon = iconParent.querySelector('.fa-star');
               if (starIcon) {
                   iconParent.removeChild(starIcon);
                   const Xicon = document.createElement('i');
                   Xicon.innerHTML = `<i class="fa-solid fa-xmark fa-xl" style="color: #FFD43B;"></i>`;
                   Xicon.addEventListener('click', () => removeFromPlaylist(index.toString(), movie));
                   iconParent.appendChild(Xicon);
               }
               ul.appendChild(li);
           });
           favouriteMoviesShouldBeDisplayed=false;
           movieDetailsShouldBeDisplayed=false;
       }
   }
   else{
       favouriteMoviesShouldBeDisplayed=true;
       movieDetailsShouldBeDisplayed=true;
       displayMovieDetails();
   }
}

function removeFromPlaylist(index, movie) {
    const li = document.getElementById(index);
    li.remove();
    favouriteMovieArray = favouriteMovieArray.filter((movies) => movies !== movie);
}

function addFavouriteMovieHeader() {
    const rightParentDiv=document.getElementById('rightSideParent');
    rightParentDiv.removeAttribute('class');
    rightParentDiv.innerHTML='';
    rightParentDiv.innerHTML=`<div class="favMovieHeader" style="display: flex;">
            <h2> List Of My Favourite Movies </h2>
        </div>
        <ul id="favouriteMovieUl" style="width: 100%" class="mt-5 h-100 d-flex flex-column"></ul>`;
}

// display default Movie Details
function displayMovieDetails() {
    movieDetailsShouldBeDisplayed=true;
    const activeMovie = document.getElementsByClassName('carousel-item active')[0];
    const activeImage = activeMovie.querySelector('img');
    const activeImageUrl = activeImage.src;
    const activeMovieObject = movieDetailsArray.find((movies) => movies.Poster === activeImageUrl);
    changeMovie(activeMovieObject);
}
function changeMovie(activeMovieObject){
    let detailCard =
        `<div class="card bg-black h-50 w-50 " style="color: white; max-width: 18rem;border: 2px solid #ffc107">
        <div class="card-header">Movie Details</div>
        <div class="card-body" style="border-top: 2px solid #ffc107">
        <h5 id="moviePageHeader" class="card-title">${activeMovieObject.Title}</h5>
        <p id="moviePageDetails" class="card-text">Type:- ${activeMovieObject.Type} <br> Release Year:- ${activeMovieObject.Year} <br> </p>
        </div>
        </div>`;
    const rightParentDiv=document.getElementById('rightSideParent');
    rightParentDiv.innerHTML='';
    rightParentDiv.classList.add('d-flex', 'justify-content-center', 'align-items-center');
    rightParentDiv.innerHTML=detailCard;
}

// home Button Configuration
const homeButton= document.getElementById('homeButton');
homeButton.addEventListener('click',homeButtonEventHandler);
function homeButtonEventHandler(){
    movieDescriptionViewIsEnabled=false;
    removeMovieDescriptionView();
    const rightParentDiv=document.getElementById('rightSideParent');
    rightParentDiv.classList.add('d-flex', 'justify-content-center', 'align-items-center');
    displayMovieDetails();
}
function removeMovieDescriptionView(){
    const div=document.getElementById('movieDescView');
    div.remove();
    const container=document.getElementById('container');
    container.insertAdjacentHTML('beforeend',defaultHtmlContents);
}

