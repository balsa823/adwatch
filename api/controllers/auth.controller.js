const db = require("../models");
const config = require("../config/auth.config");

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

const signUp = async (req, res) => {
  // Save User to Database
  try {
    const user = await db.User.create({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8)
    })
  
    if (req.body.roles) {
      const roles = await db.Role.findAll({
        where: {
          name: {
            [db.Sequelize.Op.or]: req.body.roles
          }
        }})
        await user.setRoles(roles)
        res.send({ message: "User was registered successfully!" });
  
      }else{
        res.send({ message: "User was registered successfully!" });
      }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
}

const signIn = async (req, res) => {
  try {
    const user = await db.User.findOne({
      where: {
        email: req.body.email
      }
    })
  
    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }
  
    var passwordIsValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );
  
    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: "Invalid Password!"
      });
    }
  
    var token = jwt.sign({ id: user.id }, config.secret, {
      expiresIn: 86400 // 24 hours
    });
  
    var authorities = [];
    const roles = await user.getRoles()
    
    for (let i = 0; i < roles.length; i++) {
      authorities.push("ROLE_" + roles[i].name.toUpperCase());
    }
    res.status(200).send({
      id: user.id,
      username: user.username,
      email: user.email,
      roles: authorities,
      accessToken: token
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
}

module.exports = {
  signIn,
  signUp
}