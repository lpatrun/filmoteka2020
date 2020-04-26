const movieData = <any>{};
const movieGenresState = <any>{};
const movieGenresDB = <any>{};
const movieRates = <any>{};

/***********************
 ****Dohvaćanje baza****
 **********************/

const controlResults = async () => {
    const query = 'https://api.themoviedb.org/3/discover/movie?api_key=5945a0abd9acd913047172b2e6571d3e&sort_by=popularity.desc&include_adult=false&include_video=false&page=1';

    movieData.search = new Search(query);
    await movieData.search.getResults();
    renderMovies(movieData.search.result); 
}

const genreResults = async () => {
    const query = 'https://api.themoviedb.org/3/genre/movie/list?api_key=5945a0abd9acd913047172b2e6571d3e';
    
    movieGenresState.search = new Search(query);
    await movieGenresState.search.getGenresResults();
}

const rouletteResults = async (genreId: any) => {
    const query = `https://api.themoviedb.org/3/discover/movie?api_key=5945a0abd9acd913047172b2e6571d3e&with_genres=${genreId}`;
    
    movieGenresDB.search = new Search (query);
    await movieGenresDB.search.getRouleteResults();
    generateOneMovieByGenre(movieGenresDB.search.genreId.data.results); 
}

class Search {
    query: string;
    result: any;
    genre: any;
    genreId: any;
    constructor (query: string){
        this.query = query;
    }
    async getResults () {  
        try {
            const res = await axios(`${this.query}`);
            this.result = res.data.results;        
        } catch (error) {
            alert(error);
        }   
    }
    async getGenresResults (){
        try {
            const gen = await axios(`${this.query}`);
            this.genre = gen;        
        } catch (error) {
            alert(error);
        } 
    }
    async getRouleteResults (){
        try {
            const genId = await axios(`${this.query}`);
            this.genreId = genId;        
        } catch (error) {
            alert(error);
        }
    }
}

/***********************************************************
 ****ograničavanje broja riječi u nazivu i godini objave****
 **********************************************************/

const maximumNameLength = 25;

const limitMovieTitle = (title: string) => {
    if( title.length > maximumNameLength) {
        return(title.slice(0, maximumNameLength-3) + "...")
    } else return title;
}

const limitMovieYear = (year: string) => {
    return(year.slice(0, 4));
}


const renderer = document.querySelector('.render-movies') as HTMLElement;
const buttonLoadMore = document.querySelector('.button__load-more') as HTMLElement;
const navigacija = document.getElementById("myNav") as HTMLElement;
const overlayContent = document.querySelector('.overlay__content') as HTMLElement;
const element = document.querySelector('.button__load-more') as HTMLElement;
const buttonMovieRoulette = document.querySelector('.button__movie-roulette') as HTMLElement;

/*********************************
 ****rendera filmove u li-jeve****
 ********************************/

const renderMovie = (movie: { poster_path: string; title: string; release_date: string; original_language: string; vote_average: string; }, i: number) => {
    const markup = `
    <li class="movie col-1-of-4"  data-itemid=${i}>
        <div class="movie__img"><img src ="https://image.tmdb.org/t/p/w185/${movie.poster_path}" alt="${movie.title}"></div>
        <div class="movie__name-year">${limitMovieTitle(movie.title)} (${limitMovieYear(movie.release_date)})</div>
        <div class="movie__lang">Language: ${movie.original_language}</div>
        <div class="movie__rating">Rating: ${movie.vote_average}</div>
    </li>
    `;
    renderer.insertAdjacentHTML('beforeend', markup);
}

let startingMovie = 0, endingMovie = 3;

const renderMovies = (movies: { poster_path: string; title: string; release_date: string; original_language: string; vote_average: string; }[]) => {
    //console.log(movies);
    for (startingMovie; startingMovie <= endingMovie ; startingMovie++){
        renderMovie(movies[startingMovie], startingMovie);
    }
    //movies.forEach(renderMovie);
    renderer.insertAdjacentHTML('beforeend', '<div class="clear"></div>');
}

/***************************************
 ****gumb za učitavanje reda filmova****
 **************************************/


buttonLoadMore.addEventListener('click', e => {
    e.preventDefault();
    endingMovie += 4;
    renderMovies(movieData.search.result);
    if ( (endingMovie + 4) > 20) {
        
        element.parentNode.removeChild(element);
    }
});

/*****************************************
 ****render za određeni film u overlay****
 ****************************************/

let stars = `<span class='star' id="1" onclick="saveStar(this.id)">☆</span>
<span class='star' id="2" onclick="saveStar(this.id)">☆</span>
<span class='star' id="3" onclick="saveStar(this.id)">☆</span>
<span class='star' id="4" onclick="saveStar(this.id)">☆</span>
<span class='star' id="5" onclick="saveStar(this.id)">☆</span>
<span class='star' id="6" onclick="saveStar(this.id)">☆</span>
<span class='star' id="7" onclick="saveStar(this.id)">☆</span>
<span class='star' id="8" onclick="saveStar(this.id)">☆</span>
<span class='star' id="9" onclick="saveStar(this.id)">☆</span>
<span class='star' id="10" onclick="saveStar(this.id)">☆</span>`;

const renderAMovie = (movie: { title: string; release_date: string; backdrop_path: string; id: string;
    overview: string; vote_average: string; popularity: string; original_language: string; }, i: number) => {
    const markup = `
    <li class="movie-ol"  data-itemid=${i}>
        <div class="movie-ol__first-row">
            <div class="movie-ol__name-year-ol">${movie.title} (${limitMovieYear(movie.release_date)})</div>
            <a class="closebtn" onclick="clearOverlay()">&times;</a>
        </div>
        <div class="movie-ol__img-ol" style = background-image:url("https://image.tmdb.org/t/p/w780/${movie.backdrop_path}"); alt="${movie.title}">
            <div class='rating movie-ol__star-rating-ol' data-itemid=${movie.id}>
                ${stars}
            </div>    
        </div>
        <div class="movie-ol__overview-ol"><strong>Overview</strong>: ${movie.overview}</div>
        <div class="movie-ol__rating-ol"><b>Rating:</b> <em>${movie.vote_average}</em></div>
        <div class="movie-ol__popularity-ol"><b>Popularity:</b> <em>${movie.popularity}</em></div>
        <div class="movie-ol__lang-ol"><b>Language:</b> <em>${movie.original_language}</em></div>
        
    </li>
    `;
    const renderOneMovie = document.querySelector('.render-a-movie') as HTMLElement;
    renderOneMovie.insertAdjacentHTML('beforeend', markup);
    getRating(`${parseInt(movie.id)}`);
}



/*********************************
 ****event listener na filmove****
 ********************************/

renderer.addEventListener ('click', e=>{ 
    const id = e.target.closest('.movie').dataset.itemid;
    navigacija.style.display = "block";
    const miniMarkup =`<ul class="render-a-movie"></ul>`;
    overlayContent.insertAdjacentHTML('beforeend', miniMarkup); 
    renderAMovie(movieData.search.result[id], id);
});

/*******************************************************
 ****event listener na gumb za zatvaranje u overleju****
 ******************************************************/

/* document.querySelector('.closebtn').addEventListener ('click', e=> {
    document.getElementById("myNav").style.display = "none";
    let list = document.querySelector('.overlay__content');
    while (list.hasChildNodes()){
        list.removeChild(list.firstChild);
    }
});
 */

function clearOverlay() { 
    navigacija.style.display = "none";
    while (overlayContent.hasChildNodes()){
        overlayContent.removeChild(overlayContent.firstChild);
    }   
}

/*****************************************
****da se overlay može zatvoriti s esc****
*****************************************/

let escapeKey = 27;

  document.addEventListener('keydown', function(event) {
    if (event.keyCode == escapeKey || event.which == escapeKey) {
        navigacija.style.display = "none";
        while (overlayContent.hasChildNodes()){ overlayContent.removeChild(overlayContent.firstChild);   }
    }
});

/**************************************
 ****event listener na rulet button****
 *************************************/

buttonMovieRoulette.addEventListener('click', e => {
    e.preventDefault();
    navigacija.style.display = "block";
    const miniMarkup =`<div class="form__row"><a class="form__close-btn" onclick="clearOverlay()">&times;</a></div><div class="genres-form"></div>`;
    overlayContent.insertAdjacentHTML('beforeend', miniMarkup);
    renderGenres(movieGenresState.search.genre.data.genres);
    const buttonMarkup =`<button class="genres-form-send-genre">Roll</button>`;
    overlayContent.insertAdjacentHTML('beforeend', buttonMarkup);
    document.querySelector('.form__radio-input').checked = true;
});

/**********************
 ****render žanrova****
 *********************/

const renderGenres = (genres: any[]) => {
    genres.forEach(renderGenre);
}


const renderGenre = (genre: { id: number; name: string; }) => {
    const genresForm = document.querySelector('.genres-form') as HTMLElement;       
    const markup = `
    <div class="form__radio-group">
    <input type="radio" class="form__radio-input" name="genre-type" value=${genre.id} id="${genre.name}">
    <label for="${genre.name}" class="form__radio-label">
        <span class="form__radio-button"></span>
        ${genre.name}
    </label>
</div>
    `;
    genresForm.insertAdjacentHTML('beforeend', markup);
}

/*****************************************************
 ****event listener na gumb na kraju liste žanrova****
 ****************************************************/

overlayContent.addEventListener ('click', e=>{ 
    let genreId = 0;
    if (e.target.matches('.genres-form-send-genre')){
        const ele = document.getElementsByName('genre-type'); 
        for(let k = 0; k < ele.length; k++) { 
            if(ele[k].checked) 
            genreId = ele[k].value;
        }
        deleteGenreList();
        const miniMarkup =`<ul class="render-a-movie"></ul>`;
        overlayContent.insertAdjacentHTML('beforeend', miniMarkup);
        rouletteResults(genreId);        
    }   
});

/*********************************************************
 ****brisanje childova diva s klasom "overlay__content"****
 ********************************************************/

const deleteGenreList = () => {
        while (overlayContent.hasChildNodes()){
            overlayContent.removeChild(overlayContent.firstChild);
        }
}

/***************************************
 ****rendera film iz odabranog žanra**** 
 **************************************/

const generateOneMovieByGenre = (rouletteMovie: { title: string; release_date: string; backdrop_path: string; id: any;
    overview: string; vote_average: number; popularity: number; original_language: string; }[]) => {
    
    const markup = `
    <li class="movie-ol">
        <div class="movie-ol__first-row">
            <div class="movie-ol__name-year-ol">${rouletteMovie[0].title} (${limitMovieYear(rouletteMovie[0].release_date)})</div>
            <a class="closebtn" onclick="clearOverlay()">&times;</a>
        </div>
        <div class="movie-ol__img-ol" style=background-image:url("https://image.tmdb.org/t/p/w780/${rouletteMovie[0].backdrop_path}") alt="${rouletteMovie[0].title}">
            <div class='rating movie-ol__star-rating-ol' data-itemid=${rouletteMovie[0].id}>
                ${stars}
            </div>         
	    </div>
        <div class="movie-ol__overview-ol"><strong>Overview</strong>: ${rouletteMovie[0].overview}</div>
        <div class="movie-ol__rating-ol"><b>Rating:</b> <em>${rouletteMovie[0].vote_average}</em></div>
        <div class="movie-ol__popularity-ol"><b>Popularity:</b> <em>${rouletteMovie[0].popularity}</em></div>
        <div class="movie-ol__lang-ol"><b>Language:</b> <em>${rouletteMovie[0].original_language}</em></div>   
    </li>
    `;
    const renderOneMovie = document.querySelector('.render-a-movie') as HTMLElement;
    renderOneMovie.insertAdjacentHTML('beforeend', markup);
    getRating(`${parseInt(rouletteMovie[0].id)}`);
} 

// Check we can access localstorage
if (!window.localStorage) {
    console.log('Unable to access LS');
}

class Rates {
    rates: any;
    constructor() {
        this.rates = [];
    }

    addUpdateRate(id: number, movieID: number) {
        let index = -1;
        let trazilo;

        for (trazilo = 0; trazilo <= movieRates.rates.rates.length; trazilo++){
            if ( parseInt(movieRates.rates.rates[trazilo].movieID) === movieID){
                    index = trazilo;
                    break;
                }
            }
        if (index >= 0){
            movieRates.rates.rates[trazilo].id = id;
            this.persistData();
        }      
    }

    saveMovieData (movieID: number){
        const id = 0;
        const rate = { id, movieID };
        this.rates.push(rate);
        // Perist data in localStorage
        this.persistData();
        return rate;
    }
    
    findRate(movieID: any){
        let ocjena = 0, trazilo;         
        for (trazilo = 0; trazilo <= movieRates.rates.rates.length; trazilo++){          
            if ( parseInt(movieRates.rates.rates[trazilo].movieID) === parseInt(movieID)){
                ocjena = parseInt(movieRates.rates.rates[trazilo].id); 
                break;
            }
        }
        return ocjena;
    }

    fillSessionStorage () {
        let sessionStorage = [];
        for (let i = 0; i < movieRates.rates.rates.length; i++){          
            sessionStorage.push(movieRates.rates.rates[i].movieID);
        }
        return sessionStorage;
    }

    /* deteleAll(){
        this.rates.splice(0, 5);
        this.persistData();
    }  */

    persistData() {
        localStorage.setItem('rates', JSON.stringify(this.rates));
    }

    readStorage() {
        const storage = JSON.parse(localStorage.getItem('rates'));
        if (storage) this.rates = storage;
    }
}

let sessionStorage = [];

function startingFunction() {
    sessionStorage = movieRates.rates.fillSessionStorage();
}

function saveStar(id: any) {
    let movieID = parseInt(document.querySelector('.rating').dataset.itemid);
    let prvi = movieRates.rates.findRate(movieID);
    movieRates.rates.addUpdateRate(id, movieID);
    let drugi = movieRates.rates.findRate(movieID);

    if ( prvi !== drugi || prvi !== 1){
        getRating(movieID);
    } else if ( prvi === drugi && prvi === 1) {
        id = 0;
        movieRates.rates.addUpdateRate(id, movieID);        

        const stars = document.getElementsByClassName("star") as HTMLCollectionOf<HTMLElement>;
        stars[0].style.color = "black";
    }
    /* const deleteAll = () => {movieRates.rates.deteleAll();}
    deleteAll(); */ 
}

function getRating(movieID: any){ 
    
    if (sessionStorage.includes(movieID) == false) {
        movieRates.rates.saveMovieData(movieID);
        sessionStorage.push(movieID);   
    } else {
        let a = movieRates.rates.findRate(movieID);
        const stars = document.getElementsByClassName("star") as HTMLCollectionOf<HTMLElement>;

        for (var i = 0; i < stars.length; i++) {
            if (i >= a) {
            stars[i].style.color = "black";
            } else {
            stars[i].style.color = "orange";
            }
        }
    } 
}

window.addEventListener('load', () => {
    movieRates.rates = new Rates();
    //restore
    movieRates.rates.readStorage();
    startingFunction();
    controlResults();
    genreResults();
    //console.log(sessionStorage);
});