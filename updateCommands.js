// You can use two operators in update togther but field must not be same
db.users.updateOne(
     { _id: ObjectId('617e29001adb8b91ea46738f') },
     {
          $min: { age: 26 },
          $set: { isSpotty: true }
     }
);

// Will not work because it has two operator with same field
db.users.updateOne(
     { _id: ObjectId('617e29001adb8b91ea46738f') },
     {
          $max: { age: 26 },
          $set: { age: 33 }
     }
);

// Will update only if the value of age max 26
db.users.updateOne({ _id: ObjectId('617e29001adb8b91ea46738f') }, { $max: { age: 26 } });

// Will update only if the value of age min 26
db.users.updateOne({ _id: ObjectId('617e29001adb8b91ea46738f') }, { $min: { age: 26 } });

// Will multiply the age by 26
db.users.updateOne({ _id: ObjectId('617e29001adb8b91ea46738f') }, { $mul: { age: 26 } });

// To getting rid of field
db.users.updateMany({ isSpotty: true }, { $unset: { phone: "" } });

// To rename the field
db.users.updateMany({ isSpotty: true }, { $rename: { age: "totalAge" } });

// To update and insert if not exist
db.users.updateOne({ name: "Kya" }, {
     $set: {
          name: "Librel Girl",
          age: 27,
          hobbies: [
               { title: "Gyming", frequency: 1 },
               { title: "Dancing", frequency: 2 },
               { title: "Yoga", frequency: 1 }
          ],
          isSpotty: true
     }
}, { upsert: true });

// Will not check both condition inside same document
db.users.updateMany({ $and: [{ "hobbies.title": "Sports" }, { "hobbies.frequency": 3 }] }, { $set: {/* Fields */ } }).pretty();

// Will check both condition inside same document and update only matched($) element inside array
db.users.updateMany({
     hobbies: {
          $elemMatch: { title: "Sports", frequency: 3 }
     }
},
     { $set: { "hobbies.$.highlyFrequency": true } }
);

// Update multiple elements inside array of matched documents
db.users.updateMany({
     "hobbies.frequency": { $gte: 2 }
},
     { $inc: { "hobbies.$[].frequency": -1 } }
);

// update item inside array of objects(will update only those items who has match)
db.users.updateMany({
     "hobbies.frequency": { $gt: 2 }
},
     { $set: { "hobbies.$[el].goodFrequency": true } },
     { arrayFilters: [{ "el.frequency": { $gt: 2 } }] }
);

// Push item inside array of matched document
db.users.updateMany(
     { "hobbies.frequency": { $gt: 3 } },
     { $push: { "hobbies": { title: "Swimming", frequency: 5 } } }
);

// Push multiple item inside array of match document in sorted order of frequency
db.users.updateMany(
     { "hobbies.frequency": { $gt: 3 } },
     {
          $push: {
               hobbies:{
                    $each: [
                         { title: "Feeding the animals", frequency: 10 },
                         { title: "Resque the animals", frequency: 10 }
                    ],
                    $sort: { frequency: -1 },
                    // $slice:2
               }
          }
     }
);

// Push multiple item inside array of match document in sorted order of frequency with $addToSet,
// it does not push duplicate value
db.users.updateMany(
     { name:"Maya" },
     {
          $addToSet: {
               hobbies:{
                    $each:[
                         { title: "Resque the animals", frequency: 10 },
                         { title: "Resque the animals", frequency: 10 },
                    ]
               }
          }
     }
);

// Remove item from arry of object inside documents with $pull
db.users.updateMany({
     name:"Maya"
},
{$pull:{hobbies:{title:"Gyming"}}}
);

// Remove item from arry of object inside documents with $pop
db.users.updateMany({
     name:"Marya"
},
{$pop:{hobbies:1}} // 1 for remove last one item and -1 to remove first one item
);