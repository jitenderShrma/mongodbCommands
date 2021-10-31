// ------------------------- $group -----------------------------------------//
db.contacts.aggregate([
    { $match: { gender: "female" } },
    {
        $group: {
            _id: {
                name: {
                    $concat: [
                        { $toUpper: { $substrCP: ['$name.title', 0, 1] } },
                        {
                            $toLower: { $substrCP: ['$name.title', 1, { $subtract: [{ $strLenCP: '$name.title' }, 1] }] }
                        },
                        ' ',
                        { $toUpper: { $substrCP: ['$name.first', 0, 1] } },
                        {
                            $toLower: { $substrCP: ['$name.first', 1, { $subtract: [{ $strLenCP: '$name.first' }, 1] }] }
                        },
                        ' ',
                        { $toUpper: { $substrCP: ['$name.last', 0, 1] } },
                        {
                            $toLower: { $substrCP: ['$name.last', 1, { $subtract: [{ $strLenCP: '$name.last' }, 1] }] }
                        },
                    ]
                },
                state: "$location.state",
                location: {
                    type: "Point",
                    coordinates: [
                        { $convert: { input: "$location.coordinates.longitude", to: "double", onError: 0, onNull: 0 } },
                        { $convert: { input: "$location.coordinates.latitude", to: "double", onError: 0, onNull: 0 } },
                    ]
                }
            }
        }
    }
]).pretty();


// ------------------------------ $project ---------------------------------------//
db.contacts.aggregate([
    { $match: { gender: "male" } },
    { $project: { _id: 1, name: 1, location: 1 } }
]);

// -------------------------- $isoWeekYear && $covert --------------------------//
db.contacts.aggregate([
    { $match: { gender: "female" } },
    {
        $group: {
            _id: {
                dateOfBirth: {
                    $isoWeekYear: {
                        $convert: { input: "$dob.date", to: "date", onError: 0, onNull: 0 }
                    }
                }
            }
        }
    },
]);

// -------------------- $group with array ----------------------------------// 
db.hobbies.aggregate([
    { $unwind: "$hobbies" },
    {
        $group: {
            _id: {
                age: "$age",
            },
            allHobbies: { $addToSet: "$hobbies" },
            totalCount: { $sum: 1 },
        }
    }
]).pretty();

// -------------------- $slice with $project array ----------------------------------// 
db.hobbies.aggregate([
    {
        $project: {
            _id: 1,
            examScore: {
                $slice: ["$examScores", 1, 1] // slice the array 
            }
        }
    }
]);

// -------------------- $size with $project array ----------------------------------// 
db.hobbies.aggregate([
    {
        $project: {
            _id: 1,
            numScores: {
                $size: "$examScores" // give the length of array
            }
        }
    }
]);

// -------------------- $filter, $gt && $project array ----------------------------------// 
db.hobbies.aggregate([
    {
        $project: {
            _id: 1,
            score: {
                $filter: {
                    input: "$examScores", // array 
                    as: "sc", // refer each item of array as local variable
                    cond: {               // condition of filter
                        $gt: ["$$sc.score", 60]
                    }
                }
            }
        }
    }
]).pretty();

db.friends.aggregate([
    { $unwind: "$examScores" },
    { $project: { _id: 1, name: 1, age: 1, examScores: 1 } },
    { $sort: { "examScores.score": -1 } },
    { $group: { _id: "$_id", name: { $first: "$name" }, maxScore: { $max: "$examScores.score" } } }
]).pretty();

// -------------------------------- $bucket ------------------------------------//
db.contacts.aggregate([
    {
        $bucket: {
            groupBy: "$dob.age",
            boundaries: [18, 30, 40, 50, 60, 120],
            output: {
                numPersons: { $sum: 1 },
                averageAge: { $avg: "$dob.age" }
            }
        }
    }
]).pretty();

db.contacts.aggregate([
    {
        $bucketAuto: {
            groupBy: "$dob.age",
            buckets: 5,
            output: {
                numPersons: { $sum: 1 },
                averageAge: { $avg: "$dob.age" }
            }
        }
    }
]).pretty();

// --------------------------- $out ----------------------------------------------------//
db.contacts.aggregate([
    {
        $project: {
            _id: 1,
            name: 1,
            email: 1,
            birthdate: { $toDate: "$dob.date" },
            age: '$dob.age',
            location: {
                type: "Point",
                coordinates: [
                    {
                        $convert: {
                            input: "$location.coordinates.longitude",
                            to: "double",
                            onError: 0,
                            onNull: 0
                        }
                    },
                    {
                        $convert: {
                            input: "$location.coordinates.latitude",
                            to: "double",
                            onError: 0,
                            onNull: 0
                        }
                    },
                ]
            }
        }
    },
    { $out: { db: "dummyData", coll: "persons" } }
]);


// ----------------------------- $geoNear ---------------------------------- //
db.persons.aggregate([
    {
        $geoNear: {
            near: {
                type: "Point",
                coordinates: [-18.4, -42.8]
            },
            maxDistance: 100000,
            query: {},
            distanceField: "distance"
        }
    }
]).pretty();


// ------------------------------ find in array with all match without order ------------------------------------- //
db.movies.find({ genres: ['Action', 'Drama', 'Thiller'] }).pretty();

// --------------------------- find in array with all match with order
db.movies.find({ genres: { $all: ['Action', 'Drama', 'Thiller'] } }).pretty();

// ---------------------- match more than one item in embeeded document
db.users.find({ $and: [{ "hobbies.title": "Gaming" }, { "hobbies.frequency": { $gte: 5 } }] }).pretty(); // don't match both condition in same item of object

// ---------------------- match more than one item in embeeded document using $elemMatch --------- //
db.users.find({
    hobbies: {
        $elemMatch: {
            title: "Gaming",
            frequency: { $gte: 2 }
        }
    }
}).pretty(); // will match both condition in same item of object

// -------------------------- projection in array ---------------------------------- //
db.movies.find({ "genres": "Drama" }, { id: 1, name: 1, ratting: 1, genres: { $elemMatch: { $eq: "Drama" } } }).pretty();

db.movies.find({ "genres": "Sports" }, { id: 1, name: 1, ratting: 1, "genres.$": 1 }).pretty();


// ------------------------------ $slice ------------------------------------- //
db.movies.find({}, { name: 1, id: 1, genres: { $slice: [2, 2] } }).pretty(); // return only items of specific indexes
db.movies.find({}, { name: 1, id: 1, genres: { $slice: 2 } }).pretty(); // return only two items

// ---------------------------- update document using $set ----------------------------//
db.users.updateOne({ _id: ObjectId('60e326abf88bad3063e61d3b') }, { $set: { hobbies: [{ title: 'Programing', frequency: 4 }, { title: 'Feeding the animal', frequency: 9 }] } });

// ---------------------------- $inc ------------------------------------------------ //
db.users.updateMany({}, { $inc: { age: 1 } });


// ------------------------------ $min in update --------------------------------- //
db.users.updateOne({ name: "Ena" }, { $min: { age: 10 } }); // change will affect if the value ofage grather than 10

// ------------------------------ $max in update --------------------------------- //
db.users.updateOne({ name: "Ena" }, { $max: { age: 10 } }); // change will affect if the value of age less than 10

// ----------------------------- $mul in update ------------------------------- //
db.users.updateOne({ name: "Ena" }, { $mul: { age: 0.5 } }); // will change in order to multiply age by 0.5

// ----------------------------- $unset -------------------------------- //
db.users.updateOne({ name: "Ronaldo" }, { $unset: { phone: "" } }); // will remove field "phone" from collection with matched condition

// ----------------------------- $rename -------------------------------- //
db.users.updateMany({}, { $rename: { age: "totalAge" } }); // will rename age field by totalAge

// ----------------------------- upsert ------------------------------ //
db.users.updateOne({ name: "Rubby" }, { $set: { age: 20, hobbies: [{ title: "Singing", frequency: 4 }] } }, { upsert: true }); // will check first document with condition if not exist then create the document with these values

// ------------------------------- update with $elemMatch ---------------------------- //
db.users.updateMany({ hobbies: { $elemMatch: { "title": "Programing", "frequency": { $gte: 4 } } } }, { $set: { isUpdate: false } }); // if you want more than one condition in embeeded document 

// ------------------------------- update with $elemMatch ---------------------------- //
db.users.updateMany({ hobbies: { $elemMatch: { "title": "Programing", "frequency": { $gte: 4 } } } }, { $set: { "hobbies.$.hightFrequency": true } }); // if you want to update embeeded document with the condition match in same embeeded document

// ------------------------------- update with $[] ---------------------------- //
db.users.updateMany({ age: { $gte: 20 }, isHobby: true }, { $inc: { "hobbies.$[].frequency": 2 } }); // if you want to update all embeeded document with the condition match in same embeeded document

db.users.updateMany({
    "hobbies.frequency": { $gte: 2 }
},
    {
        $set: { "hobbies.$[el].goodFrequency": true }
    }, { arrayFilters: [{ "el.frequency": { $gte: 7 } }] });

// ------------------------- update with $push ----------------------------------- //
db.users.updateOne({ name: "Max" }, { $push: { hobbies: { title: "B", frequency: 6 } } });

// ------------------------- update with $push ----------------------------------- //
db.users.updateOne(
    { name: "max" },
    {
        $push:
        {
            hobbies: {
                $each: [
                    { title: "F", frequency: 10 },
                    { title: "I", frequency: 11 },
                    { title: "H", frequency: 12 }
                ]
            }
        }
    }
);

// Adding item in array of embdeed document using $push
db.users.updateOne(
    { name: "max" },
    {
        $push:
        {
            hobbies: {
                $each: [
                    { title: "F", frequency: 10 },
                    { title: "I", frequency: 11 },
                    { title: "H", frequency: 12 }
                ],
                $sort: { frequency: -1 },
                $slice: 1
            }
        }
    }
);

// update existing embdeed documents with sort splice
db.users.updateOne(
    { name: "Ronaldo" },
    {
        $push: {
            hobbies: {
                $each: [],
                // $each: [{title: "Z", frequency: 31}, {title: "X", frequency: 21}],
                $sort: { frequency: +1 },
                // $splice: 2
            }
        }
    }
);

// remove item of array ofembdeed document using $pull
db.users.updateOne(
    { name: "Ronaldo" },
    {
        $pull: {
            hobbies: { title: "Z" }
        }
    });

//  remove item of array of embdeed document using pull
db.users.updateOne(
    { name: "Ronaldo" },
    {
        $pop: {
            hobbies: -1 // 1
        }
    });

db.ngos.updateMany(
    {},
    [
        {
            $set: {
                website:{$toLower:{$trim:"$website"}}
            }
        },
    ]
    );



    db.ngos.updateMany(
        {},
        [
            {
                $set: {
                    website: { $replaceAll: { input: "$website", find: " ", replacement: "-" } }
                }
            },
        ]
        );