import React from 'react';




class ProfilePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null
    }
  }

  componentDidMount() {
    fetch('/user').then(res => res.json()).then(data => {
      this.setState({ user: data });
    });
  }

  renderUser() {
    return (
        <div>
            <p><b>Name: </b>{ this.state.user['name'] }</p>
            <p><b>Poll score: </b>{ this.state.user['score'] }</p>
            <p><b>Country/Location: </b></p>
            <p><b>Bio: </b></p>
        </div>
    );
  }

  render() {
    const { user } = this.state;
    if (!user) return 'Loading...';

    return (
        <div>
            {this.renderUser()}
        </div>
    );
  }
}
  
export default ProfilePage;