import React, {Component} from 'react';
import style from './../styles/styles.less';

// https://d3js.org/
import * as d3 from 'd3';

// https://www.chartjs.org/
import Chart from 'chart.js';
import 'chartjs-plugin-datalabels';

let path_prefix, chart, interval;
if (location.href.match('localhost')) {
  path_prefix = './';
}
else {
  path_prefix = 'https://raw.githubusercontent.com/ebuddj/2020-national_polls/main/public/';
}

// https://abbreviations.yourdictionary.com/articles/standard-month-and-days-of-the-week-abbreviations.html
const months = ['Jan.','Feb.','March 2020','April','May','June','July','August','Septemper','October','November','December'];

class App extends Component {
  constructor(props) {
    super(props);

    this.appRef = React.createRef();
    this.chartRef = React.createRef();

    this.state = {
    }
  }
  componentDidMount() {
    this.getData(); 
  }
  componentDidUpdate(prevProps, prevState, snapshot) {

  }
  componentWillUnMount() {
    clearInterval(interval);
  }
  getData() {
    d3.json('./data/polling-average.json').then((data) => {
      let poll_data_r = [];
      let poll_data_d = [];
      let chart_data = {
        labels:[],
        // https://www.chartjs.org/docs/latest/charts/line.html#line-styling
        datasets:[{
          borderColor:'rgba(240, 119, 99, 1)',
          data:[],
          pointRadius:0,
          fill:false,
          label:'D'
        },{
          borderColor:'rgba(105, 141, 197, 1)',
          pointRadius:0,
          fill:false,
          data:[],
          label:'R'
        }]
      };
      data = data.reverse();
      data.map((values, i) => {
        if (values.candidate === 'Donald Trump') {
          let data = values.date.split('-');
          if (data[2] === '01') {
            chart_data.labels.push(months[parseInt(data[1]) - 1]);
          }
          else {
            chart_data.labels.push('');
          }
          poll_data_r.push(values.pct_trend_adjusted);
        }
        else {
          poll_data_d.push(values.pct_trend_adjusted);
        }
      });
      this.createChart(chart_data, poll_data_r, poll_data_d);
    });
  }
  createChart(chart_data, poll_data_r, poll_data_d) {
    let ctx = this.chartRef.current.getContext('2d');

    chart = new Chart(ctx, {
      data:chart_data,
      options:{
        animation:{
          duration:2000,
        },
        hover:{
          enabled:false,
        },
        legend:{
          display:false
        },
        onHover:(event, chartElement) => {
          // event.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
        },
        datasetFill: false,
        plugins: {
          // https://chartjs-plugin-datalabels.netlify.app/guide/options.html
          datalabels:{
            align:'left',
            anchor:'center',
            color:'#000',
            offset:0,
            font:{
              size:26,
              weight:'bold'
            },
            formatter: (value, context) => {
              if (value == 52.03194 || value == 43.18202) {
                return (Math.round((value + Number.EPSILON) * 10) / 10).toFixed(1) + '%\n\n';
              }
              else {
                return null;
              }
            }
          },
        },
        scales:{
          xAxes:[{
            display:true,
            gridLines:{
              display:false
            },
            ticks:{
              autoSkip:false,
              fontColor:'#000',
              fontSize:14,
              fontStyle:'bold',
              maxRotation:0,
              minRotation:0,
              z:9999
            },
            stacked:false
          }],
          yAxes:[{
            display:true,
            stacked:false,
            ticks:{
              fontColor:'#000',
              fontSize:14,
              fontStyle:'bold',
              suggestedMax:65,
              suggestedMin:30
            }
          }]
        },
        title:{
          display:false,
        },
        tooltips:{
          enabled:false
        }
      },
      type:'line'
    });
    this.createInterval(poll_data_r, poll_data_d);
  }
  createInterval(poll_data_r ,poll_data_d) {
    let interval = setInterval(() => {
      let poll_value_r = poll_data_r.shift();
      let poll_value_d = poll_data_d.shift();
      if (!poll_data_r) {
        clearInterval(interval)
      }
      chart.data.datasets[0].data.push(poll_value_r);
      chart.data.datasets[1].data.push(poll_value_d);
      chart.update(0);
    }, 20);
  }
  // shouldComponentUpdate(nextProps, nextState) {}
  // static getDerivedStateFromProps(props, state) {}
  // getSnapshotBeforeUpdate(prevProps, prevState) {}
  // static getDerivedStateFromError(error) {}
  // componentDidCatch() {}
  render() {
    return (
      <div className={style.app}>
        <div className={style.chart_container}>
          <canvas id={style.chart} ref={this.chartRef}></canvas>
        </div>
      </div>
    );
  }
}
export default App;