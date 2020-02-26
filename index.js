/* const getData = () => {
    const key = '5945a0abd9acd913047172b2e6571d3e';
    axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${key}&sort_by=popularity.desc&include_adult=false&include_video=false&page=1`).then(response => {
        movieData = response.data.results;
        console.log(movieData);
    }).then (console.log(movieData));
};
getData(); */

/* global state
    -search object
    -current movie
*/
const movieData = {};
const movieGenresState = {};
const movieGenresDB = {};

/***********************
 ****Dohvaćanje baza****
 **********************/

const controlResults = async () => {
    //1 početni query
    const query = 'https://api.themoviedb.org/3/discover/movie?api_key=5945a0abd9acd913047172b2e6571d3e&sort_by=popularity.desc&include_adult=false&include_video=false&page=1';

    if (query){
        //2 novi objekt
        movieData.search = new Search(query);

        //4 traži filmove
        await movieData.search.getResults();
        
        //5 renderaj rezultate
        renderMovies(movieData.search.result);
    }
}

const genreResults = async () => {
    const query = 'https://api.themoviedb.org/3/genre/movie/list?api_key=5945a0abd9acd913047172b2e6571d3e';

    if (query){
        //1 novi objekt
        movieGenresState.search = new Search(query);

        //2 traži žanrove
        await movieGenresState.search.getGenresResults();

        //console.log(movieGenresState.search.genre.data.genres);
        
    }
}

const rouletteResults = async (genreId) => {
    const query = `https://api.themoviedb.org/3/discover/movie?api_key=5945a0abd9acd913047172b2e6571d3e&with_genres=${genreId}`;
    //console.log(genreId);
    if(query){
        movieGenresDB.search = new Search (query);
        await movieGenresDB.search.getRouleteResults();
        //console.log(movieGenresDB.search.genreId.data.results);
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
        }catch (error) {
            alert(error);
        }   
    }

    async getGenresResults (){
        try {
            const gen = await axios(`${this.query}`);
            this.genre = gen;        
        }catch (error) {
            alert(error);
        } 
    }

    async getRouleteResults (){
        try {
            const genId = await axios(`${this.query}`);
            this.genreId = genId;        
        }catch (error) {
            alert(error);
        }
    }
}

controlResults();
genreResults();

/*******************************************
 ****ograničavanje broja riječi u nazivu****
 ******************************************/

const limitMovieTitle = title => {
    const newTitle = [];
    if( title.length > 25){
        title.split(' ').reduce((acc, cur) =>{
            if (acc + cur.length <= 25){
                newTitle.push(cur);
            }
            return acc + cur.length;
        }, 0);
        return `${newTitle.join(' ')}...`;
    }
    return title;
}

/******************************************
 ****izvlačenje godine iz datuma objave****
 *****************************************/

const limitMovieYear = year => {
    year.split('');
    const newYear = [];
    for (let i = 0; i < 4; i++){
        newYear[i] = year[i];
     }
     return `${newYear.join('')}`;
}

/*********************************
 ****rendera filmove u li-jeve****
 ********************************/

const renderMovie = (movie, i) => {
    const markup = `
    <li class="movie"  data-itemid=${i}>
        <div class="movie-img"><img src ="https://image.tmdb.org/t/p/w185/${movie.poster_path}" alt="${movie.title}"></div>
        <div class="movie-name-year">${limitMovieTitle(movie.title)} (${limitMovieYear(movie.release_date)})</div>
        <div class="movie-lang">Language: ${movie.original_language}</div>
        <div class="movie-rating">Rating: ${movie.vote_average}</div>
    </li>
    `;
    document.querySelector('.render-movies').insertAdjacentHTML('beforeend', markup);
}

let i = 0, j = 3;

const renderMovies = movies => {
    //console.log(movies);
    for (; i <= j ; i++){
        
        renderMovie(movies[i], i);
    }
    //movies.forEach(renderMovie);
}

/***************************************
 ****gumb za učitavanje reda filmova****
 **************************************/

document.querySelector('.load-more').addEventListener('click', e => {
    e.preventDefault();
    j += 4;
    console.log('click');
    renderMovies(movieData.search.result);
    if ( (j + 4) > 20) {
        let element = document.querySelector('.load-more');
        element.parentNode.removeChild(element);
    }
});

/*****************************************
 ****render za određeni film u overlay****
 ****************************************/

const renderAMovie = (movie, i) => {
    const markup = `
    <li class="movie-ol"  data-itemid=${i}>
        <div class="movie-name-year-ol">${movie.title} (${limitMovieYear(movie.release_date)})</div>
        <div class="movie-img-ol"><img src ="https://image.tmdb.org/t/p/w780/${movie.backdrop_path}" alt="${movie.title}"></div>
        <div class="movie-overview-ol">Overview: ${movie.overview}</div>
        <div class="test-class clear">
            <div class="movie-rating-ol"><b>Rating:</b> <em>${movie.vote_average}</em></div>
            <div class="movie-star-rating-ol"><span>☆</span><span>☆</span><span>☆</span><span>☆</span><span>☆</span><span>☆</span><span>☆</span><span>☆</span><span>☆</span><span>☆</span></div>
        </div>
        <div class="movie-popularity-ol"><b>Popularity:</b> <em>${movie.popularity}</em></div>
        <div class="movie-lang-ol"><b>Language:</b> <em>${movie.original_language}</em></div>
        
    </li>
    `;
    document.querySelector('.render-a-movie').insertAdjacentHTML('beforeend', markup);
}

/*********************************
 ****event listener na filmove****
 ********************************/

document.querySelector('.render-movies').addEventListener ('click', e=>{ 
    const id = e.target.closest('.movie').dataset.itemid;
    /* let list = document.querySelector('.overlay-content');
    while (list.hasChildNodes()){
        list.removeChild(list.firstChild);
    } */
    document.getElementById("myNav").style.display = "block";
    const miniMarkup =`<ul class="render-a-movie"></ul>`;
    document.querySelector('.overlay-content').insertAdjacentHTML('beforeend', miniMarkup);
    renderAMovie(movieData.search.result[id], id);
});

/*******************************************************
 ****event listener na gumb za zatvaranje u overleju****
 ******************************************************/

document.querySelector('.closebtn').addEventListener ('click', e=> {
    document.getElementById("myNav").style.display = "none";
    let list = document.querySelector('.overlay-content');
    while (list.hasChildNodes()){
        list.removeChild(list.firstChild);
    }
  });

/*****************************************
****da se overlay može zatvoriti s esc****
*****************************************/

  document.addEventListener('keydown', function(event) {
    if (event.keyCode == 27 || event.which == 27) {
        document.getElementById("myNav").style.display = "none";
        let list = document.querySelector('.overlay-content');
        while (list.hasChildNodes()){
            list.removeChild(list.firstChild);
        }
    }
});

/**************************************
 ****event listener na rulet button****
 *************************************/

document.querySelector('.movie-roulette').addEventListener('click', e => {
    e.preventDefault();
    //document.querySelector('.movies-container-wrapper').classList.toggle('hide');
    //document.querySelector('.load-more').classList.toggle('hide');
    document.getElementById("myNav").style.display = "block";
    const miniMarkup =`<form class="genres-form"></form>`;
    document.querySelector('.overlay-content').insertAdjacentHTML('beforeend', miniMarkup);
    renderGenres(movieGenresState.search.genre.data.genres);
    const buttonMarkup =`<button class="genres-form-send-genre">Roll</button>`;
    document.querySelector('.overlay-content').insertAdjacentHTML('beforeend', buttonMarkup);
});

/**********************
 ****render žanrova****
 *********************/

const renderGenres = genres => {
    genres.forEach(renderGenre);
}

const renderGenre = genre => {
    const markup = `
    <input type="radio" name="genre-type" value=${genre.id}>${genre.name}<br>
    `;
    document.querySelector('.genres-form').insertAdjacentHTML('beforeend', markup);
}

/*****************************************************
 ****event listener na gumb na kraju liste žanrova****
 ****************************************************/

document.querySelector('.overlay-content').addEventListener ('click', e=>{ 
    let genreId = 0;
    if (e.target.matches('.genres-form-send-genre')){
        var ele = document.getElementsByName('genre-type'); 
        for(let k = 0; k < ele.length; k++) { 
            if(ele[k].checked) 
            //console.log(ele[i].value);
            genreId = ele[k].value;
        }
        deleteGenreList();
        const miniMarkup =`<ul class="render-a-movie"></ul>`;
        document.querySelector('.overlay-content').insertAdjacentHTML('beforeend', miniMarkup);
        rouletteResults(genreId);        
    }
    
});

/************************************************************************************************************************
 ****s obzirom da se overlay koristi za više stvari, ovo koristim da obrišem childove diva s klasom "overlay-content"****
 ***********************************************************************************************************************/

const deleteGenreList = () => {
    let list = document.querySelector('.overlay-content');
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
        <div class="movie-name-year-ol">${rouletteMovie[0].title} (${limitMovieYear(rouletteMovie[0].release_date)})</div>
        <div class="movie-img-ol"><img src ="https://image.tmdb.org/t/p/w780/${rouletteMovie[0].backdrop_path}" alt="${rouletteMovie[0].title}"></div>
        <div class="movie-overview-ol">Overview: ${rouletteMovie[0].overview}</div>
        <div class="test-class clear">
            <div class="movie-rating-ol"><b>Rating:</b> <em>${rouletteMovie[0].vote_average}</em></div>
            <div class="movie-star-rating-ol"><span>☆</span><span>☆</span><span>☆</span><span>☆</span><span>☆</span><span>☆</span><span>☆</span><span>☆</span><span>☆</span><span>☆</span></div>
        </div>
        <div class="movie-popularity-ol"><b>Popularity:</b> <em>${rouletteMovie[0].popularity}</em></div>
        <div class="movie-lang-ol"><b>Language:</b> <em>${rouletteMovie[0].original_language}</em></div>
        
    </li>
    `;
    document.querySelector('.render-a-movie').insertAdjacentHTML('beforeend', markup);
} 