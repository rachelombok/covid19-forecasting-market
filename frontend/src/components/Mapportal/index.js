import React, { Component } from 'react'
import { render } from 'react-dom'
import L from 'leaflet';
import {Map, TileLayer, Marker, Popup, GeoJSON} from 'react-leaflet';
import countries from './countries.json';
import states from './us-states.json';

const style = {
  width: "100%",
  height: "600px"
};

const getColor = (d) => {
  return d > 1000 ? '#800026' :
         d > 500  ? '#BD0026' :
         d > 200  ? '#E31A1C' :
         d > 100  ? '#FC4E2A' :
         d > 50   ? '#FD8D3C' :
         d > 20   ? '#FEB24C' :
         d > 10   ? '#FED976' :
                    '#FFEDA0';
}

const mapstyle = (feature) => {
  return {
    fillColor: getColor(feature.properties.bloop),
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.7
  };
};
class Mapportal extends React.Component {
  componentDidMount() {
    var country;


    this.map = L.map("map", {
      center: [37.8, -96],
      zoom: 4,
      layers: [
        L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoicmFjaGVsb21ib2siLCJhIjoiY2tjODZ6c3UzMTh3ZTJyb2JndHN0dXhlOSJ9.h8aubFClamI3kiUsjIgNTg",
        {
          maxZoom: 18,
          attribution:
            'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
          id: "mapbox/dark-v10"
        })
      ]
    });

 

    this.geojson = L.geoJson(countries, {
      style: mapstyle,
      onEachFeature: this.onEachFeature
    }).addTo(this.map);

    this.states = L.geoJSON(states, {
      style: mapstyle,
      onEachFeature: this.onEachFeature
    }).addTo(this.map);

    var overlay = {
      "Countries": this.geojson,
      "States" : this.states
  };
  L.control.layers(overlay).addTo(this.map);

  }

  

  onEachFeature = (feature, layer) => {
    layer.bindTooltip(feature.properties.name.toString(),{noHide:true}).openTooltip();
    layer.on({
      mouseover: this.highlightFeature,
      mouseout: this.resetHighlight
      //click: this.zoomToFeature
    });
  }

  highlightFeature = (e) => {
    var layer = e.target;
    layer.setStyle({
      weight: 5,
      color: "#666",
      dashArray: "",
      fillOpacity: 0.7
    });

    layer.bringToFront();

  }

  resetHighlight = (event) => {
    this.geojson.resetStyle(event.target);
  
  }



  render() {
    return <div id="map" style={style} />;
  }

    // `component` is now the first argument, since it's passed through the Function.bind method, we'll need to pass it through here to the relevant handlers

  }
  

export default Mapportal;
//ReactDOM.render(<Mapportal />, document.getElementById('mapportal'))