const con = require('../db');

exports.insertAuditTrial = (req, res) => {
    const { message, recordId, userId, clinicId, action, ipAddress, platform, agent, userRole, userType, menuType } = req.body;

    // Format the date and time for South Africa
    const now = new Date();
    const southAfricaTime = new Intl.DateTimeFormat("en-ZA", {
        timeZone: "Africa/Johannesburg",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    }).formatToParts(now);

    const date = `${southAfricaTime[4].value.padStart(2, "0")}-${southAfricaTime[2].value.padStart(2, "0")}-${southAfricaTime[0].value}`;
    const time = `${southAfricaTime[6].value}:${southAfricaTime[8].value}:${southAfricaTime[10].value}`;

    const insert_query = `
      INSERT INTO "auditTrial" ("message", "recordId", "userId", "clinicId", "action", "ipAddress", "platform", "agent", "userRole", "userType", "menuType", "date", "time") 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `;

    // Debugging logs
    console.log("Query:", insert_query);
    console.log("Parameters:", [message, recordId, userId, clinicId, action, ipAddress, platform, agent, userRole, userType, menuType, date, time]);

    con.query(
        insert_query,
        [message, recordId, userId, clinicId, action, ipAddress, platform, agent, userRole, userType, menuType, date, time],
        (err, result) => {
            if (err) {
                console.error("Database Error:", err);
                return res.status(500).json({
                    success: false,
                    error: "Database Error",
                    details: err.message,
                });
            }

            // Success response
            res.status(200).json({
                success: true,
                message: "AuditTrial Data Inserted Successfully!",
            });
        }
    );
};

exports.getAuditTrialByClinic = (req, res) => {
    const { clinicId } = req.params;

    if (!clinicId) {
        return res.status(400).json({
            success: false,
            message: "Clinic ID is required",
        });
    }

    const select_query = `
        SELECT * 
        FROM "auditTrial" 
        WHERE "clinicId" = $1
        ORDER BY "date" DESC, "time" DESC
    `;

    con.query(select_query, [clinicId], (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({
                success: false,
                error: "Database Error",
                details: err.message,
            });
        }

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No audit trail data found for the specified clinic ID",
            });
        }

        // Success response
        res.status(200).json({
            success: true,
            data: result.rows,
        });
    });
};

exports.getAllAuditTrial = (req, res) => {
    const { type, userid, clinicid } = req.query;
    console.log(type);

    let query = `
    SELECT 
        "auditTrial".*, 
        "clinics"."clinicname" 
    FROM 
        "auditTrial"
    LEFT JOIN 
        "clinics" 
    ON 
        CAST("auditTrial"."clinicId" AS INTEGER) = "clinics"."clinicid"
`;
    let params = [];
    // Append conditions based on the user type
    if (type === "superadmin") {
        query += ` ORDER BY "auditTrial".id DESC;`;
    } else if (type === "cadmin") {
        query += ` WHERE "auditTrial"."clinicId" = '${clinicid}' ORDER BY "auditTrial".id DESC;`;
    } else {
        query = ""; // Invalid case, no query to execute
    }

    // Execute the query to fetch rows from the auditTrial table with clinic details
    con.query(query, (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({
                success: false,
                error: "Database Error",
                details: err.message,
            });
        }

        // Success response with retrieved data
        res.status(200).json({
            success: true,
            data: result.rows, // Assuming you're using a database driver like pg for PostgreSQL
        });
    });
};



