import { toHourFormat } from "./common/utils.js";

const colours = ["#0072BD", "#D95319", "#EDB120", "#7E2F8E", "#77AC30", "#4DBEEE", "#A2142F"];
const coloursLight = ["#80b9de", "#eca98c", "#f6d890", "#bf97c7", "#bbd698", "#a6dff7", "#d18a97"];

const dataDir = "./data/24h";
const data = ["London Prayer Times - 24h.json", "Cairo Prayer Times - 24h.json"].map((filename) =>
  fetch(`${dataDir}/${filename}`).then((res) => res.json())
);

Promise.all(data).then((datas) => {
  const ctx = document.getElementById(`myChart`).getContext("2d");
  const chart = new Chart(ctx, {
    type: "line",

    data: {
      labels: datas[0].Date.map((value) => new Date(value)),
      datasets: [].concat(
        ...datas.map((data, dataIndex) =>
          Object.keys(data)
            .filter((value) => value !== "Date")
            .map((label, index) => ({
              label: `${label} - ${["London", "Cairo"][dataIndex]}`,
              data: data[label].map((value) => {
                const time = value.split(":").map((value) => parseInt(value));
                return 60 * time[0] + time[1];
              }),
              borderColor: [colours, coloursLight][dataIndex][index],
              fill: false,
              radius: 0,
              pointHitRadius: 5,
            }))
        )
      ),
    },

    options: {
      tooltips: {
        callbacks: {
          label: function (tooltipItem, data) {
            let label = data.datasets[tooltipItem.datasetIndex].label || "";
            if (label) label = `${label}:`;

            label = `${label} ${toHourFormat(tooltipItem.value)}`;
            return label;
          },
        },
      },
      scales: {
        xAxes: [
          {
            /*ticks: {
                  stepSize: 31,
                  callback: (value, index, values) => {
                    return value.toLocaleString("default", { month: "long" });
                  },
                },*/
            type: "time",
            time: {
              unit: "month",
            },
            offset: false,
          },
        ],
        yAxes: [
          {
            ticks: {
              reverse: true,
              min: 0,
              max: 60 * 24,
              stepSize: 60,
              callback: (value, index, values) => {
                return toHourFormat(value);
              },
            },
          },
        ],
      },
    },
  });
});
