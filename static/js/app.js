function buildMetadata(sample) {
  // Use `d3.json` to fetch the metadata for a sample
  url = `/metadata/${sample}`;
  console.log(url);

  d3.json(url).then(function (data) {
    console.log(data);

    // Use d3 to select the panel with id of `#sample-metadata`
    metadata = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    metadata.html("");
    table = metadata.append("table").classed("table-responsive, table-sm", true);
    tbody = metadata.append("tbody");

    // Use `Object.entries` to add each key and value pair to the panel
    Object.entries(data).forEach(([key, value]) => {
      row = tbody.append("tr")
      row.classed('d-flex', true)
      row.append("td").classed('col-4 small', true).text(`${key}: `)
      row.append("td").classed('col-8 small', true).text(value)
    })
     // Build the Gauge Chart
     buildGauge(data.WFREQ);
  })
}


function buildGauge(wfreq) {
  // Frequency between 0 and 9
  var level = wfreq;

  // Trig to calc meter point
  var degrees = 9 - level,
    radius = .5;
  var radians = degrees * Math.PI / 9;
  var x = radius * Math.cos(radians);
  var y = radius * Math.sin(radians);

  // Path: may have to change to create a better triangle
  var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
    pathX = String(x),
    space = ' ',
    pathY = String(y),
    pathEnd = ' Z';
  var path = mainPath.concat(pathX, space, pathY, pathEnd);

  var data = [{
    type: 'scatter',
    x: [0], y: [0],
    marker: { size: 28, color: '850000' },
    showlegend: false,
    name: 'frequency',
    text: level,
    hoverinfo: 'text+name'
  },
  {
    values: [50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50],
    rotation: 90,
    text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
    textinfo: 'text',
    textposition: 'inside',
    marker: {
      colors: ['rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)',
        'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
        'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)',
         'rgba(222, 215, 160, .5)', 'rgba(210, 206, 145, .5)', 
         'rgba(232, 226, 202, .5)', 'rgba(255, 255, 255, 0)']
    },
    labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
    hoverinfo: 'label',
    hole: .5,
    type: 'pie',
    showlegend: false
  }];

  var layout = {
    shapes: [{
      type: 'path',
      path: path,
      fillcolor: '850000',
      line: {
        color: '850000'
      }
    }],
    title: 'Belly Button Washing Frequency',
    height: 400,
    width: 450,
    xaxis: {
      zeroline: false, showticklabels: false,
      showgrid: false, range: [-1, 1]
    },
    yaxis: {
      zeroline: false, showticklabels: false,
      showgrid: false, range: [-1, 1]
    }
  };

  Plotly.newPlot('gauge', data, layout);
}

function buildCharts(sample) {

  // Use `d3.json` to fetch the sample data for the plots
  url = `/samples/${sample}`;
  console.log(url);

  d3.json(url).then(function (data) {
    console.log(data);

    // Build a Bubble Chart using the sample data
    var bubbledata = [{
      x: data.otu_ids,
      y: data.sample_values,
      mode: 'markers',
      text: data.otu_labels,
      marker: {
        color: data.otu_ids,
        size: data.sample_values
      }
    }];

    var bubblelayout = {
      title: 'Belly Button Biodiversity',
      showlegend: false,
      xaxis : {
        title: "OTU ID"
      }
    };

    Plotly.newPlot('bubble', bubbledata, bubblelayout);

    // Build a Pie Chart
    // Get Top 10  sample_values
    mapped_data = data.sample_values.map((value, index) => [value, data.otu_ids[index], data.otu_labels[index]]);

    console.log(mapped_data);
    top10 = mapped_data.sort(function compareFunction(first, second) {
      return second[0] - first[0];
    }).slice(0, 10);

    console.log(top10);

    var piedata = [{
      values: top10.map(elem => elem[0]),
      labels: top10.map(elem => elem[1]),
      text: top10.map(elem => elem[2]),
      textinfo: 'none',
      type: 'pie'
    }];

    var pielayout = {
      title: 'Top 10 Belly Button Bacteria',
      width: 400,
      height: 450 
    };

    Plotly.newPlot('pie', piedata, pielayout);
  })
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
