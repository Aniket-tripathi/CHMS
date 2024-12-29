const con = require("../db")

exports.getDistrict = (req, res) => {
    try {
        const get_query = `SELECT * FROM public.district`;
        con.query(get_query, (err, result) => {
            if (err) {
                console.error('Database Error:', err);
                return res.status(500).json({ error: 'Database query failed', details: err });
            }
            console.log('Query result:', result.rows);
            return res.json({ district: result.rows });
        });
    } catch (err) {
        console.error('Unexpected error:', err);
        return res.status(500).json({ error: 'Internal Server Error', details: err });
    }
};
