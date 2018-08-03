let restaurants,
    neighborhoods,
    cuisines,
    map;
var markers = [];

//================================================================
// Fetch neighborhoods and cuisines as soon as the page is loaded.
//================================================================
document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoods();
  fetchCuisines();
});

//============================================
// Fetch all neighborhoods and set their HTML.
//============================================
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
};

//========================
// Set neighborhoods HTML.
//========================
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
};

//=======================================
// Fetch all cuisines and set their HTML.
//=======================================
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
};

//===================
// Set cuisines HTML.
//===================
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
};

//=========================================
// Initialize Google map, called from HTML.
//=========================================
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
};

//=============================================
// Update page and map for current restaurants.
//=============================================
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
};

//====================================================================
// Clear current restaurants, their HTML and remove their map markers.
//====================================================================
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
};

//====================================================================
// Create all restaurants HTML and add them to the webpage.
//====================================================================
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
};

//========================
// Create restaurant HTML.
//========================
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.alt = DBHelper.imageAltForRestaurant(restaurant);
  image.sizes = '399px';
  const picture = document.createElement('picture');
  const source = document.createElement('source');
  source.type = 'image/webp';
  source.sizes = '399px';
  picture.append(source);
  picture.append(image);
  li.append(picture);

  const btn = document.createElement('button');
  const likeIcon = document.createElement('i');
  likeIcon.className = 'icon-heart';
  li.appendChild(btn).appendChild(likeIcon);
  btn.onclick = () => DBHelper.handleBtnClick(btn, restaurant.id);
  DBHelper.isRestaurantFavorite(btn, restaurant);

  const restaurantName = document.createElement('h3');
  const moreDetails = document.createElement('a');
  moreDetails.innerHTML = restaurant.name;
  moreDetails.href = DBHelper.urlForRestaurant(restaurant);
  restaurantName.append(moreDetails);
  li.append(restaurantName);
  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);
  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  // Lazy loading images
  lazyLoadImage = (entries) =>{
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        image.src = DBHelper.imageSrcForRestaurant(restaurant);
        image.srcset = DBHelper.imageSrcsetForRestaurant(restaurant);
        source.srcset = DBHelper.pictureSrcsetForRestaurant(restaurant);
        observer.unobserve(picture);
      }
    })
  };
  const observer = new IntersectionObserver(lazyLoadImage, {
    root: null,
    rootMargin: '0px',
    threshold: 1
  });
  observer.observe(picture);

  return li
};

//================================================
// Add markers for current restaurants to the map.
//================================================
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
};

//===============================
// Switch static to dynamic map.
//===============================
const mapContainer = document.querySelector('#map');
const staticMap = document.querySelector('#static-map');
staticMap.addEventListener('click', () => {
  if (mapContainer.style.display === 'none') {
    mapContainer.style.display = 'block';
    staticMap.style.display = 'none';
    document.querySelector('#tooltip').style.display = 'none';
  }
}, false);