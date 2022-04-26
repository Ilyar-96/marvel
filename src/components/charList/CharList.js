import { useState, useEffect, useRef } from 'react';
import propTypes from 'prop-types';


import Spinner from '../spinner/Spinner';
import ErrorMessage from '../errorMessage/ErrorMessage';
import useMarvelService from '../../services/MarvelService';
import './charList.scss';

const CharList = ({ onCharSelected }) => {
	const [charList, setCharList] = useState([]);
	const [newItemsLoading, setNewItemsLoading] = useState(false);
	const [offset, setOffset] = useState(210);
	const [charEnded, setCharEnded] = useState(false);
	const [totalCharacters, setTotalCharacters] = useState(0);

	const { loading, error, getTotalCharacters, getAllCharacters } = useMarvelService();



	useEffect(() => {
		onRequest(offset, true);
		getTotalCharacters().then(res => setTotalCharacters(res.total));
	}, [])

	useEffect(() => {
		const options = {
			rootMargin: '0px',
			threshold: 1.0
		};
		const target = document.querySelector('.char__footer');

		const loadCharsByScroll = (entry) => {
			if (entry[0].isIntersecting && !loading) {
				onRequest(offset + 9);
			}
		}

		const footerObserver = new IntersectionObserver(loadCharsByScroll, options);

		footerObserver.observe(target);

		return () => {
			footerObserver.unobserve(target);
		}
	})

	const onRequest = (offset, initial) => {
		initial ? setNewItemsLoading(false) : setNewItemsLoading(true);

		getAllCharacters(offset)
			.then(onCharListLoaded);
	}

	const focusOnItem = id => {
		itemRefs.current.forEach(item => item.classList.remove('char__item_selected'));
		itemRefs.current[id].classList.add('char__item_selected');
		itemRefs.current[id].focus();
	}

	const onCharListLoaded = (newCharList) => {
		let ended = totalCharacters !== 0 && (totalCharacters - offset <= 9) ? true : false;

		setCharList(() => [...charList, ...newCharList]);
		setNewItemsLoading(() => false);
		setOffset(() => offset + 9);
		setCharEnded(() => ended);
	}

	const itemRefs = useRef([]);

	const renderItems = arr => {
		const items = arr.map((item, i) => {
			let imgStyle = { 'objectFit': 'cover' };
			if (item.thumbnail === 'http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available.jpg') {
				imgStyle = { 'objectFit': 'unset' };
			}

			return (
				<li
					className="char__item"
					key={item.id}
					//el ссылка на dom-объект
					ref={el => itemRefs.current[i] = el}
					tabIndex="0"
					onClick={() => {
						onCharSelected(item.id);
						focusOnItem(i);
					}}
					onKeyPress={(e) => {
						if (e.key === ' ' || e.key === "Enter") {
							onCharSelected(item.id);
							focusOnItem(i);
						}
					}}>
					<img src={item.thumbnail} alt={item.name} style={imgStyle} />
					<div className="char__name">{item.name}</div>
				</li>
			)
		});
		return (
			<ul className="char__grid">
				{items}
			</ul>
		)
	}


	const items = renderItems(charList);

	const errorMessage = error ? <ErrorMessage /> : null;
	const spinner = loading && !newItemsLoading ? <Spinner /> : null;

	return (
		<div className="char__list">
			{errorMessage}
			{spinner}
			{items}
			<button
				className="button button__main button__long"
				disabled={newItemsLoading}
				style={{ display: charEnded ? 'none' : 'block' }}
				onClick={() => { onRequest(offset) }}>
				<div className="inner">load more</div>
			</button>
		</div>
	)
}

CharList.propTypes = {
	onCharSelected: propTypes.func.isRequired
}

export default CharList;