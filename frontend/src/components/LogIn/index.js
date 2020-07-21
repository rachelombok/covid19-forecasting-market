import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class Login extends React.Component{
    constructor(props) {
        super(props)
        this.state = { username: '', password: '' }
      }

    saveLogin(username, password) {
        fetch('/login/',{
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({"username": username, "password": password}),
        });
    }

    handleChange(event) {
      let name = event.target.name;
      if (name == 'username'){
        this.setState({ username: event.target.value})
      }
      if (name == 'password'){
        this.setState({ password: event.target.value})
      }
    }
    
    handleSubmit(event) {
        this.saveLogin(this.state.username, this.state.password)
        event.preventDefault()
      }
    
      render() {
        return (
          <form onSubmit={this.handleSubmit.bind(this)}>
            <h1>Sign In</h1>
            <span>Username</span>
            <input
              type="text"
              value={this.state.username}
              onChange={this.handleChange.bind(this)}
              name='username'
            />
            <span>Password</span>
            <input
              type="text"
              value={this.state.password}
              onChange={this.handleChange.bind(this)}
              name='password'
            />
            <input type="submit" value="Submit" />
          </form>
        )
      }
}

export default Login;