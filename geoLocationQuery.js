db.places.find({
     location:{
          $near:{
               $geometry: {type:"Point", coordinates:[76.3073, 28.0506]},
               $minDistance:10000,
               $maxDistance:100000
          }
     }
}).pretty();

// Get the location within a polygon by polygon coordinates
db.places.find({
     location:{
          $geoWithin:{
               $geometry:{
                    type:"Polygon",
                    coordinates:[[ p1, p2, p3, p4, p1 ]]
               }
          }
     }
}).pretty();

// Get location by radius
db.places.find({
     location:{
          $geoWithin:{
               $centerSphere:[
                    [76.3073, 28.0506],
                    20/6378.1 // 20 kilometters
               ]
          }
     }
}).pretty();

// get location by within a polygon with by lat long
db.places.find({
     location:{
          $geoIntersects:{
               $geometry:{
                    type:"Point",
                    coordinates:[77.33618, 26.88364]
               }
          }
     }
});