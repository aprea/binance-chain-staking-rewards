const addressInput = document.getElementById( 'address' );
const exportButton = document.getElementById( 'submit' );
const exportForm = document.getElementById( 'export-transactions' );

let apiBase = '';
let currentPage = 0;
const pageSize = 100;
let totalTransactions = 0;

let transactions = [];

const getTransactions = () => {
	const url = new URL( apiBase );
	url.searchParams.append( 'limit', pageSize );
	url.searchParams.append( 'offset', currentPage * pageSize );

	return fetch( url.href )
		.then( response => {
			if ( ! response.ok ) {
				throw response;
			}

			return response;
		} )
		.then( response => response.json() )
		.then( data => {
			transactions = [
				...transactions,
				...data.rewardDetails.map( ( { rewardTime, reward } ) => [
					rewardTime,
					reward,
					'BNB',
					'reward',
				] )
			];
			totalTransactions = totalTransactions ? totalTransactions : data.total;

			if ( currentPage !== Math.ceil( totalTransactions / pageSize ) ) {
				++currentPage;
				return getTransactions();
			}
		} )
		.catch( response => {
			response.text().then( errorMessage => {
				alert( errorMessage );
			} )
		} );
}

exportForm.addEventListener( 'submit', (e) => {
	e.preventDefault();

	addressInput.setAttribute( 'disabled', '' );

	exportButton.ariaBusy = 'true';
	exportButton.textContent = 'Please wait…';

	apiBase = `https://api.binance.org/v1/staking/chains/bsc/delegators/${addressInput.value}/rewards`
	currentPage = 0;
	totalTransactions = 0;
	transactions = [];

	getTransactions()
		.then( () => {
			addressInput.removeAttribute( 'disabled' );
			exportButton.removeAttribute( 'aria-busy' );
			exportButton.textContent = 'Export transactions to CSV';

			const koinlyCsvColumns = [ 'Koinly Date', 'Amount', 'Currency', 'Label' ];
			exportToCsv( 'bnb-staking-rewards.csv', [ koinlyCsvColumns, ...transactions ] );
		} );
} )

document.querySelector( '.year' ).textContent = ( new Date() ).getFullYear();
