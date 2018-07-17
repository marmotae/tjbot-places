# TJBot Places Linrary
## Introduction
This library was coded to allow for simplified access into the google places api for use with the IBM TJBot through Watson Assystant dialogs, thus you might find a very small subset of the places API functionality as it is intended to be used through a natural language dialog through voice.

## Instructions
In order to use the library one should include it by requiring `tjbot-places`. Two functions are currently available, one that searches for a place by name `getPlace(searchString)` and another one that searches for places that are nearby a particular location and that respond to a particular keyword such as __restaurant__ `getPlacesNear(latitude, longitude, keyword)`.

> __Note:__ In order to use this library you need to get a Google API kye configured to use the Google Places api

```
const tjbot_places = require('tjbot-places');
 
const client = new tjbot_places('GOOGLEPLACES_APIKEY');

// Example to get a place by name and then get nearby restaurants
// in this case we will search for IBM Mexico's Offices
client.getPlace('ibm mexico').then(res =>{
    // show the json for the place object
	console.log(JSON.stringify(res));
	console.log("========================");
	var type="Restaurant";
    // query restaurants near ibm mexico
	client.getPlacesNear(res.latitude,res.longitude,type).then(res => {
		//The result is an array of places 
		res.forEach(function (elem){
			console.log(elem.name+' - '+elem.rating);
		});
	});
});

```
