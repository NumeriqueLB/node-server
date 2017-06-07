var cp = require("child_process");

module.exports = {
    send: function(res, result, extra_data = null) {
        let o = {
            result: result,
            extra_data: extra_data
        }

        res.set('Cache-Control', 'no-cache');
        res.send(o);

        return o;
    },

    invalidResp: function(res) {
        tools.send(res, "failed", {"errors": true});
    },

    setOptions: function(options, template) {
        let result = template;
        let i = 1;
        options.forEach(function(o) {
            result = result.replace(new RegExp(`:${i}`, 'g'), o);
            i++;
        }, this);
        return result;
    },

    run: function(path) {
        result = {
            errors: true,
            output: "no output"
        }
        try {
            let procResult = cp.execSync(path);
            result.errors = false;
            result.output = procResult.toString();
        } catch (e) {
            result.errors = true;
            result.output = e.stderr.toString();
        }
        return result;
    }
};