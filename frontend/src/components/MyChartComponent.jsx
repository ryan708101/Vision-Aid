import { Chart, CategoryScale, LinearScale, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

Chart.register(CategoryScale, LinearScale, LineElement, Title, Tooltip, Legend);

const MyChartComponent = ({ challengeLabels, challengeData }) => {
  // Function to convert decimal to percentage format
  const toPercentage = (value) => (value * 100).toFixed(2);

  const chartData = {
    labels: challengeLabels,
    datasets: [
      {
        label: 'Accuracy by Challenge',
        data: challengeData.map(toPercentage), // Convert to percentages
        fill: false,
        backgroundColor: 'rgba(75,192,192,1)',
        borderColor: 'rgba(75,192,192,1)',
      }
    ]
  };

  const options = {
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: true,
        text: 'Weekly Challenges Accuracy',
      },
    },
    scales: {
      x: {
        type: 'category',
      },
      y: {
        beginAtZero: true, // Ensure zero is the base of the scale
        ticks: {
          callback: (value) => `${value}%`, // Format ticks as percentages
        },
        suggestedMax: 100, // Set the maximum scale value to 100 to show the range from 0 to 100
      }
    },
  };

  return <Line data={chartData} options={options} />;
};

export default MyChartComponent;
