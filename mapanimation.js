mapboxgl.accessToken = 'pk.eyJ1Ijoid3dyaWdodDIxIiwiYSI6ImNsandzMno0ZDA1aTAzZm15bG1nZzZlcWMifQ.Ul9Oy40d-hWa_hvwaLNXbw';

const initialCenter = [-71.096679, 42.360019]
const initialZoom = 12.5

var map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/mapbox/dark-v11',
	center: initialCenter,
	zoom: initialZoom,
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

// fly to Harvard Campus
document.querySelector('#fly-to-Harvard').addEventListener('click', () => {
	map.flyTo({
		center: [-71.116808, 42.378102],
		zoom: 16,
	})
})

// reset the map view
document.querySelector('#reset-view').addEventListener('click', () => {
	map.flyTo({
		center: initialCenter,
		zoom: initialZoom,
	})
})

//  // toggle bus Stops
//  document.querySelector('#toggle-stops').addEventListener('click', () => {
// 	const isVisible = map.getLayoutProperty('busStops', 'visibility') === 'visible'
// 	if (isVisible) {
// 		map.setLayoutProperty('busStops', 'visibility', 'none')
// 	} else {
// 		map.setLayoutProperty('busStops', 'visibility', 'visible')
// 	}
// })

// create bus stops
const busStops = [
	[-71.093729, 42.359244],
	[-71.094915, 42.360175],
	[-71.095800, 42.360698],
	[-71.099558, 42.362953],
	[-71.103476, 42.365248],
	[-71.106067, 42.366806],
	[-71.108717, 42.368355],
	[-71.110799, 42.369192],
	[-71.113095, 42.370218],
	[-71.115476, 42.372085],
	[-71.117585, 42.373016],
	[-71.118625, 42.374863]
];

// // the new way
// // Create a GeoJSON feature collection for bus stops
// const busStopFeatures = busStops.map(busStop => ({
// 	type: 'Feature',
// 	properties: {},
// 	geometry: {
// 	  type: 'Point',
// 	  coordinates: busStop
// 	}
//   }));
  
//   // Add bus stop markers as a map layer
//   map.on('load', function() {
// 	map.addLayer({
// 	  id: 'busStopsLayer',
// 	  type: 'symbol',
// 	  source: {
// 		type: 'geojson',
// 		data: {
// 		  type: 'FeatureCollection',
// 		  features: busStopFeatures
// 		}
// 	  },
// 	  layout: {
// 		'icon-image': 'marker-15',
// 		'icon-size': 1.5
// 	  },
// 	  paint: {}
// 	});
//   });


// the old way
busStops.forEach(busStop => {
	const stopLoc = new mapboxgl.Marker({
		color: '#ff0000',
		scale: 0.90
	})
		.setLngLat(busStop)
		.addTo(map);

	const stopPopup = new mapboxgl.Popup({ offset: 32 })
		.setHTML(`<b>Bus Stop lat/long:</b><br> ${busStop[1]}, ${busStop[0]}`)

	stopLoc.setPopup(stopPopup);
});

// get bus locations from the API
async function run() {
	const locations = await getBusLocations();
	// get bus data    
	// console.log(new Date());
	console.log(locations);

	// Remove old markers
	markers.forEach(marker => {
		marker.remove();
	});
	markers = [];

	// Draw new markers
	locations.forEach(location => {
		const el = document.createElement('div');
		el.className = 'marker';
		const { latitude, longitude, occupancyStatus, id } = location;
		const marker = new mapboxgl.Marker(el)
			.setLngLat([longitude, latitude])
			.addTo(map);

		const popup = new mapboxgl.Popup({ offset: 28 })
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