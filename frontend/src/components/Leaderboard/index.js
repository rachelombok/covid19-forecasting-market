import React from 'react';




class Leaderboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: null
    }
  }

  componentDidMount() {
    fetch('/leaderboard-data').then(res => res.json()).then(data => {
      this.setState({ users: data });
    });
  }

  renderTable() {
    return this.state.users.map((user, index) => {
      return (
         <tr>
            <td>{user['name']}</td>
            <td>{user['score']}</td>
         </tr>
      );
   });
  }

  render() {
    const { users } = this.state;
    if (!users) return 'Loading...';

    return (
      <div>
        <table>
          <tbody>
            {this.renderTable()}
          </tbody>
        </table>
      </div>
    );
  }
}
  
export default Leaderboard;