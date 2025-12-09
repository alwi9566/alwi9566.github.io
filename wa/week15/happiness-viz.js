// Initialize ECharts instances
var chart1 = echarts.init(document.getElementById('happiness-chart1'));
var chart2 = echarts.init(document.getElementById('happiness-chart2'));

var happinessData = [];

// Load and parse the CSV data
Papa.parse('WHR_2016(1).csv', {
    download: true,
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    complete: function(results) {
        happinessData = results.data;
        
        // Update loading status
        var statusEl = document.getElementById('loading-status');
        statusEl.innerHTML = '✓ Data loaded: ' + happinessData.length + ' countries analyzed';
        statusEl.style.background = 'rgba(125, 211, 252, 0.2)';
        statusEl.style.borderColor = 'rgba(125, 211, 252, 0.4)';
        
        // ===== CHART 1: Scatter Plot - GDP vs Happiness =====
        var scatterData = happinessData.map(function(row) {
            return {
                value: [
                    row['Economy (GDP per Capita)'],
                    row['Happiness Score']
                ],
                name: row.Country
            };
        });
        
        var option1 = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                borderColor: 'rgba(125, 211, 252, 0.5)',
                borderWidth: 1,
                textStyle: { color: '#e2e8f0' },
                formatter: function(params) {
                    return '<strong>' + params.data.name + '</strong><br/>' +
                           'GDP per Capita: ' + params.data.value[0].toFixed(3) + '<br/>' +
                           'Happiness Score: ' + params.data.value[1].toFixed(2);
                }
            },
            grid: {
                left: '10%',
                right: '5%',
                bottom: '15%',
                top: '5%'
            },
            xAxis: {
                name: 'Economy (GDP per Capita)',
                nameLocation: 'middle',
                nameGap: 35,
                nameTextStyle: { 
                    color: '#cbd5e1', 
                    fontSize: 13,
                    fontFamily: 'Merriweather'
                },
                type: 'value',
                axisLine: { lineStyle: { color: '#475569' }},
                axisLabel: { 
                    color: '#94a3b8',
                    fontSize: 11
                },
                splitLine: {
                    lineStyle: {
                        type: 'dashed',
                        color: 'rgba(71, 85, 105, 0.3)'
                    }
                }
            },
            yAxis: {
                name: 'Happiness Score',
                nameLocation: 'middle',
                nameGap: 45,
                nameTextStyle: { 
                    color: '#cbd5e1', 
                    fontSize: 13,
                    fontFamily: 'Merriweather'
                },
                type: 'value',
                axisLine: { lineStyle: { color: '#475569' }},
                axisLabel: { 
                    color: '#94a3b8',
                    fontSize: 11
                },
                splitLine: {
                    lineStyle: {
                        type: 'dashed',
                        color: 'rgba(71, 85, 105, 0.3)'
                    }
                }
            },
            series: [{
                name: 'Countries',
                type: 'scatter',
                symbolSize: 8,
                data: scatterData,
                itemStyle: {
                    color: '#7dd3fc',
                    opacity: 0.7
                },
                emphasis: {
                    itemStyle: {
                        color: '#38bdf8',
                        opacity: 1,
                        borderColor: '#7dd3fc',
                        borderWidth: 2,
                        shadowBlur: 10,
                        shadowColor: 'rgba(125, 211, 252, 0.5)'
                    }
                }
            }]
        };
        
        chart1.setOption(option1);
        
        // ===== CHART 2: Radar Chart - Top vs Bottom Countries =====
        var topCountry = happinessData[0];
        var bottomCountry = happinessData[happinessData.length - 1];
        var usCountry = happinessData.find(row => row.Country === 'United States');
        
        var option2 = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                borderColor: 'rgba(125, 211, 252, 0.5)',
                borderWidth: 1,
                textStyle: { color: '#e2e8f0' }
            },
            legend: {
                data: [topCountry.Country, usCountry.Country, bottomCountry.Country],
                bottom: 5,
                textStyle: { 
                    color: '#e2e8f0',
                    fontFamily: 'Merriweather',
                    fontSize: 12
                },
                itemWidth: 15,
                itemHeight: 10
            },
            radar: {
                indicator: [
                    { 
                        name: 'GDP', 
                        max: Math.max(...happinessData.map(r => r['Economy (GDP per Capita)']))
                    },
                    { 
                        name: 'Family', 
                        max: Math.max(...happinessData.map(r => r['Family']))
                    },
                    { 
                        name: 'Health', 
                        max: Math.max(...happinessData.map(r => r['Health (Life Expectancy)']))
                    },
                    { 
                        name: 'Freedom', 
                        max: Math.max(...happinessData.map(r => r['Freedom']))
                    },
                    { 
                        name: 'Trust', 
                        max: Math.max(...happinessData.map(r => r['Trust (Government Corruption)']))
                    },
                    { 
                        name: 'Generosity', 
                        max: Math.max(...happinessData.map(r => r['Generosity']))
                    }
                ],
                axisName: { 
                    color: '#cbd5e1',
                    fontFamily: 'Merriweather',
                    fontSize: 12
                },
                splitArea: {
                    areaStyle: {
                        color: ['rgba(125, 211, 252, 0.05)', 'rgba(125, 211, 252, 0.1)']
                    }
                },
                splitLine: { 
                    lineStyle: { color: 'rgba(125, 211, 252, 0.2)' }
                },
                axisLine: {
                    lineStyle: { color: 'rgba(125, 211, 252, 0.3)' }
                }
            },
            series: [{
                type: 'radar',
                data: [
                    {
                        value: [
                            topCountry['Economy (GDP per Capita)'],
                            topCountry['Family'],
                            topCountry['Health (Life Expectancy)'],
                            topCountry['Freedom'],
                            topCountry['Trust (Government Corruption)'],
                            topCountry['Generosity']
                        ],
                        name: topCountry.Country,
                        itemStyle: { color: '#7dd3fc' },
                        areaStyle: { opacity: 0.3 },
                        lineStyle: { width: 2 }
                    },
                    {
                        value: [
                            bottomCountry['Economy (GDP per Capita)'],
                            bottomCountry['Family'],
                            bottomCountry['Health (Life Expectancy)'],
                            bottomCountry['Freedom'],
                            bottomCountry['Trust (Government Corruption)'],
                            bottomCountry['Generosity']
                        ],
                        name: bottomCountry.Country,
                        itemStyle: { color: '#ef4444' },
                        areaStyle: { opacity: 0.3 },
                        lineStyle: { width: 2 }
                    },
                    {
                        value: [
                            usCountry['Economy (GDP per Capita)'],
                            usCountry['Family'],
                            usCountry['Health (Life Expectancy)'],
                            usCountry['Freedom'],
                            usCountry['Trust (Government Corruption)'],
                            usCountry['Generosity']
                        ],
                        name: usCountry.Country,
                        itemStyle: { color: '#22c55e' },
                        areaStyle: { opacity: 0.3 },
                        lineStyle: { width: 2 }
                    }
                ]
            }]
        };
        
        chart2.setOption(option2);
    },
    error: function(error) {
        console.error('Error loading CSV:', error);
        var statusEl = document.getElementById('loading-status');
        statusEl.innerHTML = '✗ Error loading data. Please ensure WHR_2016(1).csv is available.';
        statusEl.style.background = 'rgba(239, 68, 68, 0.2)';
        statusEl.style.borderColor = 'rgba(239, 68, 68, 0.4)';
        statusEl.style.color = '#f87171';
    }
});

// Make charts responsive
window.addEventListener('resize', function() {
    chart1.resize();
    chart2.resize();
});