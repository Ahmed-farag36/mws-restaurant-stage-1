//==================================
// Common database helper functions.
//==================================
class DBHelper {

  //===============================
  // Create IndexedDB objectStores.
  //===============================
  static createIDBObjectStores() {
    dbPromise = idb.open('fetchedData', 1, upgradedDB => {
      switch (upgradedDB.oldVersion) {
        case 0:
        upgradedDB.createObjectStore('restaurantsStore', {keyPath: 'id'});
        for (let i = 1; i <= 10; i++) {
          upgradedDB.createObjectStore(`reviewsStore${i}`, {keyPath: 'id'});
        }
      }
    });
  }

  //=============================
  // Fetch and cache restaurants.
  //=============================
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

    dbPromise.then(db => {
      return db.transaction('restaurantsStore')
        .objectStore('restaurantsStore').getAll();
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
            const tx = db.transaction('restaurantsStore', 'readwrite');
            restaurants.map(restaurant => {
              tx.objectStore('restaurantsStore').put(
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

  //=========================
  // Fetch and cache reviews.
  //=========================
  static fetchReviewsById(id, callback) {
    dbPromise.then(db => {
      return db.transaction(`reviewsStore${id}`)
        .objectStore(`reviewsStore${id}`).getAll();
    }).then(reviews => {
      if (reviews != false) {
        callback(null, reviews);
      } else {
        fetch(`http://localhost:1337/reviews/?restaurant_id=${id}`).then((res) => {
          if (res.status === 200) {
            return res.json();
          } else {
            // Oops!. Got an error from server.
            var error = "Request failed. Returned status of " + res.status;
            callback(error, null);
          }
        }).then(reviews => {
          dbPromise.then(db => {
            const tx = db.transaction(`reviewsStore${id}`, 'readwrite');
            reviews.map(review => {
              tx.objectStore(`reviewsStore${id}`).put(
                review
              )
              return tx.complete;
            });

            callback(null, reviews);
          }).catch(function (err) {
              console.log(err);
          });
        })
      };
    });
  }

  //========================
  //Add review to IndexedDB.
  //========================
  static addReviewToIndexedDB(review) {
    dbPromise.then(db => {
      db.transaction(`reviewsStore${review.restaurant_id}`, 'readwrite').objectStore(`reviewsStore${review.restaurant_id}`).put(review);
    })
  }

  //=================================
  // Check if restaurant is favorite.
  //=================================
  static isRestaurantFavorite(btn , restaurant) {
    if (restaurant.is_favorite == 'true') {
      btn.style.color = 'lightgreen';
      btn.setAttribute('aria-label', 'favorite checked')
    } else {
      btn.style.color = 'lightgrey';
      btn.setAttribute('aria-label', 'favorite unchecked')
    }
  }

  //=============================
  //handle favorite click button.
  //=============================
  static handleBtnClick(btn, restaurantIndex) {
    let isFavorite = null;
    dbPromise.then(db => {
      return db.transaction('restaurantsStore').objectStore('restaurantsStore').get(restaurantIndex)
    }).then(restaurant => {
      if (restaurant.is_favorite == 'true') {
        isFavorite = 'false';
        btn.style.color = 'lightgray'
      } else {
        isFavorite = 'true';
        btn.style.color = 'lightgreen'
      }
      fetch(`http://localhost:1337/restaurants/${restaurantIndex}/?is_favorite=${isFavorite}`, {
        method: 'PUT'
      }).then(() => {
        restaurant.is_favorite = isFavorite;
        dbPromise.then(db => {
          db.transaction('restaurantsStore', 'readwrite').objectStore('restaurantsStore').put(restaurant);
        })
      })
    })
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
DBHelper.createIDBObjectStores();