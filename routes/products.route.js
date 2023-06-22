const express = require("express");
const router = express.Router();

router.get("/tools",(req,res)=>{
res.send("products get router")
});

router.post("/tools",(req,res)=>{
res.send("products post router")
});


module.exports = router;
