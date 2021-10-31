db.contacts.aggregate([
   {$match: {gender: "female"}},
   {$group: {_id: { state: "$location.state"}, totalPersons: { $sum: 1} } },
   {$sort: {totalPersons: -1}}
]).pretty();

db.contacts.aggregate([
   {$project: {_id:1, name:1, gender: 1, email: 1, location:{
      type:"Point",
      coordinates: [
         {$convert: {input:'$location.coordinates.longitude', to: 'double', onError: 0.00, onNull: 0.00}},
         {$convert: {input:'$location.coordinates.latitude', to: 'double', onError: 0.00, onNull: 0.00}},
      ]
   }}},
   {$project: {_id:1, gender: 1, email: 1, location:1,  name: {
      $concat: [
         {$toUpper:{
            $substrCP: ['$name.title', 0, 1]
         }},
         {$toLower: {
            $substrCP: ['$name.title', 1, {$subtract:[{$strLenCP:'$name.title'}, 1]}]
         }},
         ' ',
         {$toUpper:{
            $substrCP: ['$name.first', 0, 1]
         }},
         {$toLower: {
            $substrCP: ['$name.first', 1, {$subtract:[{$strLenCP:'$name.first'}, 1]}]
         }},
         ' ',
         {$toUpper: {
            $substrCP: ['$name.last', 0, 1]
         }},
         {$toLower: {
            $substrCP:['$name.last', 1, {
               $subtract: [{$strLenCP:'$name.last'}, 1]
            }]
         }}
      ]
   }}},
]).pretty();


db.ngos.aggregate([
   {$match:{}},
   {$lookup:{from:"events", localField:"_id", foreignField:"ngoID", as:"event"}},
   {$lookup:{from:"stories", localField:"_id", foreignField:"ngoID", as:"story"}},
   {$project:{
      _id:"$_id",
      name:"$name",
      contactPerson:"$contactPerson",
      mobile:"$mobile",
      category:"$category.name",
      subCategory: "$category.subCategories",
      state:"$address.state",
      website:{$concat:["https://qause.com/ngo/", "$website"]},
      // gallery:"$images.secondary",
      numberOfStory:{$size:"$story"},
      numberOfEvent:{$size:"$event"},
      numberOfGallery:{$size:"$images.secondary"}
   }},
   {$sort:{numberOfGallery:-1, numberOfStory:-1, numberOfEvent:-1}},
   {$out:{db:"Qause", coll:"ngoForSeo"}}
]).pretty();