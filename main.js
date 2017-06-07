var express = require("express");
var fs = require("fs");
var tools = require("./tools");
var bp = require("body-parser");
var decodeHtml = require("decode-html");

var app = express();
app.use(bp.json());
app.use(bp.urlencoded({extended:true}));

//http server
app.get("/compile", function(req, res) {
    res.end(fs.readFileSync("./www/index.html"));
});

//api
app.post("/compile/:id", function(req, res) {
    if (req.params.id) {
        let lang = req.params.id; // from the client's json request
        let config = JSON.parse(fs.readFileSync("./env.json").toString());
        let cmd = config[`compile_${lang}_cmd`].toString();
        let src = decodeHtml(req.body.code);

        console.log(`compile request\n\tlanguage: ${lang}\n\tsource len: ${src.length}`);

        let srcBaseName = "src";
        cmd = tools.setOptions([`${srcBaseName}`], cmd);

        //write the code to file
        let srcFn = `${srcBaseName}.c`;
        fs.writeFileSync(srcFn, src);

        //compile...
        console.log("compiling...");
        let result = tools.run(cmd);
        fs.unlink(srcFn);

        //if it worked, run & grab output
        if (result.errors) 
            console.log("compilation failed!");
        else {
            console.log("executing compiled program...");
            let exeFn = `${srcBaseName}.exe`;
            result = tools.run(exeFn);
            fs.unlink(exeFn);
        }

        tools.send(res, result);
    } else {
        invalidResp(res);
    }
});

var port = 80;
app.listen(port, function() {
    // console.log(`server running on localhost:${port}`);
    console.log(`server running on port ${port}`);
});
