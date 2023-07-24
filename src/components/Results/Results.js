import React, { useRef, useEffect, useState } from 'react';
import { XYPlot, VerticalBarSeries, XAxis, YAxis } from 'react-vis';
import './Results.css';

const expressionsCount = {}; // Use an object to store the count of each expression

const Results = ({ results, processing }) => {
  // State to keep track of warning times
  const [warningTimes, setWarningTimes] = useState([]);

  results.forEach((result) => {
    const expression = result.expressions.asSortedArray()[0].expression;
    expressionsCount[expression] = (expressionsCount[expression] || 0) + 1; // Increment the count for each expression
  });

  const totalExpressions = Object.values(expressionsCount).reduce(
    (total, count) => total + count,
    0
  );
  const averageExpressions = totalExpressions / Object.keys(expressionsCount).length;

  const data = Object.keys(expressionsCount).map((expression) => ({
    x: expression,
    y: (expressionsCount[expression] / totalExpressions) * 100, // Calculate the percentage
  }));

  // Define the color for the bars (in this example, a blue color)
  const barColor = '#007c6b';

  // Define the style for the chart container (adding a frame)
  const chartStyle = {
    border: '1px solid #000',
    borderRadius: '5px',
    padding: '10px',
  };

  // Custom tick format function to make X-axis labels uppercase
  const formatXAxisTick = (v) => v.toUpperCase();

  // Define the threshold for the warning (you can adjust this value based on your needs)
  const warningThreshold = 50; // 30% threshold for individual emotions

  // Check if the percentage of any specific emotion is higher than the warning threshold
  const isWarningNeeded = data.some(
    (emotion) =>
      ['angry', 'sad'].includes(emotion.x) && emotion.y > warningThreshold
  );

  // Ref to the audio element
  const audioRef = useRef(null);

  // Play the warning sound and update warningTimes when the component mounts and the warning is displayed
  useEffect(() => {
    audioRef.current = new Audio('public/warningSound.mp3');
    if (isWarningNeeded) {
      audioRef.current.play();
      // Save the warning time in the state
      const currentTime = new Date().toLocaleTimeString();
      setWarningTimes((prevWarningTimes) => [...prevWarningTimes, currentTime]);
    }
  }, [isWarningNeeded]);

  return (
    <div className="results">
      {isWarningNeeded && <p style={{ color: 'red' }}>Warning: High levels of negative emotions detected!</p>}
      <p>Emotion's Statistic</p>
      <div className="chart" style={chartStyle}>
        <XYPlot xType="ordinal" width={600} height={300} margin={{ left: 100 }}>
          {/* Set the color prop to change the bar color */}
          <VerticalBarSeries data={data} color={barColor} />
          {/* Updated styles for the X and Y axes */}
          <XAxis tickFormat={formatXAxisTick} style={{ text: { fill: 'white' } }} />
          <YAxis tickFormat={(v) => `${v.toFixed(0)}%`} tickTotal={5} style={{ text: { fill: 'white' } }} />
        </XYPlot>
      </div>
      {warningTimes.length > 0 && (
        <div className="warning-box">
          <b>Warnings prompted at:</b>
          <ul>
            {warningTimes.map((time) => (
              <li key={time}>{time}</li>
            ))}
          </ul>
        </div>
      )}
      {/* Audio element to play the warning sound */}
      <audio ref={audioRef} />
    </div>
  );
};

export default Results;
