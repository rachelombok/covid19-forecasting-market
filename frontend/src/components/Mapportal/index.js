import React, { Component } from 'react'
import { render } from 'react-dom'
import {Map, TileLayer, Marker, Popup, GeoJSON} from 'react-leaflet';
import countries from './countries.json';

class Mapportal extends React.Component {
    constructor() {
      super()
      this.state = {
        lat: 51.505,
        lng: -0.09,
        zoom: 13
      }
    }

    style(feature) {
      return {
        color: '#4a83ec',
        weight: 0.5,
        fillColor: "#1a1d62",
        fillOpacity: 1
      };
    };

    highlightFeature(e) {
      var layer = e.target;
    
      layer.setStyle({
          weight: 5,
          color: '#666',
          dashArray: '',
          fillOpacity: 0.7
      });
    }

  

    resetHighlight(e) {
      this.refs.geojson.leafletElement.resetStyle(e.target);
  }


  
    render() {
      const position = [this.state.lat, this.state.lng];
      return (
        <Map center={position} zoom={13} style={{ width: '100%', height: '600px' }}
        >
          <TileLayer
            attribution='bloop'
            url='https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoicmFjaGVsb21ib2siLCJhIjoiY2tjODZ6c3UzMTh3ZTJyb2JndHN0dXhlOSJ9.h8aubFClamI3kiUsjIgNTg'
            id= 'mapbox/dark-v10'
          />
          <GeoJSON data={countries} 
          style={this.style.bind(this)}
          onEachFeature= {this.onEachFeature}
          ref='geojson'
          ></GeoJSON>
        </Map>
      );
    }

    // `component` is now the first argument, since it's passed through the Function.bind method, we'll need to pass it through here to the relevant handlers
onEachFeature (component, feature, layer) {
  layer.on({
    mouseover: this.highlightFeature,
    mouseout: this.resetHighlight.bind(null, component)
    //click: zoomToFeature
  });
}
  }
  

export default Mapportal;
//ReactDOM.render(<Mapportal />, document.getElementById('mapportal'))