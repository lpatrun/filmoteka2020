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

const controlResults = async () => {
    //1 početni query
    const query = 'https://api.themoviedb.org/3/discover/movie?api_key=5945a0abd9acd913047172b2e6571d3e&sort_by=popularity.desc&include_adult=false&include_video=false&page=1';

    if (query){
        //2 novi objekt
        movieData.search = new Search(query);

        //3 priprema ui za rezultate

        //4 traži filmove
        await movieData.search.getResults();
        
        //5 renderaj rezultate
        renderMovies(movieData.search.result);
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

}

const renderMovie = movie => {
    console.log(movie);
    const markup = `
    <li>
        <div class="movie-img"><img src ="https://image.tmdb.org/t/p/w185/${movie.poster_path}" alt="${movie.title}"></div>
        <div class="movie-name-year">${movie.title} (${movie.release_date})</div>
        <div class="movie-lang">Language: ${movie.original_language}</div>
    </li>
    `;
    document.querySelector('.render-movies').insertAdjacentHTML('beforeend', markup);
}

let i = 0, j = 3;

const renderMovies = movies => {
    for (; i <= j ; i++){
        
        renderMovie(movies[i]);
    }
    //movies.forEach(renderMovie);
}


controlResults();

document.querySelector('.load-more').addEventListener('click', e => {
    console.log('klik');
    console.log(i +' ' + j);
    e.preventDefault();
    j += 4;
    console.log(i +' ' + j);
    renderMovies(movieData.search.result);
});

