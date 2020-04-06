export {};

/* const getData = () => {
    const key = '5945a0abd9acd913047172b2e6571d3e';
    axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${key}&sort_by=popularity.desc&include_adult=false&include_video=false&page=1`).then(response => {
*/

const movieData = {};
const movieGenresState = {};
const movieGenresDB = {};
const movieRates = {};

/***********************
 ****Dohvaćanje baza****
 **********************/

const controlResults = async () => {
    const query = 'https://api.themoviedb.org/3/discover/movie?api_key=5945a0abd9acd913047172b2e6571d3e&sort_by=popularity.desc&include_adult=false&include_video=false&page=1';

    if (query){
        movieData.search = new Search(query);
        await movieData.search.getResults();
        renderMovies(movieData.search.result);
    }
}

const genreResults = async () => {
    const query = 'https://api.themoviedb.org/3/genre/movie/list?api_key=5945a0abd9acd913047172b2e6571d3e';
    if (query){
        movieGenresState.search = new Search(query);
        await movieGenresState.search.getGenresResults();
    }
}

const rouletteResults = async (genreId) => {
    const query = `https://api.themoviedb.org/3/discover/movie?api_key=5945a0abd9acd913047172b2e6571d3e&with_genres=${genreId}`;
    if(query){
        movieGenresDB.search = new Search (query);
        await movieGenresDB.search.getRouleteResults();
        generateOneMovieByGenre(movieGenresDB.search.genreId.data.results);
    }
}

class Search {
    constructor (query){
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

const limitMovieTitle = title => {
    if( title.length > 25) {
        return(title.slice(0, 22) + "...")
    } else return title;
}

const limitMovieYear = year => {
    return(year.slice(0, 4));
}

/*********************************
 ****rendera filmove u li-jeve****
 ********************************/

const renderMovie = (movie, i) => {
    const markup = `
    <li class="movie col-1-of-4"  data-itemid=${i}>
        <div class="movie__img"><img src ="https://image.tmdb.org/t/p/w185/${movie.poster_path}" alt="${movie.title}"></div>
        <div class="movie__name-year">${limitMovieTitle(movie.title)} (${limitMovieYear(movie.release_date)})</div>
        <div class="movie__lang">Language: ${movie.original_language}</div>
        <div class="movie__rating">Rating: ${movie.vote_average}</div>
    </li>
    `;
    document.querySelector('.render-movies').insertAdjacentHTML('beforeend', markup);
}

let ii = 0, jj = 3;

const renderMovies = movies => {
    //console.log(movies);
    for (; ii <= jj ; ii++){
        renderMovie(movies[ii], ii);
    }
    //movies.forEach(renderMovie);
    document.querySelector('.render-movies').insertAdjacentHTML('beforeend', '<div class="clear"></div>');
}

/***************************************
 ****gumb za učitavanje reda filmova****
 **************************************/

document.querySelector('.button__load-more').addEventListener('click', e => {
    e.preventDefault();
    jj += 4;
    renderMovies(movieData.search.result);
    if ( (jj + 4) > 20) {
        let element = document.querySelector('.button__load-more');
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

const renderAMovie = (movie, i) => {
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
    document.querySelector('.render-a-movie').insertAdjacentHTML('beforeend', markup);
    getRating(`${parseInt(movie.id)}`);
}



/*********************************
 ****event listener na filmove****
 ********************************/

document.querySelector('.render-movies').addEventListener ('click', e=>{ 
    const id = e.target.closest('.movie').dataset.itemid;
    document.getElementById("myNav").style.display = "block";
    const miniMarkup =`<ul class="render-a-movie"></ul>`;
    document.querySelector('.overlay__content').insertAdjacentHTML('beforeend', miniMarkup);
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

clearOverlay = () =>{ 
    document.getElementById("myNav").style.display = "none";
    let list = document.querySelector('.overlay__content');
    while (list.hasChildNodes()){
        list.removeChild(list.firstChild);
    }   
}

/*****************************************
****da se overlay može zatvoriti s esc****
*****************************************/

  document.addEventListener('keydown', function(event) {
    if (event.keyCode == 27 || event.which == 27) {
        document.getElementById("myNav").style.display = "none";
        let list = document.querySelector('.overlay__content');
        while (list.hasChildNodes()){ list.removeChild(list.firstChild);   }
    }
});

/**************************************
 ****event listener na rulet button****
 *************************************/

document.querySelector('.button__movie-roulette').addEventListener('click', e => {
    e.preventDefault();
    document.getElementById("myNav").style.display = "block";
    const miniMarkup =`<div class="form__row"><a class="form__close-btn" onclick="clearOverlay()">&times;</a></div><div class="genres-form"></div>`;
    document.querySelector('.overlay__content').insertAdjacentHTML('beforeend', miniMarkup);
    renderGenres(movieGenresState.search.genre.data.genres);
    const buttonMarkup =`<button class="genres-form-send-genre">Roll</button>`;
    document.querySelector('.overlay__content').insertAdjacentHTML('beforeend', buttonMarkup);
    document.querySelector('.form__radio-input').checked = true;
});

/**********************
 ****render žanrova****
 *********************/

const renderGenres = genres => {
    genres.forEach(renderGenre);
}

const renderGenre = genre => {
    const markup = `
    <div class="form__radio-group">
    <input type="radio" class="form__radio-input" name="genre-type" value=${genre.id} id="${genre.name}">
    <label for="${genre.name}" class="form__radio-label">
        <span class="form__radio-button"></span>
        ${genre.name}
    </label>
</div>
    `;
    document.querySelector('.genres-form').insertAdjacentHTML('beforeend', markup);
}

/*****************************************************
 ****event listener na gumb na kraju liste žanrova****
 ****************************************************/

document.querySelector('.overlay__content').addEventListener ('click', e=>{ 
    let genreId = 0;
    if (e.target.matches('.genres-form-send-genre')){
        var ele = document.getElementsByName('genre-type'); 
        for(let k = 0; k < ele.length; k++) { 
            if(ele[k].checked) 
            genreId = ele[k].value;
        }
        deleteGenreList();
        const miniMarkup =`<ul class="render-a-movie"></ul>`;
        document.querySelector('.overlay__content').insertAdjacentHTML('beforeend', miniMarkup);
        rouletteResults(genreId);        
    }   
});

/*********************************************************
 ****brisanje childova diva s klasom "overlay__content"****
 ********************************************************/

const deleteGenreList = () => {
    let list = document.querySelector('.overlay__content');
        while (list.hasChildNodes()){
            list.removeChild(list.firstChild);
        }
}

/***************************************
 ****rendera film iz odabranog žanra**** 
 **************************************/

const generateOneMovieByGenre = rouletteMovie => {
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
    document.querySelector('.render-a-movie').insertAdjacentHTML('beforeend', markup);
    getRating(`${parseInt(rouletteMovie[0].id)}`);
} 

// Check we can access localstorage
if (!window.localStorage) {
    console.log('Unable to access LS');
}

class Rates {
    constructor() {
        this.rates = [];
    }

    addUpdateRate(id, movieID) {
        let index = -1;
        let trazilo;

        movieID = parseInt(movieID);
        id = parseInt(id);
        for (trazilo = 0; trazilo <= movieRates.rates.rates.length; trazilo++){
            if ( parseInt(movieRates.rates.rates[trazilo].movieID) === parseInt(movieID)){
                    index = trazilo;
                    break;
                }
            }
        if (index >= 0){
            movieRates.rates.rates[trazilo].id = parseInt(id);
            this.persistData();
        }      
    }

    saveMovieData (movieID){
        let id = 0;
        const rate = { id, movieID };
        this.rates.push(rate);
        // Perist data in localStorage
        this.persistData();
        return rate;
    }
    
    findRate(movieID){
        movieID = parseInt(movieID);
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

startingF = () =>{
    sessionStorage = movieRates.rates.fillSessionStorage();
}

saveStar = (id) => {
    let movieID = parseInt(document.querySelector('.rating').dataset.itemid);
    let prvi = movieRates.rates.findRate(movieID);
    const mainFunct = () => {movieRates.rates.addUpdateRate(id, movieID);}
    mainFunct();
    let drugi = movieRates.rates.findRate(movieID);

    if ( prvi !== drugi || prvi !== 1){
        getRating(movieID);
    } else if ( prvi === drugi && prvi === 1) {
        id = 0;
        const mainFunct = () => {movieRates.rates.addUpdateRate(id, movieID);}
        mainFunct();

        var stars = document.getElementsByClassName("star");
        stars[0].style.color = "black";
    }
    /* const deleteAll = () => {movieRates.rates.deteleAll();}
    deleteAll(); */ 
}

getRating = (movieID) => { 
    movieID = parseInt(movieID);
    if (sessionStorage.includes(movieID) == false) {
        movieRates.rates.saveMovieData(movieID);
        sessionStorage.push(movieID);   
    } else {
        let a = movieRates.rates.findRate(movieID);
        var stars = document.getElementsByClassName("star");

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
    startingF();
    controlResults();
    genreResults();
    //console.log(sessionStorage);
});