import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class SignUp extends React.Component{
    constructor(props) {
        super(props)
        this.state = { nam:'', username: '', password: '' }
      }

    saveLogin(nam, username, password) {
        fetch('/signup/',{
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({"name": nam, "username": username, "password": password}),
        });
    }

    handleChange(event) {
      let name = event.target.name;
      if (name == 'nam'){
        this.setState({ nam: event.target.value})
      }
      if (name == 'username'){
        this.setState({ username: event.target.value})
      }
      if (name == 'password'){
        this.setState({ password: event.target.value})
      }

    }
    
    handleSubmit(event) {
        this.saveLogin(this.state.nam, this.state.username, this.state.password)
        event.preventDefault()
      }
    
      render() {
        return (
          <form onSubmit={this.handleSubmit.bind(this)}>
            <h1>Hello {this.state.nam}</h1>
            <input
              type="text"
              value={this.state.nam}
              onChange={this.handleChange.bind(this)}
              name='nam'
            />
            <input
              type="text"
              value={this.state.username}
              onChange={this.handleChange.bind(this)}
              name='username'
            />
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

export default SignUp;