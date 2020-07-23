import React, { Component } from 'react';
import { useHistory } from "react-router-dom";
import ReactDOM from 'react-dom';
import './Login.css';

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

    wasSucess(){
      fetch('/login/',{ method: 'GET'})
      .then(function (response) {
        return response.text();
    }).then(function (textie) {
        window.alert(textie)
        console.log(textie); // Print the greeting as text
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
        event.preventDefault()
        this.saveLogin(this.state.username, this.state.password)
        this.wasSucess();

      }


    
      render() {
        return (
          <form onSubmit={this.handleSubmit.bind(this)} class='form-group'>
            <h1>Sign In</h1>
            <label>Username</label>
            <input
              type="text"
              value={this.state.username}
              onChange={this.handleChange.bind(this)}
              name='username'
            /><br></br>
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