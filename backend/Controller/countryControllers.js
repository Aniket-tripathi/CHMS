const con = require("../db");

exports.getCountry = (req, res) => {
    try {
        const get_query = `SELECT * FROM public.country`;
        con.query(get_query, (err, result) => {
            if (err) {
                console.error("Database Error:", err.message || err);
                return res
                    .status(500)
                    .json({
                        error: "Database query failed",
                        details: err.message || err,
                    });
            }
            console.log("Query result:", result.rows);
            return res.json({ countrys: result.rows }); // Fix response key
        });
    } catch (err) {
        console.error("Unexpected error:", err.message || err);
        return res
            .status(500)
            .json({ error: "Internal Server Error", details: err.message || err });
    }
};
