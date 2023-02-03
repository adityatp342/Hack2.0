const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const USER = mongoose.model("USER");
const requireLogin = require("../middlewares/requireLogin");

// to get user profile
router.get("/user/:id", (req, res) => {
    USER.findOne({ _id: req.params.id })
        .select("-password")
        .then(user => {
            console.log(res);
            
            // POST.find({ postedBy: req.params.id })
            //     .populate("postedBy", "_id")
            //     .exec((err, post) => {
            //         if (err) {
            //             return res.status(422).json({ error: err })
            //         }
            //         res.status(200).json({ user, post })
            //     })
        }).catch(err => {
            return res.status(404).json({ error: "User not found" })
        })
})

router.get("/users", (req, res) => {

    console.log("Pranav  ----------");
    // USER.find({})
       
    //     .then(user => {
    //         console.log("Paul ------");
            
    //         console.log(res);
            
          
    //     }).catch(err => {
    //         return res.status(404).json({ error: "User not found" })
    //     })
})


router.put("/update_volunteer/:id", (req, res) => {
    
    USER.findByIdAndUpdate(req.params.id,{is_vol:true}, {new: true},(err,user)=>{
        if(err){
            console.log(err)
        }else{
            console.log(user)
        }
    })
    // console.log("Pranav  ----------");
    // USER.find({})
       
    //     .then(user => {
    //         console.log("Paul ------");
            
    //         console.log(res);
            
          
    //     }).catch(err => {
    //         return res.status(404).json({ error: "User not found" })
    //     })
})
  
module.exports = router;