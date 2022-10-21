const url = 'https://www.omdbapi.com/?apikey=d19f2996';
const searchForm = document.querySelector('#search-form');
const filmList = document.querySelector('.film-list');
const filmListItem = document.querySelector('.item');
const favList = document.querySelector('.favorites-list');
const logoLink = document.querySelector('.header__logo');
const container = document.querySelector('.main__container');
const pagList = document.querySelector('.pagination');
const defaultTitle = document.querySelector('.main__fav-title');
const hideTitle = document.querySelector('.main__fav-title_empty');
const favButton = document.querySelector('.main__fav-btn');
const storage = window.localStorage;
const maxToShow = 10;
let currentPage = 1;
let currentUrl, oldUrl, allPages;

//----------------Fetch-Response-----------------

async function getResponse() {
	let response = await fetch(currentUrl);
	json = await response.json();
	allPages = Math.ceil(json.totalResults / maxToShow);
	return json;
}

//----------------Create-Film-Items--------------


function createFilmList(resultArray) {

	resultArray.forEach(el => {
		const li = document.createElement('li');
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

const maxPagEl = 9;
let index = 0;

function createPagination() {
	const pagList = document.querySelector('.pagination');
	pagList.innerHTML = '';

	const startLi = document.createElement('li');
	const prevLi = document.createElement('li');
	startLi.classList.add('pagination__item');
	startLi.innerHTML = `<a href="" class="pagination__link start"><<</a>`;
	prevLi.classList.add('pagination__item');
	prevLi.innerHTML = `<a href="" class="pagination__link prev"><</a>`;
	pagList.prepend(prevLi);
	pagList.prepend(startLi);

	for (let i = 1; i <= maxPagEl; i++) {
		let li = document.createElement('li');
		if (i + index > allPages) {
			break;
		}
		li.innerHTML = `<a href="" class="pagination__link">${i + index}</a>`;
		li.classList.add('pagination__item');

		pagList.append(li);
	}

	let liLinks = document.querySelectorAll('.pagination__link');
	liLinks.forEach(a => {
		if (a.innerText == `${currentPage}`) {
			a.classList.add('active');
		}
	})

	const finishLi = document.createElement('li');
	const nextLi = document.createElement('li');
	finishLi.classList.add('pagination__item');
	finishLi.innerHTML = `<a href="" class="pagination__link finish">>></a>`;
	nextLi.classList.add('pagination__item');
	nextLi.innerHTML = `<a href="" class="pagination__link next">></a>`;
	pagList.append(nextLi);
	pagList.append(finishLi);

	if (currentPage == 1) {
		startLi.classList.add('non-active');
		prevLi.classList.add('non-active');
	}

	if (currentPage == allPages) {
		nextLi.classList.add('non-active');
		finishLi.classList.add('non-active');
	}

	if (maxPagEl >= allPages) {
		nextLi.classList.add('non-active');
		finishLi.classList.add('non-active');
	}
}

pagList.addEventListener('click', (e) => {
	e.preventDefault();
	let link = e.target.closest('a');

	if (link.innerText == '<<') {
		index = 0;
		currentPage = 1;
	}
	else if (link.innerText == '<') {
		index -= 9;
		currentPage = Number(currentPage) - Number(maxPagEl);
		if (currentPage < 1) {
			currentPage = 1;
			index = 0;
		}
	}
	else if (link.innerText == '>') {
		index += 9;
		currentPage = Number(currentPage) + Number(maxPagEl);
		if (currentPage > allPages) {
			currentPage = allPages;
			index = allPages - (allPages % 9);
		}
	}
	else if (link.innerText == '>>') {
		index = allPages - 9;
		currentPage = allPages;
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

	currentUrl = url + `&s=batman`;

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
				const errTitle = document.createElement('h1');
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
	currentPage = 1;
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
			<button class="modal-container__like" title="Add to favorites">Add to favorites</button>
		</div>
		<button class="modal-container__btn"><i class="fa-solid fa-xmark"></i></button>
	</div>`;

	overlay.classList.add('film-list__modal-overlay')
	container.append(overlay);

	//-------Add-To-Fav-List-----

	document.querySelector('.modal-container__like').addEventListener('click', (e) => {

		if (e.target.innerText == 'Add to favorites') {
			storage.setItem(`${json.Title}`, `${json.imdbID}`);
			e.target.innerText = 'Remove from favorites';
		}

		else if (e.target.innerText == 'Remove from favorites') {
			storage.removeItem(`${json.Title}`);
			e.target.innerText = 'Add to favorites';
			favList.innerHTML = '';
			getFavResponse();

			if (storage.length == 0) {
				defaultTitle.classList.add('hide');
				hideTitle.classList.remove('hide');
				favButton.classList.add('hide');
			}

			if (!storage.length == 0) {
				defaultTitle.classList.remove('hide');
				hideTitle.classList.add('hide');
				favButton.classList.remove('hide');
			}
		}

		e.target.blur();
	})
}

document.addEventListener('click', async function (e) {

	//--Create-modal-window---

	if (e.target.closest('li') && e.target.closest('li').classList.contains('item')) {
		body.classList.add('lock');
		let currentItem = e.target.closest('li');
		let id = currentItem.dataset.id;
		oldUrl = currentUrl;
		currentUrl = url + `&i=${id}`;

		getResponse()
			.then(json => {
				createModal(json);
				checkStorage(`${json.imdbID}`);
			})

		currentUrl = oldUrl;
	}

	//--Close-modal-window----

	if (e.target.closest('button') && e.target.closest('button').className == 'modal-container__btn'
		|| e.target.className == 'film-list__modal-overlay') {
		closeModal()
	}
})

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

//---------------------Reload-page---------------

document.querySelector('.header__logo').addEventListener('click', () => document.location.reload());


//---------------Create-Favorite-List------------

function createFavItem(obj) {

	let li = document.createElement('li');
	li.classList.add('item');
	li.dataset.id = `${obj.imdbID}`;
	let image = obj.Poster;

	if (image == 'N/A') {
		image = "https://cdn.pixabay.com/photo/2013/07/12/13/58/camera-147680_960_720.png";
	}

	li.innerHTML = `<img src="${image}" alt="${obj.Title}" class="item__image">
		<h2 class="item__title">${obj.Title}</h2>
		<p class="item__text">${obj.Year}</p>`;

	favList.append(li);

}

//-------Get-Fav-Response----

function getFavResponse() {

	for (let i = 0; i < storage.length; i++) {

		oldUrl = currentUrl;
		let key = storage.key(i);
		currentUrl = url + `&i=${storage.getItem(key)}`;

		getResponse()
			.then(json => {
				createFavItem(json)
			})

		currentUrl = oldUrl;
	}
}

//-------Show-Fav-List-------

document.querySelector('.header__favorites-btn').addEventListener('click', (e) => {
	const overlay = document.querySelector('.main__favorites-inner');
	const btn = e.target.closest('button');
	const currentIcon = e.target.closest('i');
	const closeBtn = document.querySelector('.header__favorites-btn_close');
	const likeBtn = document.querySelector('.header__favorites-btn_like');
	const favContainer = document.querySelector('.main__favorites-inner');
	const filmListContainer = document.querySelector('.main__film-list-inner');

	if (storage.length == 0) {
		defaultTitle.classList.add('hide');
		hideTitle.classList.remove('hide');
		favButton.classList.add('hide');
	}

	if (!storage.length == 0) {
		defaultTitle.classList.remove('hide');
		hideTitle.classList.add('hide');
		favButton.classList.remove('hide');
	}

	if (currentIcon.classList.contains('header__favorites-btn_like')) {

		filmListContainer.classList.add('hide');
		favContainer.classList.remove('hide');
		closeBtn.classList.remove('hide');
		likeBtn.classList.add('hide');

		getFavResponse();
	}

	if (currentIcon.classList.contains('header__favorites-btn_close')) {
		filmListContainer.classList.remove('hide');
		favContainer.classList.add('hide');
		closeBtn.classList.add('hide');
		likeBtn.classList.remove('hide');
		favList.innerHTML = '';
	}

	overlay.classList.toggle('active');
	btn.blur();
})

//-------Check-Storage-------

function checkStorage(id) {

	for (let key in storage) {
		if (storage[key] == id) {
			const btn = document.querySelector('.modal-container__like');
			btn.innerText = 'Remove from favorites';
		} else continue
	}
}

//-------Clear-Fav-List------

favButton.addEventListener('click', (e) => {
	storage.clear();
	favList.innerHTML = '';
	defaultTitle.classList.add('hide');
	hideTitle.classList.remove('hide');
	e.target.classList.add('hide');
})
