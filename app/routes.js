// const { db } = require('./models/sample');
var credentialData = require('./models/sample');
var bcrypt = require('bcrypt');

module.exports = function (app) {
    app.post('/user/create', function (req, res) {
        const requestBody = req.body;
        const result = validateUser(requestBody);
        var hashedPassword;
        if (result) {

            bcrypt.genSalt(10, function (err, Salt) {

                // The bcrypt is used for encrypting password.
                bcrypt.hash(requestBody.password, Salt, function (err, hash) {

                    if (err) {
                        return console.log('Cannot encrypt');
                    }
                    hashedPassword = hash;
                    console.log(hash);

                    credentialData.create({
                        fullName: requestBody.fullName,
                        email: requestBody.email,
                        password: hash
                    }, function (err, success) {
                        console.log("data inserted successfully");
                    });
                    res.json({ "success": "User was successfully created" });
                });
            });
        }
        else {
            console.log("data not inserted!");
            res.json({ "success": "User was not created" });
        }
    });

    app.put('/user/edit', async (req, res)=> {
        const requestBody = req.body;
        const fn = validateFullName(requestBody.fullName);
        const pass = validatePassword(requestBody.password);
        const em = requestBody.email;
        const uid = req.params.uid;
        if (fn && pass) {
            console.log("Inside 1st if")
            var filter = { email: em };

            const userdetails = await credentialData.findOne(filter);
            console.log(userdetails)
            if (userdetails == null){
                
                return res.send("User does not exist");
            }
            else{
                const newvalue = {
                    $set:{ 
                        fullName: requestBody.fullName, password: requestBody.password 
                    }
                };
                credentialData.updateOne(filter, newvalue, {upsert: true }, function(err){
                    if (err) throw err;
                    console.log("edited!")
                });
                return res.send("record updated!");
            }

            
        }
        else{
            res.json({"success": "FullName or Password invalid!"});
        }
    });

    app.delete('/user/delete', function (req, res) {
        const requestBody = req.body;
        const uid = req.params.uid;
        const em = requestBody.email;
        var filter = {email: em};

        // const userdetails = await credentialData.findOne(filter);
        // console.log(userdetails)
        // if (userdetails == null){
            
        //     return res.send("User does not exist");
        // }
        // else{
             credentialData.deleteOne(filter, function(err){
                if (err) throw err;
                console.log("deleted!")
            });
            return res.send("record deleted!");
        //}



        // let deletedCount = await credentialData.deleteOne(filter);
        // res.json(deletedCount);
    });

    app.get('/user/getAll', function (req, res) {
        credentialData.find({}, function (err, result) {
            if (err) throw err;
            //console.log("email: " + result.email + " password: " + result.password);
            res.json(result);
        });
    })
}

function validateUser(requestBody) {
    if (validateEmail(requestBody.email) && validateFullName(requestBody.fullName)) {
        if (validatePassword(requestBody.password)) {
            return true;
        }
        else {
            console.log("Wrong password");
            return false;
        }
    }
    else {
        console.log("Wrong email or full name");
        return false;
    }
}


function validateFullName(fullName) {
    if (fullName.length == "") {
        return false;
    } else if (fullName.length < 8) {
        return false;
    } else {
        return true;
    }
}

function validateEmail(email) {
    let regex = /[a-z0-9]+@northeastern.edu/;
    if (regex.test(email)) {
        return true;
    } else {
        return false;
    }
}

function validatePassword(password) {
    let regexp = /[A-Za-z0-9.@#!$%&*]{8,}/;
    if (password.length == "") {
        return false;
    }
    if (!regexp.test(password)) {
        return false;
    } else {
        return true;
    }
}