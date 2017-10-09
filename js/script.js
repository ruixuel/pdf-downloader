/* 
 * Open a new tab with the map image and call window.print to let user generate the pdf
 */

var newWindow;

function download() {
  var zoomLevel = prompt("Please input zoom level [16-20]:", "");
  var zoom = parseInt(zoomLevel);
  if (isNaN(zoom) || zoom > 20 || zoom < 16) {
    alert("Invalid input");
    return;
  }
  newWindow = window.open();
  var doc = new jsPDF('p', 'pt', 'a4');
  var width = doc.internal.pageSize.width;
  var height = doc.internal.pageSize.height;
  var map = "<div>";

  //Get tiles and combine them
  new DroneDeploy({
    version: 1
  }).then(function(dronedeploy) {
    dronedeploy.Plans.getCurrentlyViewed().then(function(plan) {
      dronedeploy.Tiles.get({
          planId: plan.id,
          layerName: 'ortho',
          zoom: zoom
        })
        .then(function(res) {
          const tiles = getTilesFromGeometry(plan.geometry, res.template, zoom);
          // Calculate maximum image height and width, 
          // which equals the min value between pdf height / image number in Y and pdf width / image number in X
          if (tiles.length > 0 && tiles[0].length > 0) {
            let imageSize = Math.min(height / tiles.length, width / tiles[0].length);
            let initialLeft = (width - imageSize * tiles[0].length) / 2;
            for (let i = 0; i < tiles.length; i++) {
              for (let j = 0; j < tiles[0].length; j++) {
                let tileUrl = tiles[i][j];
                let style = 'style="width:' + imageSize + 'px; height=' + imageSize + 'px;' +
                  'left:' + (initialLeft + j * imageSize) + 'px; top:' + (i * imageSize) + 'px; position:absolute"';
                map += '<img src="' + tileUrl + '" ' + style + '></img>';
              }
            }
          }

          map += "</div>";
          newWindow.document.write(map);
          newWindow.document.close();
          newWindow.onload = function(){
            newWindow.print();
          };
        });
    });
  }); 
}

function getTilesFromGeometry(geometry, template, zoom) {
  function long2tile(lon, zoom) {
    return (Math.floor((lon + 180) / 360 * Math.pow(2, zoom)));
  }

  function lat2tile(lat, zoom) {
    return (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)));
  }

  function replaceInTemplate(point) {
    return template.replace('{z}', point.z)
      .replace('{x}', point.x)
      .replace('{y}', point.y);
  }

  var allLat = geometry.map(function(point) {
    return point.lat;
  });
  var allLng = geometry.map(function(point) {
    return point.lng;
  });
  var minLat = Math.min.apply(null, allLat);
  var maxLat = Math.max.apply(null, allLat);
  var minLng = Math.min.apply(null, allLng);
  var maxLng = Math.max.apply(null, allLng);
  var top_tile = lat2tile(maxLat, zoom);
  var left_tile = long2tile(minLng, zoom);
  var bottom_tile = lat2tile(minLat, zoom);
  var right_tile = long2tile(maxLng, zoom);

  var tiles = [];
  for (var y = top_tile; y < bottom_tile + 1; y++) {
    var tilesX = [];
    for (var x = left_tile; x < right_tile + 1; x++) {
      tilesX.push(replaceInTemplate({
          x,
          y,
          z: zoom
        }))
        // tiles.push(replaceInTemplate({x, y, z: zoom}))
    }
    tiles.push(tilesX);
  }

  return tiles;
}