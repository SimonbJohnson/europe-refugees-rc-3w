function generateDash(data,geom){    
    
    var pietip = d3.tip().attr('class', 'd3-tip').html(function(d) { return d.data.key+': '+d3.format('0,000')(d.data.value); });
    var rowtip = d3.tip().attr('class', 'd3-tip').html(function(d) { return d.key+': '+d3.format('0,000')(d.value); });

 
    var cf = crossfilter(data);
    var societyChart = dc.rowChart('#society');
    var sectorChart = dc.rowChart('#sector');
    var resourceChart = dc.rowChart('#resource');
    var modalityChart = dc.rowChart('#modality');
    var statusChart = dc.rowChart('#status');
    var mapChart = dc.leafletChoroplethChart('#map');

    var societyDimension = cf.dimension(function(d){return d['#org']});
    var societyGroup = societyDimension.group();

    var sectorDimension = cf.dimension(function(d){return d['#sector']});
    var sectorGroup = sectorDimension.group();

    var resourceDimension = cf.dimension(function(d){return d['#operations+resources']});
    var resourceGroup = resourceDimension.group();         

    var modalityDimension = cf.dimension(function(d){return d['#operations+modality']});
    var modalityGroup = modalityDimension.group(); 

    var statusDimension = cf.dimension(function(d){return d['#status']});
    var statusGroup = statusDimension.group();

    var mapDimension = cf.dimension(function(d){return d['#country+code']});
    var mapGroup = mapDimension.group();          

    var all = cf.groupAll();

    societyChart.width($('#what').width()).height(550)
            .dimension(societyDimension)
            .group(societyGroup)
            .elasticX(true)
            .colors(['#CCCCCC', '#03a9f4'])
            .colorDomain([0,1])
            .colorAccessor(function(d, i){return 1;})
            .ordering(function(d){ return -d.value })
            .xAxis().ticks(5);

    sectorChart.width($('#what').width()).height(550)
            .dimension(sectorDimension)
            .group(sectorGroup)
            .elasticX(true)
            .colors(['#CCCCCC', '#03a9f4'])
            .colorDomain([0,1])
            .colorAccessor(function(d, i){return 1;})
            .ordering(function(d){ return -d.value })
            .xAxis().ticks(5);

    resourceChart.width($('#what').width()).height(200)
            .dimension(resourceDimension)
            .group(resourceGroup)
            .elasticX(true)
            .colors(['#CCCCCC', '#03a9f4'])
            .colorDomain([0,1])
            .colorAccessor(function(d, i){return 1;})
            .ordering(function(d){ return -d.value })
            .xAxis().ticks(5);

    modalityChart.width($('#what').width()).height(200)
            .dimension(modalityDimension)
            .group(modalityGroup)
            .elasticX(true)
            .colors(['#CCCCCC', '#03a9f4'])
            .colorDomain([0,1])
            .colorAccessor(function(d, i){return 1;})
            .ordering(function(d){ return -d.value })
            .xAxis().ticks(5);

    statusChart.width($('#what').width()).height(200)
            .dimension(statusDimension)
            .group(statusGroup)
            .elasticX(true)
            .colors(['#CCCCCC', '#03a9f4'])
            .colorDomain([0,1])
            .colorAccessor(function(d, i){return 1;})
            .ordering(function(d){ return -d.value })
            .xAxis().ticks(5);                                                  

    dc.dataCount('#count-info')
            .dimension(cf)
            .group(all);

    mapChart.width($('#map').width()).height(300)
            .dimension(mapDimension)
            .group(mapGroup)
            .center([50,15])
            .zoom(3)    
            .geojson(geom)
            .colors(['#CCCCCC', '#03a9f4'])
            .colorDomain([0, 1])
            .colorAccessor(function (d) {
                if(d>0){
                    return 1;
                } else {
                    return 0;
                }
            })           
            .featureKeyAccessor(function(feature){
                return feature.properties['Iso_Code'];
            })
            .popup(function(feature){
                return feature.properties['CNTRY_NAME'];
            })
            .renderPopup(true)
            .featureOptions({
                'fillColor': 'gray',
                'color': 'gray',
                'opacity':0,
                'fillOpacity': 0,
                'weight': 1
            })   
            
        dc.dataTable("#data-table")
                .dimension(societyDimension)                
                .group(function (d) {
                    return '0';
                })
                .size(650)
                .columns([
                    function(d){
                       return d['#org']; 
                    },
                    function(d){
                       return d['#country']; 
                    },
                    function(d){
                       return d['#operations+modality']; 
                    },
                    function(d){
                       return d['#operations+resources']; 
                    },
                    function(d){
                       return d['#sector']; 
                    },
                    function(d){
                       return d['#activity']; 
                    },
                    function(d){
                       return d['#status'];
                    },
                    function(d){
                       return d['#comment']; 
                    }
                ]); 
                               
    dc.renderAll();

    d3.selectAll('g.row').call(rowtip);
    d3.selectAll('g.row').on('mouseover', rowtip.show).on('mouseout', rowtip.hide);

    d3.selectAll('.pie-slice').call(pietip);
    d3.selectAll('.pie-slice').on('mouseover', pietip.show).on('mouseout', pietip.hide);

    map = mapChart.map();
    map.scrollWheelZoom.disable();          

}

function hxlProxyToJSON(input){
    var output = [];
    var keys=[]
    input.forEach(function(e,i){
        if(i==1){
            keys = e;
        } else if(i>1){
            var row = {};
            e.forEach(function(e2,i2){
                row[keys[i2]] = e2;
            });
            output.push(row);
        }
    });
    return output;
}

$('#intro').click(function(){
    var intro = introJs();
        intro.setOptions({
            steps: [
              {
                element: '#society',
                intro: "Charts can be clicked and interacted with.  When you click an item on a chart if filters the data so the other charts only show data for this item.",
                position: 'right'
              },
              {
                element: '#tabletip',
                intro: "This table lists the data that matches the filters selected on the charts above.",
              },
              {
                element: '#count-info',
                intro: "This number shows the current number of records selected.",
              },
              {
                element: '#reset',
                intro: "Click this button to reset the dashboard.",
              }                            
            ]
        });  
    intro.start();
});

//load 3W data
console.log('check');
var dataCall = $.ajax({ 
    type: 'GET', 
    url: 'http://beta.proxy.hxlstandard.org/data.json?filter_count=7&url=https://docs.google.com/spreadsheets/d/1QkumetuGLeX5JU4XSdTNp72A-zxQ1PE2-x099Sod69w/pub?gid=625699687&single=true&output=csv&format=html&filter01=append&append-dataset01-01=https://docs.google.com/spreadsheets/d/1QkumetuGLeX5JU4XSdTNp72A-zxQ1PE2-x099Sod69w/pub?gid=1345516995&single=true&output=csv&append-dataset01-02=https://docs.google.com/spreadsheets/d/1QkumetuGLeX5JU4XSdTNp72A-zxQ1PE2-x099Sod69w/pub?gid=1855157001&single=true&output=csv&append-dataset01-2=https://docs.google.com/spreadsheets/d/1QkumetuGLeX5JU4XSdTNp72A-zxQ1PE2-x099Sod69w/pub?gid=1855157001&single=true&output=csv&append-dataset01-03=https://docs.google.com/spreadsheets/d/1QkumetuGLeX5JU4XSdTNp72A-zxQ1PE2-x099Sod69w/pub?gid=996048654&single=true&output=csv&append-dataset01-3=https://docs.google.com/spreadsheets/d/1QkumetuGLeX5JU4XSdTNp72A-zxQ1PE2-x099Sod69w/pub?gid=996048654&single=true&output=csv&append-dataset01-04=https://docs.google.com/spreadsheets/d/1QkumetuGLeX5JU4XSdTNp72A-zxQ1PE2-x099Sod69w/pub?gid=1296329730&single=true&output=csv&append-dataset01-4=https://docs.google.com/spreadsheets/d/1QkumetuGLeX5JU4XSdTNp72A-zxQ1PE2-x099Sod69w/pub?gid=1296329730&single=true&output=csv&append-dataset01-05=https://docs.google.com/spreadsheets/d/1QkumetuGLeX5JU4XSdTNp72A-zxQ1PE2-x099Sod69w/pub?gid=2108479698&single=true&output=csv&append-dataset01-5=https://docs.google.com/spreadsheets/d/1QkumetuGLeX5JU4XSdTNp72A-zxQ1PE2-x099Sod69w/pub?gid=2108479698&single=true&output=csv&append-dataset01-06=https://docs.google.com/spreadsheets/d/1QkumetuGLeX5JU4XSdTNp72A-zxQ1PE2-x099Sod69w/pub?gid=458207630&single=true&output=csv&append-dataset01-6=https://docs.google.com/spreadsheets/d/1QkumetuGLeX5JU4XSdTNp72A-zxQ1PE2-x099Sod69w/pub?gid=458207630&single=true&output=csv&append-dataset01-07=https://docs.google.com/spreadsheets/d/1QkumetuGLeX5JU4XSdTNp72A-zxQ1PE2-x099Sod69w/pub?gid=635078679&single=true&output=csv&append-dataset01-7=https://docs.google.com/spreadsheets/d/1QkumetuGLeX5JU4XSdTNp72A-zxQ1PE2-x099Sod69w/pub?gid=635078679&single=true&output=csv&append-dataset01-08=https://docs.google.com/spreadsheets/d/1QkumetuGLeX5JU4XSdTNp72A-zxQ1PE2-x099Sod69w/pub?gid=317571858&single=true&output=csv&append-dataset01-8=https://docs.google.com/spreadsheets/d/1QkumetuGLeX5JU4XSdTNp72A-zxQ1PE2-x099Sod69w/pub?gid=317571858&single=true&output=csv&append-dataset01-09=https://docs.google.com/spreadsheets/d/1QkumetuGLeX5JU4XSdTNp72A-zxQ1PE2-x099Sod69w/pub?gid=1876233354&single=true&output=csv&append-dataset01-9=https://docs.google.com/spreadsheets/d/1QkumetuGLeX5JU4XSdTNp72A-zxQ1PE2-x099Sod69w/pub?gid=1876233354&single=true&output=csv&append-dataset01-010=https://docs.google.com/spreadsheets/d/1QkumetuGLeX5JU4XSdTNp72A-zxQ1PE2-x099Sod69w/pub?gid=399749668&single=true&output=csv&append-dataset01-10=https://docs.google.com/spreadsheets/d/1QkumetuGLeX5JU4XSdTNp72A-zxQ1PE2-x099Sod69w/pub?gid=399749668&single=true&output=csv&append-dataset01-011=https://docs.google.com/spreadsheets/d/1QkumetuGLeX5JU4XSdTNp72A-zxQ1PE2-x099Sod69w/pub?gid=2015211458&single=true&output=csv&append-dataset01-11=https://docs.google.com/spreadsheets/d/1QkumetuGLeX5JU4XSdTNp72A-zxQ1PE2-x099Sod69w/pub?gid=2015211458&single=true&output=csv&append-dataset01-012=https://docs.google.com/spreadsheets/d/1QkumetuGLeX5JU4XSdTNp72A-zxQ1PE2-x099Sod69w/pub?gid=2145860751&single=true&output=csv&append-dataset01-12=https://docs.google.com/spreadsheets/d/1QkumetuGLeX5JU4XSdTNp72A-zxQ1PE2-x099Sod69w/pub?gid=2145860751&single=true&output=csv&append-dataset01-013=https://docs.google.com/spreadsheets/d/1QkumetuGLeX5JU4XSdTNp72A-zxQ1PE2-x099Sod69w/pub?gid=694164121&single=true&output=csv&append-dataset01-13=https://docs.google.com/spreadsheets/d/1QkumetuGLeX5JU4XSdTNp72A-zxQ1PE2-x099Sod69w/pub?gid=694164121&single=true&output=csv&append-dataset01-014=https://docs.google.com/spreadsheets/d/1QkumetuGLeX5JU4XSdTNp72A-zxQ1PE2-x099Sod69w/pub?gid=1437841069&single=true&output=csv&append-dataset01-14=https://docs.google.com/spreadsheets/d/1QkumetuGLeX5JU4XSdTNp72A-zxQ1PE2-x099Sod69w/pub?gid=1437841069&single=true&output=csv&append-dataset01-015=https://docs.google.com/spreadsheets/d/1QkumetuGLeX5JU4XSdTNp72A-zxQ1PE2-x099Sod69w/pub?gid=2016209846&single=true&output=csv&append-dataset01-15=https://docs.google.com/spreadsheets/d/1QkumetuGLeX5JU4XSdTNp72A-zxQ1PE2-x099Sod69w/pub?gid=2016209846&single=true&output=csv&append-dataset01-016=https://docs.google.com/spreadsheets/d/1QkumetuGLeX5JU4XSdTNp72A-zxQ1PE2-x099Sod69w/pub?gid=295498123&single=true&output=csv&append-dataset01-16=https://docs.google.com/spreadsheets/d/1QkumetuGLeX5JU4XSdTNp72A-zxQ1PE2-x099Sod69w/pub?gid=295498123&single=true&output=csv&append-dataset01-017=https://docs.google.com/spreadsheets/d/1QkumetuGLeX5JU4XSdTNp72A-zxQ1PE2-x099Sod69w/pub?gid=700878944&single=true&output=csv&append-dataset01-17=https://docs.google.com/spreadsheets/d/1QkumetuGLeX5JU4XSdTNp72A-zxQ1PE2-x099Sod69w/pub?gid=700878944&single=true&output=csv&append-dataset01-018=https://docs.google.com/spreadsheets/d/1QkumetuGLeX5JU4XSdTNp72A-zxQ1PE2-x099Sod69w/pub?gid=818927214&single=true&output=csv&append-dataset01-18=https://docs.google.com/spreadsheets/d/1QkumetuGLeX5JU4XSdTNp72A-zxQ1PE2-x099Sod69w/pub?gid=818927214&single=true&output=csv&append-dataset01-019=https://docs.google.com/spreadsheets/d/1QkumetuGLeX5JU4XSdTNp72A-zxQ1PE2-x099Sod69w/pub?gid=1695896919&single=true&output=csv&append-dataset01-19=https://docs.google.com/spreadsheets/d/1QkumetuGLeX5JU4XSdTNp72A-zxQ1PE2-x099Sod69w/pub?gid=1695896919&single=true&output=csv&filter02=replace-map&replace-map-url02=https://docs.google.com/spreadsheets/d/12TdWAO9BmavBkGEM-7hPV7IMjN_EOJY_2iGnW_ezjuk/pub?gid=493036357&single=true&output=csv7&filter03=merge&merge-url03=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F12TdWAO9BmavBkGEM-7hPV7IMjN_EOJY_2iGnW_ezjuk%2Fpub%3Foutput%3Dcsv&merge-tags03=country%2Bcode&merge-keys03=country-code',
    dataType: 'json',
});

//load geometry

var geomCall = $.ajax({ 
    type: 'GET', 
    url: 'data/geom.json', 
    dataType: 'json'
});

//when both ready construct 3W

$.when(dataCall, geomCall).then(function(dataArgs, geomArgs){
    
    console.log('load');
    var geom = topojson.feature(geomArgs[0],geomArgs[0].objects.geom);
    var data = hxlProxyToJSON(dataArgs[0]);
    generateDash(data,geom);
});

