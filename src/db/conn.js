const mongoose = require('mongoose');

mongoose.connect("mongodb://0.0.0.0:27017/amazon-api",{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(()=>{
    console.log(`connection is successful for model`);
}).catch((e)=>{
    console.log(`error is ${e}`);
})
