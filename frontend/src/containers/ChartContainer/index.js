import React from 'react';
import LineChart from '../../components/LineChart';
import { cleanConfirmedData, organizeData } from '../../utils/data';

function LineCharts({ dataSet, orgs, userPrediction, confirmed }) {
  return dataSet.map((data, index) => {
    return (
      <LineChart data={data} org={orgs[index]} userPrediction={userPrediction} confirmed={confirmed} />
     );
  })
}

class ChartContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      orgs: null,
      confirmed: null,
      userPrediction: null
    };
  }

  componentDidMount() {
    fetch('/forecasts').then(res => res.json()).then(data => {
      const [results, orgs] = organizeData(data);
      this.setState({ data: results, orgs });
    });
    fetch('/user-prediction').then(res => res.json()).then(data => {
      this.setState({ userPrediction: data });
    });
    fetch('/us_confirmed').then(res => res.json()).then(data => {
      const result = JSON.parse(data);
      this.setState({ confirmed: result });
    });
  }

  render() {
    const { data, orgs, userPrediction, confirmed } = this.state;

    if (!data || !orgs || !userPrediction || !confirmed) return 'Loading...';

    return (
      <div className="chartContainer">
        <LineCharts
          dataSet={data}
          orgs={orgs}
          userPrediction={userPrediction}
          confirmed={confirmed}
        />
      </div>
    );
  }
}

export default ChartContainer;
