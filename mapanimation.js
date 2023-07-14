mapboxgl.accessToken = 'pk.eyJ1Ijoid3dyaWdodDIxIiwiYSI6ImNsandzMno0ZDA1aTAzZm15bG1nZzZlcWMifQ.Ul9Oy40d-hWa_hvwaLNXbw';

var map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/mapbox/dark-v11',
	center: [-71.089023,42.350578],
	zoom: 14,
	// accessToken: mapboxToken
});

// instantiate the markers array
let markers = [];

// fly to MiT Campus
document.querySelector('#fly-to-MIT').addEventListener('click', () => {
	map.flyTo({
		center: [-71.095075, 42.358061],
		zoom: 16,
	})
})

// reset the map view
document.querySelector('#reset-view').addEventListener('click', () => {
	map.flyTo({
		center: [-71.089023,42.350578],
		zoom: 14,
	})
})


async function run() {
	const locations = await getBusLocations();
	// get bus data    
	console.log(new Date());
	console.log(locations);

	// Remove old markers
	markers.forEach(marker => {
		marker.remove();
	});
	markers = [];

	// Draw new markers
	locations.forEach(location => {
		const { latitude, longitude, occupancyStatus, id } = location;
		const marker = new mapboxgl.Marker()
			.setLngLat([longitude, latitude])
			.addTo(map);

		const popup = new mapboxgl.Popup()
			.setHTML(`<b>Bus ID:</b> ${id}<br><hr><b>Occupancy Status:</b> ${occupancyStatus}`)

		marker.setPopup(popup);

		markers.push(marker)
	})

	// timer
	setTimeout(run, 15000)
}

// Request bus data from MBTA
async function getBusLocations() {
	const url = 'https://api-v3.mbta.com/vehicles?filter[route]=1&include=trip';
	const response = await fetch(url);
	const json = await response.json();
	let buses = [];

	for (let i = 0; i < json.data.length; i++) {
		let occupancyStatus = 'No data';

		if (json.data[i].attributes.occupancy_status !== null) {
			occupancyStatus = json.data[i].attributes.occupancy_status
				.toLowerCase()
				.split('_')
				.map(word => word.charAt(0).toUpperCase() + word.slice(1))
				.join(' ');
		}

		let busAttributes = {
			id: json.data[i].attributes.label,
			occupancyStatus: occupancyStatus,
			latitude: json.data[i].attributes.latitude,
			longitude: json.data[i].attributes.longitude
		};
		buses.push(busAttributes)
	}

	return buses
}

run();