const url = 'https://www.omdbapi.com/?apikey=d19f2996';
const searchForm = document.querySelector('#search-form');
const filmList = document.querySelector('.film-list');
const filmListItem = document.querySelector('.item');
const logoLink = document.querySelector('.header__logo');
const container = document.querySelector('.main__container');
const pagList = document.querySelector('.pagination');
const maxToShow = 10;
let currentPage = 1;
let currentUrl, oldUrl, allPages;

//----------------Fetch-Response-----------------

async function getResponse() {
	let response = await fetch(currentUrl);
	json = await response.json();
	allPages = Math.ceil(json.totalResults / maxToShow) + 3;
	return json;
}

//----------------Create-Film-Items--------------


function createFilmList(resultArray) {

	resultArray.forEach(el => {
		let li = document.createElement('li');
		li.classList.add('item');
		li.dataset.id = `${el.imdbID}`;
		let image = el.Poster;

		if (image == 'N/A') {
			image = "https://cdn.pixabay.com/photo/2013/07/12/13/58/camera-147680_960_720.png";
		}

		li.innerHTML = `<img src="${image}" alt="${el.Title}" class="item__image">
		<h2 class="item__title">${el.Title}</h2>
		<p class="item__text">${el.Year}</p>`;

		filmList.append(li);
	});
}

//------------------Create-pagitation------------

function createPagination() {
	const pagList = document.querySelector('.pagination');
	pagList.innerHTML = '';

	for (let i = 0; i <= allPages; i++) {
		let li = document.createElement('li');
		li.innerHTML = `<a href="" class="pagination__link">${i - 1}</a>`;
		li.classList.add('pagination__item');

		if (i == 0) {
			li.innerHTML = `<a href="" class="pagination__link start"><<</a>`;
		}
		else if (i == 1) {
			li.innerHTML = `<a href="" class="pagination__link prev"><</a>`;
		}
		else if (i == allPages - 1) {
			li.innerHTML = `<a href="" class="pagination__link next">></a>`;
		}
		else if (i == allPages) {
			li.innerHTML = `<a href="" class="pagination__link finish">>></a>`;
		}
		else if (i - 1 == currentPage) {
			li.innerHTML = `<a href="" class="pagination__link active">${i - 1}</a>`;
		}

		pagList.append(li);
	}

	const startLi = document.querySelector('.start');
	const prevLi = document.querySelector('.prev');
	const nextLi = document.querySelector('.next');
	const finishLi = document.querySelector('.finish');

	if (currentPage == 1) {
		startLi.classList.add('non-active');
		prevLi.classList.add('non-active');
	}

	if (currentPage == allPages - 3) {
		nextLi.classList.add('non-active');
		finishLi.classList.add('non-active');
	}
}

pagList.addEventListener('click', (e) => {
	e.preventDefault();
	let link = e.target.closest('a');

	if (link.innerText == '<<') {
		currentPage = 1;
	}
	else if (link.innerText == '<') {
		currentPage--;
	}
	else if (link.innerText == '>') {
		currentPage++;
	}
	else if (link.innerText == '>>') {
		currentPage = allPages - 3;
	}
	else {
		currentPage = link.innerText;
	}

	filmList.innerHTML = '';
	pagList.innerHTML = '';
	oldUrl = currentUrl;
	currentUrl += `&page=${currentPage}`;

	getResponse()
		.then(json => {
			//----Create-Film-List----
			let resultArray = json.Search;
			createFilmList(resultArray);
			//----Create-Pagination---
			createPagination();
		})

	currentUrl = oldUrl;
})

//-----------------DOMContentLoaded--------------

function loadDOMResponse() {

	currentUrl = url + `&s=thor`;

	getResponse()
		.then(json => {
			//----Create-Film-List----
			let resultArray = json.Search;
			createFilmList(resultArray);
			//----Create-Pagination---
			createPagination();
		})
}

document.addEventListener('DOMContentLoaded', loadDOMResponse);


// ---------------Submit-Loaded------------------

async function submitResponse(e) {
	e.preventDefault();

	currentPage = 1;

	currentUrl = url + `&s=${input.value}`;

	if (input.value == '') {
		return
	}

	//-----Clear-Film-List----

	filmList.innerHTML = '';

	//------Get-Response------

	getResponse()
		.then(json => {

			//-------If-Error---------

			if (json.Response == 'False') {
				let errTitle = document.createElement('h1');
				errTitle.classList.add('film-list__error')
				errTitle.innerHTML = `Movie not found!`;
				filmList.append(errTitle);
				pagList.innerHTML = '';
				return;
			}

			let resultArray = json.Search;
			createFilmList(resultArray);

			//-------Reset-Input------

			input.value = '';
			input.blur();
			btn.blur();

			//----Create-Pagination---

			createPagination();
		})

};

searchForm.addEventListener('submit', submitResponse);

//-----------------Modal-Window------------------

function createModal(json) {

	let image = json.Poster;

	if (image == 'N/A') {
		image = 'https://cdn.pixabay.com/photo/2013/07/12/13/58/camera-147680_960_720.png';
	}

	let overlay = document.createElement('div');
	overlay.innerHTML = `<div class="film-list__modal-container modal-container">
		<img class="modal-container__image" src="${image}" alt="${json.Title}">
		<div class="modal-container__details">
			<h2 class="modal-container__title">${json.Title}</h2>
			<p class="modal-container__box-office"><span>Box Office</span>${json.BoxOffice}</p>
			<p class="modal-container__runtime"><span>Runtime</span>${json.Runtime}</p>
			<p class="modal-container__genre"><span>Genre</span>${json.Genre}</p>
			<p class="modal-container__actors"><span>Actors</span>${json.Actors}
			</p>
			<p class="modal-container__rating"><span>Rating</span>${json.imdbRating}</p>
			<p class="modal-container__country"><span>Country</span>${json.Country}</p>
			<p class="modal-container__about-title">About</p>
			<p class="modal-container__about-text">${json.Plot}</p>
		</div>
		<button class="modal-container__btn"><i class="fa-solid fa-xmark"></i></button>
	</div>`;

	overlay.classList.add('film-list__modal-overlay')
	container.append(overlay);
}

//----------Close-Modal------

function closeModal() {
	document.querySelector('.film-list__modal-overlay').remove();
	body.classList.remove('lock');
}

window.addEventListener('keydown', (e) => {
	if (e.keyCode === 27) {
		closeModal()
	}
})

document.addEventListener('click', async function (e) {

	//--Create-modal-window---

	if (e.target.closest('li') && e.target.closest('li').className == 'item') {
		body.classList.add('lock');
		let currentItem = e.target.closest('li');
		let id = currentItem.dataset.id;
		oldUrl = currentUrl;
		currentUrl = url + `&i=${id}`;

		getResponse()
			.then(json => createModal(json))

		currentUrl = oldUrl;
	}

	//--Close-modal-window----

	if (e.target.closest('button') && e.target.closest('button').className == 'modal-container__btn'
		|| e.target.className == 'film-list__modal-overlay') {
		closeModal()
	}
})

//---------------------Reload-page---------------

document.querySelector('.header__logo').addEventListener('click', () => document.location.reload());
