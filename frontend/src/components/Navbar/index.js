import React from 'react';
import * as ROUTES from '../../constants/routes';

class Navbar extends React.Component {
 

  render() {
    return (
     <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
       <a className="navbar-brand" href="#">Navbar</a>
       <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
         <span className="navbar-toggler-icon"></span>
       </button>
       <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
       <div className="navbar-nav">
         <a className="nav-item nav-link active" href={ROUTES.LANDING}>Home <span className="sr-only">(current)</span></a>
         <a className="nav-item nav-link" href={ROUTES.ABOUT}>About</a>
         <a className="nav-item nav-link" href={ROUTES.SIGN_IN}>Sign in</a>
         <a className="nav-item nav-link" href={ROUTES.SIGN_UP}>Sign Up</a>
         <a className="nav-item nav-link" href={ROUTES.PROFILE}>My Profile</a>
         <a className="nav-item nav-link" href={ROUTES.LEADERBOARD}>Top Forecasts</a>
        
       </div>
       </div>
     </nav>
    );
  }
}

export default Navbar;
