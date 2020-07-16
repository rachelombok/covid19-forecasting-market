import React from 'react';
import LineChart from '../../components/LineChart';
import ModelsChart from '../../components/ModelsChart';
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
      userPrediction: null,
      aggregate: null
    };
  }

  componentDidMount() {
    fetch('/us-cum-deaths-forecasts').then(res => res.json()).then(data => {
      const [results, orgs] = organizeData(data);
      this.setState({ data: results, orgs });
    });
    fetch('/user-prediction').then(res => res.json()).then(data => {
      this.setState({ userPrediction: data });
    });
    fetch('/us-cum-deaths-confirmed').then(res => res.json()).then(data => {
      this.setState({ confirmed: data });
    });
    fetch('/us-agg-cum-deaths').then(res => res.json()).then(data => {
      this.setState({ aggregate: data });
    });
  }

  render() {
    //const { data, orgs, userPrediction, confirmed } = this.state;
    const { data, orgs, confirmed, userPrediction, aggregate } = this.state;

    //if (!data || !orgs || !userPrediction || !confirmed) return 'Loading...';
    if (!data || !orgs || !confirmed || !userPrediction || !aggregate) return 'Loading...';

    return (
      <div className="chartContainer">
        <LineCharts
          dataSet={data}
          orgs={orgs}
          userPrediction={userPrediction}
          confirmed={confirmed}
        />
        <ModelsChart 
          data={data} 
          orgs={orgs}
          confirmed={confirmed}
          aggregate={aggregate} 
        />
      </div>
    );
  }
}

export default ChartContainer;
