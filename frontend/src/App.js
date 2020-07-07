import React from 'react';
import './App.css';
import Navbar from './components/Navbar';
import ChartContainer from './containers/ChartContainer';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

class App extends React.Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Navbar />
          <Switch>
            <Route exact path="/">
              <ChartContainer />
            </Route>
            <Route exact path="/blah">
              "BLAH PAGE"
            </Route>
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
