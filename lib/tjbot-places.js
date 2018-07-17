'use strict';
const got = require("got");
const qs = require("querystring");
const baseUrl = 'https://maps.googleapis.com/maps/api';

function checkApiKey(apiKey){
    if (!apiKey)
        throw new Error('Api key is required!');
};

function makeRequest(url, option){
    return got(url + qs.stringify(option));
};

class Ubicacion{
    constructor(entry){
        this.place_id = entry.place_id;
        this.name = entry.name;
        if(typeof entry.formatted_address !== 'undefined'){
            this.address = entry.formatted_address;
        }else if(typeof entry.vicinity !== 'undefined'){
            this.address = entry.vicinity;
        }else{
            this.address = null;
        }
        if(typeof entry.geometry !== 'undefined' && entry.geometry != null && entry.geometry.location!=null){
            this.latitude = entry.geometry.location.lat;
            this.longitude = entry.geometry.location.lng;
        }else{
            this.latitude=null;
            this.longitude=null;
        }
        if(typeof entry.types !== 'undefined'){
            this.types = entry.types;
        }else{
            this.types=[];
        }
        if(typeof entry.rating !== 'undefined'){
            this.rating = entry.rating;
        }else{
            this.rating=null;
        }
    }
}

function parseUbicacionArray(arreglo){
    if(arreglo != null && Array.isArray(arreglo)){
        var res = [];
        arreglo.forEach(function(element){
            res.push(new Ubicacion(element));
        });
        return res;
    }else{
        return null;
    }
}

module.exports = class tjbot-places {

    constructor(apiKey) {
        this.apiKey = apiKey;
    }
	
	getPlaces(name){
		checkApiKey(this.apiKey);

        if (!name)
			throw new Error('PlaceName parameter is Required!');
			return makeRequest(baseUrl + '/place/findplacefromtext/json?', {
				input: name,
				inputtype:'textquery',
				language:'es',
                key: this.apiKey,
                fields:"geometry,types,formatted_address,name,place_id"
            })
            .then((response) => {
                let res = JSON.parse(response.body);
                if (res.status === 'REQUEST_DENIED') throw new Error(res.error_message);
                return parseUbicacionArray(res.candidates);
            });

    }

    getPlace(name){
        checkApiKey(this.apiKey);

        if (!name)
			throw new Error('PlaceName parameter is Required!');
			return makeRequest(baseUrl + '/place/findplacefromtext/json?', {
				input: name,
				inputtype:'textquery',
				language:'es',
                key: this.apiKey,
                fields:"geometry,types,formatted_address,name,place_id"
            })
            .then((response) => {
                let res = JSON.parse(response.body);
                if (res.status === 'REQUEST_DENIED') throw new Error(res.error_message);
                if(res.candidates != null && res.candidates.length >0){
                    return new Ubicacion(res.candidates[0]);
                }else{
                    return null;
                }
            });
    }
    getPlacesNear(latitude,longitude,type){
        checkApiKey(this.apiKey);
        if(!latitude){throw new Error("Latitud parameter is Required");}
        if(!longitude){throw new Error("Longitude parameter is Required");}
        if(!type){throw new Error("Type parameter is Required");}
        return makeRequest(baseUrl + '/place/nearbysearch/json?', {
            location: latitude +', '+longitude,
			keyword:type,
            language:'es',
            radius:'1500',
            key: this.apiKey
        }).then((response) => {
            let res = JSON.parse(response.body);
            if (res.status === 'REQUEST_DENIED') throw new Error(res.error_message);
            //let out = parseUbicacionArray(res.results);
            return parseUbicacionArray(res.results);
        });
    }

    getPlaceDetailsByName(name){
        return this.getPlaceByName(name).then(res => {
            if(res != null && res.candidates != null && res.candidates.length > 0){
                return this.getPlaceDetails(res.candidates[0].place_id)
            }else{
                return null;
            }
        });
    }

    getLocation(adrs) {
        checkApiKey(this.apiKey);

        if (!adrs)
            throw new Error('Address parameter is Required!');

        return makeRequest(baseUrl + '/geocode/json?', {
                address: adrs,
                inputtype:'textquery',
				language:'es',
                key: this.apiKey
            })
            .then((response) => {
                let res = JSON.parse(response.body);
                if (res.status === 'REQUEST_DENIED') throw new Error(res.error_message);
                return res.results[0];
            });
    }

    getGeoLocation(adrs) {
        checkApiKey(this.apiKey);

        if (!adrs)
            throw new Error('Address parameter is Required!');

        return makeRequest(baseUrl + '/geocode/json?', {
                address: adrs,
                key: this.apiKey
            })
            .then((response) => {
                let res = JSON.parse(response.body);
                if (res.status === 'REQUEST_DENIED') throw new Error(res.error_message);
                return res.results[0].geometry.location;
            });
    }
    nearBySearch(options) {
        checkApiKey(this.apiKey);

        if (!options.geoCode || !options.geoCode instanceof Object)
            throw new Error('latitude and longitude required and in correct format');

        return makeRequest(baseUrl + '/place/nearbysearch/json?', {
                location: `${options.geoCode.lat},${options.geoCode.lng}`,
                radius: 6000,
                type: options.searchType,
                key: this.apiKey
            })
            .then((response) => {
                let res = JSON.parse(response.body);
                if (res.status === 'REQUEST_DENIED') throw new Error(res.error_message);
                return res.results;
            });
    }
    getPlaceImage(photo_reference) {
        checkApiKey(this.apiKey);

        return makeRequest(baseUrl + '/place/photo?', {
                maxwidth: 400,
                photoreference: photo_reference,
                key: this.apiKey
            })
            .then((response) => {
                return response.url;
            });
    }
    getPlaceDetails(placeId) {
        checkApiKey(this.apiKey);

        if (!placeId)
            throw new Error('PlaceId is Expexted!');

        return makeRequest(baseUrl + '/place/details/json?', {
                placeid: placeId,
                language:'es',
                key: this.apiKey
            })
            .then((response) => {
                let res = JSON.parse(response.body);
                if (res.status === 'INVALID_REQUEST') throw new Error('Invalid Request!');
                return res.result;
                //return buildResponseForPlaceDetails(res.result);
            });
    }
};
