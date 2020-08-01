import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Redirect } from "react-router";


class SignUp extends React.Component{
    constructor(props) {
        super(props)
        this.state = { nam:'', email: '', username: '', password: '', loginStatus: false }
      }

    saveLogin(nam, email, username, password) {
      return new Promise((resolve, reject) => {
        fetch('/signup/',{
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({"name": nam, "email": email, "username": username, "password": password}),
        });
        resolve();
      })
    }

    handleChange(event) {
      let name = event.target.name;
      if (name == 'nam'){
        this.setState({ nam: event.target.value})
      }
      if (name == 'email'){
        this.setState({ email: event.target.value})
      }
      if (name == 'username'){
        this.setState({ username: event.target.value})
      }
      if (name == 'password'){
        this.setState({ password: event.target.value})
      }

    }

    updateLoginState = () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          fetch('/login-status/')
          .then((response) => response.json())
          .then((data) => {
            this.setState({loginStatus: data['logged in']});
            console.log(data['logged in']);
            resolve(data['logged in']);
          });
        }, 300)
      })
    }
    
    async handleSubmit(event) {
      event.preventDefault()
      await this.saveLogin(this.state.nam, this.state.email, this.state.username, this.state.password)
      this.updateLoginState();
      }
    
      render() {
        if (this.state.loginStatus) {
          //return <Redirect to="/" />
          window.location.href ='/'
        }
        return (
          <form onSubmit={this.handleSubmit.bind(this)}>
            <h1>Sign Up</h1>
            <span>Name</span>
            <input
              type="text"
              value={this.state.nam}
              onChange={this.handleChange.bind(this)}
              name='nam'
            />
            <span>Email</span>
            <input
              type="text"
              value={this.state.email}
              onChange={this.handleChange.bind(this)}
              name='email'
            />
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

export default SignUp;