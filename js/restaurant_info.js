let restaurant,
    map,
    reviewstToBePosted = [];

//=========================================
// Initialize Google map, called from HTML.
//=========================================
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
};

//======================================
// Get current restaurant from page URL.
//======================================
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      handleFavorite(restaurant);
      getNewReviewData(restaurant);
      callback(null, restaurant)
    });
  }
};

//==================================================
// Create restaurant HTML and add it to the webpage.
//==================================================
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;
  const address = document.getElementById('restaurant-address');
  address.innerHTML += restaurant.address;
  address.setAttribute('aria-label', `address ${restaurant.address}`);
  const source = document.getElementById('picture-source');
  source.srcset = DBHelper.pictureSrcsetForRestaurant(restaurant);
  const image = document.getElementById('restaurant-img');
  image.src = DBHelper.imageSrcForRestaurant(restaurant);
  image.srcset = DBHelper.imageSrcsetForRestaurant(restaurant);
  image.alt = DBHelper.imageAltForRestaurant(restaurant);
  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML += restaurant.cuisine_type;
  cuisine.setAttribute('aria-label', `${restaurant.cuisine_type} cuisine`);
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  staticMap.src = `https://maps.googleapis.com/maps/api/staticmap?autoscale=1&size=600x400&maptype=roadmap&key=AIzaSyCXNkwhLgTjLW6kp53ycXcUo14c4csJzWU&format=png&visual_refresh=true&markers=size:mid%7Ccolor:0xff0000%7Clabel:1%7C${restaurant.name},+NY`
  fetchReviewsById(restaurant)
};

//========================================================================
// Create restaurant operating hours HTML table and add it to the webpage.
//========================================================================
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');
    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);
    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);
    hours.appendChild(row);
  }
};

//================================
// Fetch reviews for a restaurant.
//================================
fetchReviewsById = (restaurant = self.restaurant) => {
  let restaurantRelatedReviews = [];
  DBHelper.fetchReviewsById(restaurant.id, (error, reviews) => {
    if (error) {
      callback(error, null);
    } else {
      reviews.map(review => {
        if (restaurant.id == review.restaurant_id) {
          restaurantRelatedReviews.unshift(review)
        }
      })
    }
    fillReviewsHTML(restaurantRelatedReviews);
  })
}

//=====================================================
// Create all reviews HTML and add them to the webpage.
//=====================================================
fillReviewsHTML = (reviews) => {
  const container = document.getElementById('reviews-container');
  if (reviews == false) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  ul.innerHTML = "";
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
};

//==============================================
// Create review HTML and add it to the webpage.
//==============================================
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  let formatedDate = new Date(review.updatedAt).toDateString();
  date.innerHTML = formatedDate;
  li.appendChild(date);

  const rating = document.createElement('p');
  for(let i = 0; i < review.rating; i++) {
    rating.innerHTML += '<i class="icon-star-full"></i>';
  }
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);
  return li;
};

//==============================
// Extract new review form data.
//==============================
getNewReviewData = restaurant => {
  document.querySelector('#submit-review-btn').onclick = e => {
    e.preventDefault();
    const name = document.querySelector('#name').value;
    const rating = document.querySelector('#rating').value;
    const comments = document.querySelector('#comments').value;
    const restaurant_id = restaurant.id;
    if (postNewReview({name, rating, comments, restaurant_id})) {
      document.querySelector('#name').value = '';
      document.querySelector('#rating').value = '';
      document.querySelector('#comments').value = '';
    }
  }
}

//=================
// Post new review.
//=================
postNewReview = ({name, rating, comments, restaurant_id}) => {
  if (formValidation(name, rating, comments)) {
    if (navigator.onLine) {
      fetch('http://localhost:1337/reviews', {
        method: 'POST',
        body: JSON.stringify({
          restaurant_id,
          name,
          rating,
          comments
        })  ,
        headers: {
          'Content-Type': 'application/json',
        }
      }).then(res => res.json()).then(review => {
        DBHelper.addReviewToIndexedDB(review);
        fetchReviewsById(restaurant)
      }).catch(err => {
        throw err;
      });
      return true;
    } else {
      const statusLog = document.querySelector('#error');
      statusLog.textContent = `Your review will be submitted once you back online...`;
      if (window.localStorage) {
        reviewstToBePosted.push({name, rating, comments, restaurant_id});
        localStorage.setItem(`reviews${restaurant_id}`, JSON.stringify(reviewstToBePosted));
      }
      return true;
    }
  }
  return false;
}

//==============================
// Add comments form validation.
//==============================
formValidation = (name, rating, comments) => {
  let errorLog = document.querySelector('#error');
    errorLog.innerHTML = "";
    if (!name || !rating || !comments) {
      errorLog.innerHTML = `<i class="icon-warning"></i> Please fill the following fields: ${name ? '' : 'Name, '} ${rating ? '' : 'Rating, '} ${comments ? '' : 'Comment.'}`;
      return false;
    }
    if (rating > 5 || rating < 1) {
      errorLog.innerHTML = `Please enter your rate between 1 and 5`;
      return false;
    }
    return true;
}

//=================
// Syncing reviews.
//=================
window.addEventListener('online', e => {
  if (localStorage.length) {
    for (let i = 0; i < localStorage.length; i++) {
        JSON.parse(localStorage.getItem(localStorage.key(i))).map(review => {
          postNewReview(review);
        })
      }
    localStorage.clear();
    reviewstToBePosted = [];
  }
})

//=======================================================
// Add restaurant name to the breadcrumb navigation menu.
//=======================================================
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
  breadcrumb.lastChild.setAttribute('aria-current', 'page');
};

//=======================================
// Get a parameter by name from page URL.
//=======================================
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

//============================
// Handle favorite restaurant.
//============================
handleFavorite = restaurant => {
  const btn = document.querySelector('#fav-btn');
  DBHelper.isRestaurantFavorite(btn, restaurant);
  btn.onclick = () => DBHelper.handleBtnClick(btn, restaurantIndex = restaurant.id);
}

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