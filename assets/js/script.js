const url = 'https://www.omdbapi.com/?apikey=d19f2996';
const searchForm = document.querySelector('#search-form');
const list = document.querySelector('.film-list');
const listItem = document.querySelector('.item');
const logoLink = document.querySelector('.header__logo');


// ----------------first-load-----------------

async function readyResponse() {
	let response = await fetch(url + `&s=all`);
	let json = await response.json();
	let resultArray = json.Search;
	resultArray.forEach(el => {
		let li = document.createElement('li');
		li.classList.add('item');
		li.dataset.id = `${el.imdbID}`;
		if (el.Poster == 'N/A') {
			li.prepend
			li.innerHTML = `<img src="../../img/Camera.webp" alt="${el.Title}" class="item__image">
		<h2 class="item__title">${el.Title}</h2>
		<p class="item__text">${el.Year}</p>`;
			list.append(li);
			return;
		}
		li.innerHTML = `<img src="${el.Poster}" alt="${el.Title}" class="item__image">
		<h2 class="item__title">${el.Title}</h2>
		<p class="item__text">${el.Year}</p>`;
		list.append(li);
	})
}

document.addEventListener('DOMContentLoaded', readyResponse);

// ------------------search-------------------

async function getResponse(e) {
	e.preventDefault();
	if (input.value == '') {
		return
	}
	list.innerHTML = '';

	let response = await fetch(url + `&s=` + `${input.value}`);
	let json = await response.json();
	let resultArray = json.Search;
	console.log(json);

	if (json.Response == 'False') {
		let errTitle = document.createElement('h1');
		errTitle.classList.add('film-list__error')
		errTitle.innerHTML = `Movie not found!`;
		list.append(errTitle);
		return;
	}

	resultArray.forEach(el => {
		let li = document.createElement('li');
		li.classList.add('item');
		li.dataset.id = `${el.imdbID}`;
		if (el.Poster == 'N/A') {
			li.innerHTML = `<img src="../../img/Camera.webp" alt="${el.Title}" class="item__image">
		<h2 class="item__title">${el.Title}</h2>
		<p class="item__text">${el.Year}</p>`;
			list.append(li);
			return;
		}
		li.innerHTML = `<img src="${el.Poster}" alt="${el.Title}" class="item__image">
		<h2 class="item__title">${el.Title}</h2>
		<p class="item__text"><span>${el.Year}</span></p>`;
		list.append(li);
	})
	input.value = '';
	input.blur();
};

searchForm.addEventListener('submit', getResponse);

// ------------------search-details-----------


document.addEventListener('click', async function (e) {

	if (e.target.closest('a') && e.target.closest('a').className == 'header__logo') {
		document.location.reload()
	}

	if (e.target.closest('li') && e.target.closest('li').className == 'item') {
		body.classList.add('lock');
		let currentItem = e.target.closest('li');
		let id = currentItem.dataset.id;
		let response = await fetch(url + `&i=${id}`);
		let json = await response.json();

		let overlay = document.createElement('div');
		overlay.innerHTML = `<div class="film-list__modal-container modal-container">
		<img class="modal-container__image" src="${json.Poster}" alt="${json.Title}">
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
		list.prepend(overlay);
	}

	if (e.target.closest('button') && e.target.closest('button').className == 'modal-container__btn') {
		document.querySelector('.film-list__modal-overlay').remove();
		body.classList.remove('lock');
	}
})