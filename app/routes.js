var User = require('../app/models/user');
module.exports = function(app, passport) {


    app.get('/calc', function(req, res) {

        var calcTest = req.query.num; 
        if(req.query.num == undefined){
            calcTest = 9;
        }
    var numberData =  parseInt(calcTest) * parseInt(calcTest) + 3;
     res.render('calc.ejs', { num: numberData });

    });


};

