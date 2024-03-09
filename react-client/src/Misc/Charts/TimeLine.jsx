export default function TimeLine({title}) {
  return (
    <div className="dashboard-container analytics">
      <div className="analytics-container">
        <div className="analytics-stats">
          <h2 className="analytics-title">{title}</h2>
          {/* <p className="analytics-main-value">{totalValue}</p> */}
        </div>
        {/* <TimeSettings transparent timespan={timespan} setTimespan={setTimespan} /> */}
      </div>

      <div className="chart-container">
        {/* <Chart options={options} series={data} type="bar" width={"100%"} height={"100%"} /> */}
      </div>
    </div>
  );
}
