const Employee = require('../../models/Employee');
const Company = require('../../models/Company');


const getAllEmployee = (req, res) => {
    Employee.find({}, {__v: 0}).sort({name: -1}).lean().populate('company', {name: 1}).exec((err, products) => {
        if (err) return res.status(500).json({msg: "Server Error :)", err: console.log(err.message)});
        res.render('message', {products});
    });
};

const getSingleEmployee = (req, res) => {
    Employee.findById(req.params.employee, {__v: 0}).populate('company', {name: 1, registrationNumber: 1, _id: 1}).exec((err, employee) => {
        if (err) return res.status(500).json({msg: "Server Error :)", err: console.log(err.message)});

        let d = new Date(employee.birthday), month = '' + (d.getMonth() + 1), day = '' + d.getDate(), year = d.getFullYear();
        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        res.render('employee', {employee:employee, birthday: [year, month, day].join('-')});
    });
};

const createEmployee = (req, res) => {
    if (!req.body.lastName && !req.body.firstName && !req.body.city && !req.body.nationalNumber && !req.body.beManager && !req.body.company && !req.body.gender && !req.body.bigint) {
        return res.status(400).render('message', {message: "Bad Request :)"})
    };
    Employee.findOne({nationalNumber: req.body.nationalNumber.trim()}, (err, employee) => {
        console.log(req.body.company);
        if (err) return res.status(500).json({msg: "Server Error :)", err: console.log(err.message)});
        if (employee) return res.status(406).render('message', {message: "Employee Exist :("})
        Company.findOne({registrationNumber: req.body.company}, (err, company) => {
            if (err) return res.status(500).json({msg: "Server Error :)", err: console.log(err.message)});
            if (!company) return res.status(406).render('message', {message: "Company doesn't exist :("})

            if (req.body.beManager === 'yes'){
                Employee.findOne({company: company._id, beManager: true}, (err, employee) => {
                    if (err) return res.status(500).json({msg: "Server Error :)", err: console.log(err.message)});
                    if (employee) return res.status(406).render('message', {message: 'This Company already have a manager.'});

                    const newProduct = new Employee({
                        lastName: req.body.lastName,
                        firstName: req.body.firstName,
                        nationalNumber: req.body.nationalNumber,
                        beManager: req.body.beManager === "yes",
                        gender: req.body.gender === "man",
                        birthday: req.body.birthday,
                        company: company._id
                    });

                    newProduct.save((err, product) => {
                        if (err) return res.status(500).json({msg: "Server Error :)", err: console.log(err.message)});
                        res.render('message', {message: 'The operation was successful.'});
                    });
                });
            } else {

                const newProduct = new Employee({
                    lastName: req.body.lastName,
                    firstName: req.body.firstName,
                    nationalNumber: req.body.nationalNumber,
                    beManager: req.body.beManager === "yes",
                    gender: req.body.gender === "man",
                    birthday: req.body.birthday,
                    company: company._id
                });

                newProduct.save((err, product) => {
                    if (err) return res.status(500).json({msg: "Server Error :)", err: console.log(err.message)});
                    res.render('message', {message: 'The operation was successful.'});
                });
            }
        });
    });
};

const updateEmployee = (req, res) => {
    if (!req.body.lastName && !req.body.firstName && !req.body.city && !req.body.nationalNumber && !req.body.beManager && !req.body.company && !req.body.gender && !req.body.bigint) {
        return res.status(400).render('message', {message: "Bad Request :)"});
    };
    Employee.findOne({$and: [{nationalNumber: req.body.nationalNumber}, {_id: {$ne: req.params.id}}]}, (err, employee) => {
        if (err) return res.status(500).json({msg: 'Server Error :)', err: console.log(err.message)});
        if (employee) return res.render('message', {message: 'An Employee whit this national number already exist.'})
    });

    Company.findOne({registrationNumber: req.body.company}, (err, company) => {
        if (err) return res.status(500).json({msg: "Server Error :)", err: console.log(err.message)});
        if (!company) return res.status(406).render('message', {message: "Company doesn't exist :("})

        if (req.body.beManager === 'yes'){
            Employee.findOne({company: company._id, beManager: true}, (err, employee) => {
                if (err) return res.status(500).json({msg: "Server Error :)", err: console.log(err.message)});
                if (employee) return res.status(406).render('message', {message: 'This Company already have a manager.'});

                const updateObj = {
                    lastName: req.body.lastName,
                    firstName: req.body.firstName,
                    nationalNumber: req.body.nationalNumber,
                    beManager: req.body.beManager === "yes",
                    gender: req.body.gender === "man",
                    birthday: req.body.birthday,
                    company: company._id
                };
                Employee.findByIdAndUpdate(req.params.id, updateObj, {new: true}, (err, employee) => {
                    if (err) return res.status(500).json({msg: "Server Error :)", err: console.log(err.message)});
                    if (!employee) return res.status(405).render('message', {message: "The Employee Not Found!"});
                    res.render('message', {message: 'The operation was successful.'});
                });

            });
        } else {

            const updateObj = {
                lastName: req.body.lastName,
                firstName: req.body.firstName,
                nationalNumber: req.body.nationalNumber,
                beManager: req.body.beManager === "yes",
                gender: req.body.gender === "man",
                birthday: req.body.birthday,
                company: company._id
            };
            Employee.findByIdAndUpdate(req.params.id, updateObj, {new: true}, (err, employee) => {
                if (err) return res.status(500).json({msg: "Server Error :)", err: console.log(err.message)});
                if (!employee) return res.status(405).render('message', {message: "The Employee Not Found!"});
                res.render('message', {message: 'The operation was successful.'});
            });
        }
    });
};

const deleteEmployee = (req, res) => {
    Employee.findByIdAndDelete(req.params.id, (err, employee) => {
        if (err) return res.status(500).json({msg: "Server Error :)", err: console.log(err.message)});
        if (!employee) return res.status(405).render('message', {message: "The Employee Not Found!"});
        res.render('message', {message: 'The operation was successful.'});
    });
};


module.exports = {
    getAllEmployee,
    getSingleEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee,
};
