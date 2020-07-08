import React from 'react';
import './App.css';
import Navbar from './components/Navbar';
import ChartContainer from './containers/ChartContainer';
import newDeathsContainer from './containers/newDeathsContainer';
import LandingPage from './pages/LandingPage';
import * as ROUTES from "./constants/routes";

import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import Mapportal from './components/Mapportal';

class App extends React.Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Navbar />
          <Switch>
            <Route exact path={ROUTES.LANDING} component={LandingPage} />
            <Route exact path={ROUTES.US_NATIONAL_CUM} component={ChartContainer} />
            <Route exact path={ROUTES.US_NATIONAL_INC} component={newDeathsContainer} />
            <Route exact path={ROUTES.MAP_PORTAL} component={Mapportal} />
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
