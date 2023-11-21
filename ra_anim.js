
 var good = true;
 var ra = 'ACT_ra1';
 var geom ;
var linecol = "#013e75"

 const margin = {
    left: 150,
    top: 30,
    bottom: 0,
    right: 20
}
const width = 500 - margin.left - margin.right
const height = 300 - margin.top //- margin.bottom
const graph_pad = 0

const vispad = 0
var  ra_dat
var areay, yAxis, domain, areax, min_area, max_area
 var popup = new mapboxgl.Popup({ closeOnClick: false , anchor: 'left', offset: 20})
 const min_time = 0;
 const max_time = 96;
 var counter =  min_time;
const cols = ["blue", "orange"] //high then low

const stamps  = buff[0].stamps;

//console.log(buff[0])



  mapboxgl.accessToken = "pk.eyJ1IjoiZ2Vvd29uayIsImEiOiJjbGZzeDJyamMwYWR5M2ZtdXprbm4zOWY0In0.iR5aggRX52lZIf6sBKAY_g";   
  var map = new mapboxgl.Map({
      container: "slippymap",
      style: "mapbox://styles/geowonk/cklpsnqf95jw017olf76p1vbt",
      //style: 'mapbox://styles/mapbox/satellite-v9',
      pitch:45,
      center: [149.1904, -35.2109],
      zoom: 7,
      interactive: true
  });
var bounds = new mapboxgl.LngLatBounds({lng: 149.55930, lat: -32.65451}, {lng: 151.84277, lat: -35.38813})

var delay = 100;

function sleep(ms = 0) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


d3.select('#speed').on('change', function(){
  let n = d3.select(this).property('value')
  delay = 1000/(n*2);
  console.log(delay)
})


d3.select('#hour').append().text(stamps[0]).attr('class', 'hourtext').style('border-color', pall[0])
 



function prep_geom(){
  geom = stops
 for (const f of geom){
         // console.log(f)
            //f.type = 'LineString'
      
            f.properties = {
             'counts' : f.counts,
             'min': f.min_stops,
             'max': f.max_stops,
             'name': f.name,
             'id': f.id,
             'current_count' : f.counts[0]
            }
            f.geometry = {
              'type': "Point",
              'coordinates':[f.lon, f.lat]
            }
            f.type = 'Feature'
           
            delete f['counts']
            delete f['min_stops']
            delete f['max_stops']
            delete f['lon']
            delete f['lat']
            delete f['stamps']
            //delete f['id']
      
         }
          //counter = min_time;
}



function prep_buff(){
 
 for (const f of buff){
         // console.log(f)
            //f.type = 'LineString'
      
            f.properties = {
             'counts' : f.counts,
             'min': f.min_stops,
             'max': f.max_stops,
             'name': f.name,
             'id': f.id,
             'current_count' : f.counts[0]
            }
            
            f.type = 'Feature'
           
            delete f['counts']
            delete f['min_stops']
            delete f['max_stops']
            delete f['stamps']
            
      
         }
          //counter = min_time;
}
//prep_geom()
prep_buff()
//console.log(buff[0])

function toDateTime(secs){
  var t = new Date("2023-05-01T00:00:00.000+10:00");
  t.setSeconds(secs)
  return t;
}
 
function createScales() {

    min_area = 0
   
    //console.log(min_area)
    //console.log(max_counts)

    areax = d3.scaleLinear().domain([0, 95]).range([50, 1.7 * width]); // Removed graph_pad
    areay = d3.scaleLinear().domain([0, 1.1 * ra_dat.properties.max]).range([height, margin.top])
}

function grouper(dat){
  var groupedData = []
  for (let i =0; i< dat.properties.counts.length; i++){
    groupedData.push(
    {'count': dat.properties.counts[i], 'block': i}
    )
  }
  return groupedData
}


change_ra = function(new_ra) {
   ra = new_ra
   ra_dat = buff.filter(function(x) {
        return x.id == ra
    })[0]
    createScales()
    let svg = d3.select("#vis").select("svg");

    // Group data by contour
    var groupedData = grouper(ra_dat);

    // Define a line generator
    var lineGenerator = d3.line()
        .x(d => areax(d.block))
        .y(d => areay(d.count));

    
  
    yAxis = d3.axisRight(areay).ticks(6).tickFormat((d, i) => `${d}`)
    svg.selectAll('#yaxis')
        .transition().duration(400)
        .call(yAxis)
    // Update the existing paths with the new data
    svg.selectAll(".line")
        .datum(groupedData)
        .join("path")
        .attr("class", "line")
        .transition().duration(400)
        .attr("d", d => lineGenerator(d))
    

    let link = get_link()

    console.log(link.link)
    svg
        .selectAll('#name-watermark')
        .html(function(d) {
            return (ra_dat.properties.name + ' (' + ra+ ')')
        })

    var poly_ = buff.filter(function(x) {
        return x.properties.id == ra
    })[0]

    //console.log(poly_)
     map.getSource('selected_poly').setData(
       {
                  'type': 'FeatureCollection',
                  'features': [poly_],
               }
        )
     move_focus([link.lon, link.lat])


     gen_pop_up(link)

}


function gen_pop_up(link){

        popup
        .setLngLat([link.lon, link.lat])
        .setHTML(
            "<strong>Name:".padEnd(17, ' ') + "</strong>&nbsp&nbsp" + ra_dat.properties.name + "<br>" + 
            "<strong>Fuel:".padEnd(18, ' ') + "</strong>&nbsp&nbsp" + ra_dat.fuel + "<br>" + 
            "<strong>Shelter:".padEnd(19, ' ') + "</strong>&nbsp&nbsp" + ra_dat.shelter + "<br>" + 
            "<strong>Toilets:".padEnd(19, ' ') + "</strong>&nbsp&nbsp" + ra_dat.toilets + "<br>" + 
            "<strong>Water:".padEnd(17, ' ') + "</strong>&nbsp&nbsp" + ra_dat.water_supply + "<br>" + 
            "<strong>Tables:".padEnd(18, ' ') + "</strong>&nbsp&nbsp" + ra_dat.picnic_table + "<br>" +
            "<strong>Bins:".padEnd(18, ' ') + "</strong>&nbsp&nbsp" + ra_dat.litter_bins + "<br>" +
            "" + `<a href=${link.link}>View on StreetView</a>` + "<br>" 
            )
        .addTo(map);
          

}

function get_link(){
  let lon = ra_dat.geometry.coordinates[0].map(c => {return c[0]})

  lon = lon.reduceRight((acc, cur) => acc+cur, 0) / lon.length

  let lat = ra_dat.geometry.coordinates[0].map(c => {return c[1]})
  lat= lat.reduceRight((acc, cur) => acc+cur, 0) / lat.length
  let link = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lon}`
  // d3.select('#vis').select('svg')
  //   .selectAll('#link_text')
  //   .html(`<a href=${link}>View on StreetView</a>`)

  return  {
    'link':link,
    'lon': lon,
    'lat': lat,

    }
    
}
  

function move_line(i) {
  //console.log(i)
    let svg = d3.select("#vis").select('svg')
    //console.log(a_height)
    var y1 = height * 0.1;
    svg.selectAll(".hoverlinefixed").remove()
    
    svg.append("line")
        .attr('class', 'hoverlinefixed')
        .attr("x1", areax(i))
        .attr("x2", areax(i))
        .attr("y1", y1)
        .attr("y2", height)
        .style('stroke', pall[i])
       
}

function drawInitial() {
    //console.log(geoms)

   
    ra_dat = buff.filter(function(x) {
        return x.id == ra
    })[0]
    console.log(ra_dat)
    createScales()
    let svg = d3.select("#vis")
        .append('svg')
        .attr('width', width * 1.8)
        .attr('height', height * 1.2)
        .attr('opacity', 1)
        .style('background', "#FFFDF0")

    yAxis = d3.axisRight(areay).ticks(6).tickFormat((d, i) => `${d}`)

    svg.append('g').call(yAxis)
        .attr('id', 'yaxis')
        .style('font-size', '16px')
        .style('font-family', "Crimson Text")
        .attr("transform", "translate(10,0)")
        .select(".domain")
        .attr('opacity', 1)


    let xlabels = ['0:00', '4:00', '8:00', '12:00', '16:00', '20:00']
    svg.append('g')
        .call(d3.axisBottom(areax)
            .ticks(6)
            .tickValues([0, 16, 32, 48, 64, 80])
            .tickFormat((d, i) => xlabels[i])
        )
        .attr("transform", "translate(0," + height + ")")
        .style('font-size', '16px')
        .style('font-family', "Crimson Text")
        .select(".domain")
        .attr('opacity', 1)
        .attr('id', 'xaxis')

    var tooltip = d3.select("#tooltip");


    svg.append("circle")
        .attr('id', 'dot')
        .attr("r", 5)
        .attr("x", areax(48))
        .attr("y", areax(50))
        .attr('opacity', 1)



    
    var groupedData = grouper(ra_dat)
   //console.log(groupedData)
    //HERE
    // Define a line generator
    var lineGenerator = d3.line()
        .x(d => areax(d.block))
        .y(d => areay(d.count));

    

    // Create a path for each group in the data
    
        svg.append("path")
            .datum(groupedData)
            .attr("class", "line")
            .attr("d", lineGenerator)
            .attr("opacity", 1)
            .style("stroke", linecol)
            .style("stroke-width", 5)
            .style("fill", 'none')
            
    ;
   
    svg
        .append("text")
        .attr("x", areax(48))
        .attr("y", height * 0.15)
        .attr('id', 'name-watermark')
        .attr("text-anchor", "middle")
        .html(function(d) {
            return (ra_dat.properties.name + ' (' + ra+ ')')
        })

    svg
        .append("text")
        .attr("x", areax(48))
        .attr("y", height * 0.25)
        .attr('id', 'link_text')
        .attr("text-anchor", "middle")
        

     let link  = get_link();
    svg
    .attr('pointer-events', 'all')
            .on('mousemove', mouseOver)
            .on('mouseout', mouseOut);
        

    // d3.select("#hour").append().text('').attr('class', 'hourtext').style('opacity', 0)


   



}

function move_focus(coords) {
    map.flyTo({
        center: coords
    })
}

function mouseOver(event) {
        
        const mouseHour = Math.round(areax.invert(event.offsetX));
       


        

        const tooltip = d3.select('#tooltip');
        tooltip
            .html(
                "<strong>Time: </strong><span class=num> " + stamps[mouseHour].padStart(6, ' ') + "</span>" + "<br> <strong>Count: </strong><span class=num>" + ra_dat.properties.counts[mouseHour].toString().padStart(5, ' ')
                )
               
            
            .transition('mouseover').duration(100)
            .style("left", (event.pageX + 10) + "px") // Adjusted the position
            .style("top", (event.pageY - 80) + "px") // Adjusted the position
            .style('display', 'block')
            .style('opacity', 1);

             //console.log(areax(mouseHour))


        svg = d3.selectAll("#dot")
            .transition().duration(0)
            .attr('opacity', 1)
            .attr("cx", areax(mouseHour))
            .attr("cy", areay(ra_dat.properties.counts[mouseHour]))
    
}


function mouseOut(event, d) {
    //console.log('mouseout')
    d3.select('#tooltip')
        .style('display', 'none')
        .transition().duration(100);
    svg = d3.selectAll("#dot")
        .transition().duration(0)
        .attr('opacity', 0)
}

// function update_points(){
//   let time = stamps[counter]
//   //console.log(counter)
//   //console.log('datetime ', time.toTimeString())
//   d3.select('#hour').selectAll('.hourtext')
//   .html('<span class = num>&nbsp' + time + '&nbsp</span>')
//   .style('background-color', pall[counter])
  
//   let i = 0
//   for (f of geom){

//             f.properties.current_count = f.properties.counts[counter]
//         }
  
// }


function update_polygons(){
  let time = stamps[counter]
  
  
  //console.log('datetime ', time.toTimeString())
  d3.select('#hour').selectAll('.hourtext')
  .html('<span class = num>&nbsp' + time + '&nbsp</span>')
  .style('border-color', pall[counter])
  let i = 0

  for (f of buff){

            f.properties.current_count = f.properties.counts[counter]
            f.properties.c = pall[counter]
        }
  
}


 
    // var marker = createMarker(initLocation);
     map.on('load', function(){
      //fitBounds(geom[0]);

      
     

     

       map.addSource('polys', {
                'type': 'geojson',
                'data': {
                  'type': 'FeatureCollection',
                  'features': buff,
               }
            });


       var poly_ = buff.filter(function(x) {
        return x.properties.id == ra
    })[0]
       map.addSource('selected_poly', {
                'type': 'geojson',
                'data': {
                  'type': 'FeatureCollection',
                  'features': [poly_],
               }
            });
     
     var maxes = buff.map(f => {
      return f.properties.max
     }) 
     // const max = Math.max(...maxes)
     const max = 100;
     console.log(max)



      map.addLayer({
                'id': 'fill',
                'type': 'fill',
                'source': 'selected_poly',
                'paint': {
                  'fill-color' : 'red',
                 
                }
            });

      map.addLayer({
                'id': 'outline',
                'type': 'line',
                'source': 'selected_poly',
                'paint': {
                  'line-color' : 'black',
                  'line-width' : 5,
                 
                }
            });

       var c = pall[counter]
       map.addLayer({
                'id': 'poly',
                'type': 'fill-extrusion',
                'source': 'polys',
                
                'paint': {
                  
                  // 'fill-extrusion-color': [
                  //   'interpolate',
                  //   //['exponential', Math.E],
                  //   ['linear'],
                  //   ['to-number', ['get', 'current_count']],
                  //   0, cols[1],
                  //   max, cols[0],
                  // ],
                  'fill-extrusion-color':  ['get', 'c'],
                   'fill-extrusion-height': [
                    'interpolate',
                    ['linear'],
                     ['to-number', ['get', 'current_count']],
                    0, 7,
                    max, 50000,
                  ],
                   'fill-extrusion-base': 7,
                   'fill-extrusion-opacity': 0.6,
                  
                }
            });
     change_ra(ra)
       drawInitial()
      map.on('click', 'poly', (e) => {
        var new_ra = e.features[0].properties.id;
        console.log(new_ra)
        change_ra(new_ra)
      }
      )

     

     async function animate() {
         counter = counter + 1;
         // console.log(geom[0])
         await sleep(delay);
         if (counter>= max_time){
          console.log('finish')
          counter = 0;
         }
         // update_points();
         update_polygons();
        
         
         
          if(good){
          // map.getSource('points').setData({
          //         'type': 'FeatureCollection',
          //         'features': geom,
          //      });

          map.getSource('polys').setData({
                  'type': 'FeatureCollection',
                  'features': buff,
               });
           move_line(counter)
        }
        requestAnimationFrame(animate);
        
         
      }

      animate(counter);
      }
    )


