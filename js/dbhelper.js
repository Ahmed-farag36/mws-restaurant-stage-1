//==================================
// Common database helper functions.
//==================================
class DBHelper {

  //==============================================================
  // Database URL.
  // Change this to restaurants.json file location on your server.
  //==============================================================
  static get DATABASE_URL() {
    const port = 8000           // Change this to your server port
    return `http://localhost:${port}/data/restaurants.json`;
  }

   //=======================
  // Fetch all restaurants.
  //=======================
  static fetchRestaurants(callback) {
    const imagesAlt = [
      "Some people having fun while eating",
      "a big tasty pizza",
      "Stylish food court with polished wooden chairs",
      "Nice exterior scene for the restaurant during night",
      "People eating while the restaurant staff appears preparing pizza behind",
      "Simple decorative with wooden chairs and roof and big flag of America",
      "Exterior scene for restaurant in black and white",
      "A magnificent exterior scene for the restaurant during the day",
      "Close up picture in black and white, Many Asians eating using sticks",
      "A modern decorative theme in white and light grey appears bar and many tables"
    ];

    dbPromise = idb.open('fetchedData', 1, upgradedDB => {
      switch (upgradedDB.oldVersion) {
        case 0:
        case 1:
        upgradedDB.createObjectStore('objStore', {keyPath: 'id'});
      }
    });

    dbPromise.then(db => {
      return db.transaction('objStore')
        .objectStore('objStore').getAll();
    }).then(restaurants => {
      if (restaurants != false) {
        callback(null, restaurants);
      } else {
        fetch('http://127.0.0.1:1337/restaurants').then((res) => {
          if (res.status === 200) {
            return res.json();
          } else {
            // Oops!. Got an error from server.
            var error = "Request failed. Returned status of " + res.status;
            callback(error, null);
          }
        }).then(restaurants => {
          restaurants.map((restaurant, index) => {
            restaurant.photograph = {
              photoJPG400: restaurant.id + "_400.jpg",
              photoJPG: restaurant.id + ".jpg",
              photoWebp400: restaurant.id + "_400.webp",
              photoWebp: restaurant.id + ".webp",
              alt: imagesAlt[index]
            };
          });
          dbPromise.then(db => {
            const tx = db.transaction('objStore', 'readwrite');
            restaurants.map(restaurant => {
              tx.objectStore('objStore').put(
                restaurant
              )
              return tx.complete;
            });
            callback(null, restaurants);
          }).catch(function (err) {
              console.log(err);
          });
        });
      };
    });
  }
  //==============================
  // Fetch a restaurant by its ID.
  //==============================
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
          const restaurant = restaurants[id - 1];
          if (restaurant != false) { // Got the restaurant
            callback(null, restaurant);
          } else { // Restaurant does not exist in the database
            callback('Restaurant does not exist', null);
          }
      }
    });
  }

  //================================================================
  // Fetch restaurants by a cuisine type with proper error handling.
  //================================================================
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  //================================================================
  // Fetch restaurants by a neighborhood with proper error handling.
  //================================================================
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  //==============================================================================
  // Fetch restaurants by a cuisine and a neighborhood with proper error handling.
  //==============================================================================
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  //====================================================
  // Fetch all neighborhoods with proper error handling.
  //====================================================
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  //===============================================
  // Fetch all cuisines with proper error handling.
  //===============================================
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  //=====================
  // Restaurant page URL.
  //=====================
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  //=======================
  // Restaurant image URLs.
  //=======================
  static pictureSrcsetForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph.photoWebp400} 400w, /img/${restaurant.photograph.photoWebp} 800w`);
  }

  static imageSrcsetForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph.photoJPG400} 400w, /img/${restaurant.photograph.photoJPG} 800w`);
  }

  static imageSrcForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph.photoJPG}`);
  }

  static imageAltForRestaurant(restaurant) {
    return (`${restaurant.photograph.alt}`);
  }

  //=============================
  // Map marker for a restaurant.
  //=============================
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}

//===============
// Accessibility.
//===============
window.addEventListener('load', () => {
    document.querySelector('iframe').setAttribute('tabIndex', '-1');
});
let dbPromise;