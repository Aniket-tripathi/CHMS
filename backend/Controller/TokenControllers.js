const con = require('../db');

// exports.inserttoken = (req, res) => {
//     const {
//         clinic_id = null,
//         token_registered = null,
//         token_idnumber = null,
//         token_pdob = null,
//         patient_id = null,
//         tokenstream = null,  // This is the classification_id
//         token_reason = null,
//         tokenvip = null,
//         tokentype = null,
//         tokenstatus = null,
//         tokendisplaystatus = null,
//         added_by = null,
//         tokenaddtime = null,
//         tokenendtime = null,
//         audiable = null,
//         mobile = null,
//         tokenconsultationstatus = null,
//         emergency = null,
//         tokenvisitstatus = null,
//         token_pharmacy_status = null,
//         dispense = null,
//         adddate = null,
//         addtime = null,
//         added_userid = null,
//     } = req.body;

//     // Handle tokenaddtime and adddate defaults
//     const today = new Date();
//     const formattedDate = adddate ? new Date(adddate) : today; // Default to today if adddate is not provided
//     const tokenaddtime_str = formattedDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
//     const day = String(today.getDate()).padStart(2, '0');
//     const month = String(today.getMonth() + 1).padStart(2, '0');
//     const year = String(today.getFullYear()).slice(-2);
//     const tokenPrefix = `TKN${year}${month}${day}`;

//     // Query to get the classification name based on the tokenstream (which is the classification_id)
//     const getClassificationQuery = `
//         SELECT c.classification
//         FROM public.classification c
//         WHERE c.id = $1;
//     `;

//     console.log('Debug: Running query to fetch classification for tokenstream:', tokenstream);

//     // Fetch the classification name based on tokenstream (classification_id)
//     con.query(getClassificationQuery, [tokenstream], (err, classificationResult) => {
//         if (err) {
//             console.error("Error fetching classification:", err.stack);
//             return res.status(500).json({
//                 message: "Error fetching classification for token stream",
//                 error: err.message,
//             });
//         }

//         if (classificationResult.rows.length === 0) {
//             console.error("No classification found for token stream:", tokenstream);
//             return res.status(404).json({
//                 message: "No classification found for the provided token stream",
//             });
//         }

//         let classificationName = classificationResult.rows[0].classification;

//         if (!classificationName || typeof classificationName !== 'string') {
//             console.error("Classification name is empty, null, or not a string:", classificationName);
//             return res.status(400).json({
//                 message: "Invalid classification name.",
//             });
//         }

//         const firstLetter = classificationName.charAt(0).toUpperCase(); // Get the first letter
//         console.log('Debug: Classification Name fetched:', classificationName);

//         // Query to get the latest token number for the same clinic, stream, and date
//         const getLastTokenQuery = `
//             SELECT tokenno
//             FROM public.tokens
//             WHERE clinic_id = $1
//             AND tokenstream = $2
//             AND TO_DATE(tokenaddtime, 'YYYY-MM-DD') = CURRENT_DATE::DATE
//             ORDER BY tokenno DESC
//             LIMIT 1;
//         `;

//         console.log('Debug: Running query to get the last token for today for clinic and stream:', clinic_id, tokenstream);

//         con.query(getLastTokenQuery, [clinic_id, tokenstream], (err, lastTokenResult) => {
//             if (err) {
//                 console.error("Error fetching last token:", err.stack);
//                 return res.status(500).json({
//                     message: "Error fetching last token",
//                     error: err.message,
//                 });
//             }

//             let tokenNumber;
//             if (lastTokenResult.rows.length > 0) {
//                 // Increment the token number if a token exists for today
//                 const lastToken = lastTokenResult.rows[0].tokenno;
//                 const lastTokenNumber = parseInt(lastToken.slice(3), 10); // Get the numeric part
//                 const newTokenNumber = lastTokenNumber + 1;
//                 tokenNumber = `${firstLetter}${String(newTokenNumber).padStart(3, '0')}`;
//             } else {
//                 // If no token exists for today, start from 001
//                 tokenNumber = `${firstLetter}001`;
//             }

//             console.log('Debug: Generated Token Number:', tokenNumber);

//             const insertTokenQuery = `
//                 INSERT INTO public.tokens (
//                     clinic_id, tokenno, token_registered, token_idnumber, token_pdob, patient_id,
//                     tokenstream, token_reason, tokenvip, tokentype, tokenstatus, tokendisplaystatus,
//                     added_by, tokenaddtime, tokenendtime, audiable, mobile, tokenconsultationstatus,
//                     emergency, tokenvisitstatus, token_pharmacy_status, dispense, adddate, addtime, added_userid
//                 ) VALUES (
//                     $1, $2, $3, $4, $5, $6,
//                     $7, $8, $9, $10, $11, $12,
//                     $13, $14, $15, $16, $17, $18,
//                     $19, $20, $21, $22, $23, $24, $25
//                 ) RETURNING id, tokenno;
//             `;

//             const tokenValues = [
//                 clinic_id,
//                 tokenNumber,  // Use the generated token number
//                 token_registered,
//                 token_idnumber,
//                 token_pdob,
//                 patient_id,
//                 tokenstream,
//                 token_reason,
//                 tokenvip,
//                 tokentype,
//                 tokenstatus || 'Active', // Default to 'Active' if not provided
//                 tokendisplaystatus,
//                 added_by,
//                 tokenaddtime || tokenaddtime_str,  // Default to tokenaddtime_str if empty
//                 tokenendtime,
//                 audiable,
//                 mobile,
//                 tokenconsultationstatus,
//                 emergency,
//                 tokenvisitstatus,
//                 token_pharmacy_status,
//                 dispense,
//                 adddate || tokenaddtime_str,  // Default to tokenaddtime_str if empty
//                 addtime,
//                 added_userid
//             ];

//             console.log('Debug: Running query to insert token with values:', tokenValues);

//             // Insert token into the database
//             con.query(insertTokenQuery, tokenValues, (err, tokenResult) => {
//                 if (err) {
//                     console.error("Error inserting token data:", err.stack);
//                     return res.status(500).json({
//                         message: "Error inserting token data",
//                         error: err.message,
//                     });
//                 }

//                 const tokenId = tokenResult.rows[0].id;
//                 const tokenNumber = tokenResult.rows[0].tokenno;
//                 console.log('Debug: Token inserted successfully with tokenId:', tokenId);

//                 // Query to get the most recent active counters and check if they are full
//                 const getCountersQuery = `
//                     SELECT id, current_token
//                     FROM public.counter
//                     WHERE clinic_id = $1
//                     AND stream_id = $2
//                     AND countertype = 'Clinic'
//                     AND counterstatus = 'Active'
//                     ORDER BY counter.id DESC
//                     LIMIT 2;
//                 `;

//                 const counterValues = [clinic_id, tokenstream];
//                 console.log('Debug: Running query to get the two most recent active counters:', counterValues);

//                 con.query(getCountersQuery, counterValues, (err, counterResult) => {
//                     if (err) {
//                         console.error("Error fetching counters:", err.stack);
//                         return res.status(500).json({
//                             message: "Error fetching counters",
//                             error: err.message,
//                         });
//                     }

//                     if (counterResult.rows.length === 0) {
//                         console.error("No active counters found.");
//                         return res.status(404).json({
//                             message: "No active counters found",
//                         });
//                     }

//                     const [mostRecentCounter, previousCounter] = counterResult.rows;

//                     // Check if all counters are full (i.e., current_token is not null)
//                     const allCountersFull = counterResult.rows.every(counter => counter.current_token !== null);

//                     if (allCountersFull) {
//                         // If all counters are full, set token status as 'Waiting'
//                         console.log("All counters are full. Setting token status as 'Waiting'.");
//                         const updateTokenStatusQuery = `
//                             UPDATE public.tokens
//                             SET tokenstatus = 'Waiting'
//                             WHERE id = $1
//                             RETURNING id, tokenstatus;
//                         `;

//                         con.query(updateTokenStatusQuery, [tokenId], (err, updateResult) => {
//                             if (err) {
//                                 console.error("Error updating token status:", err.stack);
//                                 return res.status(500).json({
//                                     message: "Error updating token status",
//                                     error: err.message,
//                                 });
//                             }

//                             console.log('Debug: Token status updated to Waiting:', updateResult.rows[0]);
//                             return res.status(200).json({
//                                 message: "All counters are full. Token status set to 'Waiting'.",
//                                 tokenId: tokenId,
//                                 tokenNumber: tokenNumber,
//                             });
//                         });
//                     } else {
//                         // If counters are not full, proceed to update the token to the most recent counter
//                         const counterToUpdate = mostRecentCounter.current_token ? previousCounter : mostRecentCounter;
//                         const updateCounterQuery = `
//                             UPDATE public.counter
//                             SET current_token = $1, current_tokenid = $2
//                             WHERE id = $3
//                             RETURNING id;
//                         `;
//                         con.query(updateCounterQuery, [tokenNumber, tokenId, counterToUpdate.id], (err, updateResult) => {
//                             if (err) {
//                                 console.error("Error updating counter:", err.stack);
//                                 return res.status(500).json({
//                                     message: "Error updating counter",
//                                     error: err.message,
//                                 });
//                             }

//                             // Update the token status to "Current" once assigned to a counter
//                             const updateTokenStatusQuery = `
//                                 UPDATE public.tokens
//                                 SET tokenstatus = 'Current'
//                                 WHERE id = $1
//                                 RETURNING id, tokenstatus;
//                             `;

//                             console.log('Debug: Running query to update token status to Current:', tokenId);

//                             // Update the token status to "Current"
//                             con.query(updateTokenStatusQuery, [tokenId], (err, updateTokenResult) => {
//                                 if (err) {
//                                     console.error("Error updating token status:", err.stack);
//                                     return res.status(500).json({
//                                         message: "Error updating token status",
//                                         error: err.message,
//                                     });
//                                 }

//                                 console.log('Debug: Token status updated to Current:', updateTokenResult.rows[0]);

//                                 // Return the success response
//                                 res.status(201).json({
//                                     message: "Token inserted and counter updated successfully, token status set to 'Current'",
//                                     tokenId: tokenId,
//                                     tokenNumber: tokenNumber,
//                                     counterId: updateResult.rows[0].id,
//                                     tokenStatus: updateTokenResult.rows[0].tokenstatus, // Include the updated token status in the response
//                                 });
//                             });
//                         });
//                     }
//                 });
//             });
//         });
//     });
// };

exports.inserttoken = (req, res) => {
    const {
        clinic_id = null,
        token_registered = null,
        token_idnumber = null,
        token_pdob = null,
        patient_id = null,
        tokenstream = null,  // This is the classification_id
        token_reason = null,
        tokenvip = null,
        tokentype = null,
        tokenstatus = null,
        tokendisplaystatus = null,
        added_by = null,
        tokenaddtime = null,
        tokenendtime = null,
        audiable = null,
        mobile = null,
        tokenconsultationstatus = null,
        emergency = null,
        tokenvisitstatus = null,
        token_pharmacy_status = null,
        dispense = null,
        adddate = null,
        addtime = null,
        added_userid = null,
    } = req.body;

    // Handle tokenaddtime and adddate defaults
    const today = new Date();
    const formattedDate = adddate ? new Date(adddate) : today; // Default to today if adddate is not provided
    const tokenaddtime_str = formattedDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = String(today.getFullYear()).slice(-2);
    const tokenPrefix = `TKN${year}${month}${day}`;

    // Query to get the classification name based on the tokenstream (which is the classification_id)
    const getClassificationQuery = `
        SELECT c.classification
        FROM public.classification c
        WHERE c.id = $1;
    `;

    console.log('Debug: Running query to fetch classification for tokenstream:', tokenstream);

    // Fetch the classification name based on tokenstream (classification_id)
    con.query(getClassificationQuery, [tokenstream], (err, classificationResult) => {
        if (err) {
            console.error("Error fetching classification:", err.stack);
            return res.status(500).json({
                message: "Error fetching classification for token stream",
                error: err.message,
            });
        }

        if (classificationResult.rows.length === 0) {
            console.error("No classification found for token stream:", tokenstream);
            return res.status(404).json({
                message: "No classification found for the provided token stream",
            });
        }

        let classificationName = classificationResult.rows[0].classification;

        if (!classificationName || typeof classificationName !== 'string') {
            console.error("Classification name is empty, null, or not a string:", classificationName);
            return res.status(400).json({
                message: "Invalid classification name.",
            });
        }

        const firstLetter = classificationName.charAt(0).toUpperCase(); // Get the first letter
        console.log('Debug: Classification Name fetched:', classificationName);

        // Query to get the latest token number for the same clinic, stream, and date
        const getLastTokenQuery = `
            SELECT tokenno
            FROM public.tokens
            WHERE clinic_id = $1
            AND tokenstream = $2
            AND TO_DATE(tokenaddtime, 'YYYY-MM-DD') = CURRENT_DATE::DATE
            ORDER BY tokenno DESC
            LIMIT 1;
        `;

        console.log('Debug: Running query to get the last token for today for clinic and stream:', clinic_id, tokenstream);

        con.query(getLastTokenQuery, [clinic_id, tokenstream], (err, lastTokenResult) => {
            if (err) {
                console.error("Error fetching last token:", err.stack);
                return res.status(500).json({
                    message: "Error fetching last token",
                    error: err.message,
                });
            }

            let tokenNumber;
            if (lastTokenResult.rows.length > 0) {
                // Increment the token number if a token exists for today
                const lastToken = lastTokenResult.rows[0].tokenno;
                const lastTokenNumber = parseInt(lastToken.slice(3), 10); // Get the numeric part
                const newTokenNumber = lastTokenNumber + 1;
                tokenNumber = `${firstLetter}${String(newTokenNumber).padStart(3, '0')}`;
            } else {
                // If no token exists for today, start from 001
                tokenNumber = `${firstLetter}001`;
            }

            console.log('Debug: Generated Token Number:', tokenNumber);

            const insertTokenQuery = `
                INSERT INTO public.tokens (
                    clinic_id, tokenno, token_registered, token_idnumber, token_pdob, patient_id,
                    tokenstream, token_reason, tokenvip, tokentype, tokenstatus, tokendisplaystatus,
                    added_by, tokenaddtime, tokenendtime, audiable, mobile, tokenconsultationstatus,
                    emergency, tokenvisitstatus, token_pharmacy_status, dispense, adddate, addtime, added_userid
                ) VALUES (
                    $1, $2, $3, $4, $5, $6,
                    $7, $8, $9, $10, $11, $12,
                    $13, $14, $15, $16, $17, $18,
                    $19, $20, $21, $22, $23, $24, $25
                ) RETURNING id, tokenno;
            `;

            const tokenValues = [
                clinic_id,
                tokenNumber,  // Use the generated token number
                token_registered,
                token_idnumber,
                token_pdob,
                patient_id,
                tokenstream,
                token_reason,
                tokenvip,
                tokentype,
                tokenstatus || 'Active', // Default to 'Active' if not provided
                tokendisplaystatus,
                added_by,
                tokenaddtime || tokenaddtime_str,  // Default to tokenaddtime_str if empty
                tokenendtime,
                audiable,
                mobile,
                tokenconsultationstatus,
                emergency,
                tokenvisitstatus,
                token_pharmacy_status,
                dispense,
                adddate || tokenaddtime_str,  // Default to tokenaddtime_str if empty
                addtime,
                added_userid
            ];

            console.log('Debug: Running query to insert token with values:', tokenValues);

            // Insert the token and get the inserted token id
            con.query(insertTokenQuery, tokenValues, (err, tokenResult) => {
                if (err) {
                    console.error("Error inserting token:", err.stack);
                    return res.status(500).json({
                        message: "Error inserting token",
                        error: err.message,
                    });
                }

                const tokenId = tokenResult.rows[0].id;  // This is where tokenId is defined
                const tokenNumber = tokenResult.rows[0].tokenno;  // Token number returned

                console.log('Debug: Token inserted successfully with tokenId:', tokenId);

                // Query to get the most recent active counters for the clinic and stream
                const getCountersQuery = `
                    SELECT id, current_token, current_tokenid
                    FROM public.counter
                    WHERE clinic_id = $1
                    AND stream_id = $2
                    AND countertype = 'Clinic'
                    AND counterstatus = 'Active'
                    ORDER BY counter.id DESC
                    LIMIT 2;
                `;

                const counterValues = [clinic_id, tokenstream];
                console.log('Debug: Running query to get the two most recent active counters:', counterValues);

                con.query(getCountersQuery, counterValues, (err, counterResult) => {
                    if (err) {
                        console.error("Error fetching counters:", err.stack);
                        return res.status(500).json({
                            message: "Error fetching counters",
                            error: err.message,
                        });
                    }

                    if (counterResult.rows.length === 0) {
                        console.error("No active counters found.");
                        // Return a message saying no counters are available and stop token insertion
                        return res.status(400).json({
                            message: "No active counters found. Token cannot be inserted.",
                        });
                    }

                    const [mostRecentCounter, previousCounter] = counterResult.rows;

                    // Check if any counter has columns that are NULL or empty
                    const availableCounter = counterResult.rows.find(counter => {
                        return !counter.current_token || !counter.current_tokenid; // Check if these columns are empty or NULL
                    });

                    if (availableCounter) {
                        // If a counter is available (empty current_token or current_tokenid), update the token and counter
                        const updateCounterQuery = `
                            UPDATE public.counter
                            SET current_token = $1, current_tokenid = $2
                            WHERE id = $3
                            RETURNING id;
                        `;

                        con.query(updateCounterQuery, [tokenNumber, tokenId, availableCounter.id], (err, updateResult) => {
                            if (err) {
                                console.error("Error updating counter:", err.stack);
                                return res.status(500).json({
                                    message: "Error updating counter",
                                    error: err.message,
                                });
                            }

                            // Update the token status to "Current" once assigned to a counter
                            const updateTokenStatusQuery = `
                                UPDATE public.tokens
                                SET tokenstatus = 'Current'
                                WHERE id = $1
                                RETURNING id, tokenstatus;
                            `;

                            console.log('Debug: Running query to update token status to Current:', tokenId);

                            con.query(updateTokenStatusQuery, [tokenId], (err, updateTokenResult) => {
                                if (err) {
                                    console.error("Error updating token status:", err.stack);
                                    return res.status(500).json({
                                        message: "Error updating token status",
                                        error: err.message,
                                    });
                                }

                                console.log('Debug: Token status updated to Current:', updateTokenResult.rows[0]);

                                // Return the success response
                                res.status(201).json({
                                    message: "Token inserted and counter updated successfully, token status set to 'Current'",
                                    tokenId: tokenId,
                                    tokenNumber: tokenNumber,
                                    counterId: updateResult.rows[0].id,
                                    tokenStatus: updateTokenResult.rows[0].tokenstatus, // Include the updated token status
                                });
                            });
                        });
                    } else {
                        // If no available counter is found, set token status to "Waiting"
                        const updateTokenStatusQuery = `
                            UPDATE public.tokens
                            SET tokenstatus = 'Waiting'
                            WHERE id = $1
                            RETURNING id, tokenstatus;
                        `;

                        con.query(updateTokenStatusQuery, [tokenId], (err, updateResult) => {
                            if (err) {
                                console.error("Error updating token status to Waiting:", err.stack);
                                return res.status(500).json({
                                    message: "Error updating token status to Waiting",
                                    error: err.message,
                                });
                            }

                            console.log('Debug: Token status set to Waiting:', updateResult.rows[0]);

                            res.status(200).json({
                                message: "All counters are full. Token status set to 'Waiting'.",
                                tokenId: tokenId,
                                tokenNumber: tokenNumber,
                            });
                        });
                    }
                });
            });
        });
    });
};


exports.Waitingtoken = (req, res) => {
    const { id } = req.params;
    const query = 'SELECT tokenno FROM tokens WHERE tokenstatus = $1 AND clinic_id = $2';

    con.query(query, ['Waiting', id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database query failed', error: err });
        }
        if (results.rows && results.rows.length > 0) {
            return res.status(200).json({ tokens: results.rows });
        } else {
            return res.status(404).json({ message: 'No waiting tokens found for this clinic' });
        }
    });
};

exports.tokendata = (req, res) => {
    const { type, clinicid } = req.query;
  
    try {
      // Base SQL query for fetching tokens, clinics, patients, and classifications
      let get_query = `
        SELECT 
          t.*, 
          c."clinicname", 
          pr."fullname", 
          pr."mpino", 
          cl."classification"
        FROM public.tokens t
        LEFT JOIN public.clinics c ON t."clinic_id" = c."clinicid"
        LEFT JOIN public.patientregister pr ON pr."patientregid" = t."patient_id"
        LEFT JOIN public.classification cl ON cl."id" = t."tokenstream"
      `;
  
      if (type === "superadmin") {
        // Superadmin: No clinic filter, fetch all tokens, ordered by token ID
        get_query += " ORDER BY t.id DESC;";
      } else if (clinicid) {
        // Non-superadmin: Filter by clinicid
        get_query += " WHERE t.clinic_id = $1 ORDER BY t.id DESC;";
      } else {
        // If no clinicid is provided for non-superadmins, return an error
        return res.status(400).json({ error: "Clinic ID is required for non-superadmin users." });
      }
  
      // Execute the query with clinicid as a parameter if it's required
      const queryParams = (type !== "superadmin" && clinicid) ? [clinicid] : [];
  
      con.query(get_query, queryParams, (err, result) => {
        if (err) {
          console.error('Database Error:', err);
          return res.status(500).json({ error: 'Database query failed', details: err.message });
        }
  
        console.log('Query result:', result.rows);
        return res.json({ tokens: result.rows });
      });
  
    } catch (err) {
      console.error('Unexpected error:', err);
      return res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
  };
  
  

exports.gettoken = (req, res) => {
    const { id } = req.params;
    const get_query = `SELECT 
    tokens.id, 
    tokens.clinic_id, 
    tokens.tokenno, 
    tokens.token_pdob, 
    tokens.token_reason, 
    tokens.adddate,
    clinics.clinicname, 
    classification.classification
FROM public.tokens
JOIN public.clinics ON tokens.clinic_id = clinics.clinicid
JOIN public.classification ON classification.clinic_id = clinics.clinicid
WHERE tokens.id = $1
`;

    con.query(get_query, [id], (err, result) => {
        if (err) {
            res.status(500).send(err);
        } else {
            console.log(result.rows);
            res.json({ tokens: result.rows[0] });
        }
    });
}


exports.completetoken = (req, res) => {
    const { id } = req.params;

    // Step 1: Clear current_tokenid and current_token in counter table where current_tokenid matches the token id
    const clear_counter_query = `
        UPDATE public.counter
        SET current_tokenid = NULL,
            current_token = NULL
        WHERE current_tokenid = $1;
    `;

    // First query: clear current_tokenid and current_token
    con.query(clear_counter_query, [id], (err, result) => {
        if (err) {
            console.error('Error clearing counter token:', err);
            return res.status(500).json({
                success: false,
                message: "An error occurred while clearing the counter token.",
                error: err.message,
            });
        }

        console.log(`Counter token cleared for token ID ${id}`);

        // Step 2: Update the token status to 'Completed' in the tokens table
        const update_token_query = `
            UPDATE public.tokens
            SET tokenstatus = 'Completed'
            WHERE id = $1;
        `;

        // Second query: update token status to 'Completed'
        con.query(update_token_query, [id], (err, result) => {
            if (err) {
                console.error('Error updating token status:', err);
                return res.status(500).json({
                    success: false,
                    message: "An error occurred while updating the token status.",
                    error: err.message,
                });
            }

            console.log(`Token with ID ${id} updated to 'Completed'`);

            // Step 3: Find a token with the same clinic_id and tokenstream where tokenstatus = 'Waiting'
            const check_token_query = `
                SELECT id, clinic_id, tokenstream, tokenno
                FROM public.tokens
                WHERE clinic_id = (SELECT clinic_id FROM public.tokens WHERE id = $1)
                  AND tokenstream = (SELECT tokenstream FROM public.tokens WHERE id = $1)
                  AND tokenstatus = 'Waiting'
                LIMIT 1;
            `;

            // Third query: check for another token with the same clinic_id and tokenstream
            con.query(check_token_query, [id], (err, result) => {
                if (err) {
                    console.error('Error checking for available token:', err);
                    return res.status(500).json({
                        success: false,
                        message: "An error occurred while checking for the available token.",
                        error: err.message,
                    });
                }

                // Log the result of token check
                console.log(`Available token check result: `, result.rows);

                // If a token is found, update the counter table with the new token
                if (result.rows.length > 0) {
                    const new_token = result.rows[0];  // Get the first matching token

                    // Step 4: Update counter with the new token's id and tokenno
                    const update_counter_query = `
                        UPDATE public.counter
                        SET current_tokenid = $1,
                            current_token = $2
                        WHERE current_tokenid IS NULL;  -- Update where current_tokenid is NULL
                    `;

                    // Log the counter update attempt
                    console.log(`Attempting to update counter with token ID ${new_token.id} and token ${new_token.tokenno}`);

                    // Fourth query: update counter with the new token info
                    con.query(update_counter_query, [new_token.id, new_token.tokenno], (err, result) => {
                        if (err) {
                            console.error('Error updating counter with new token:', err);
                            return res.status(500).json({
                                success: false,
                                message: "An error occurred while updating the counter with the new token.",
                                error: err.message,
                            });
                        }

                        console.log(`Counter updated with new token ID ${new_token.id}`);

                        // Step 5: Update the new token's status to 'Current'
                        const update_new_token_status = `
                            UPDATE public.tokens
                            SET tokenstatus = 'Current'
                            WHERE id = $1;
                        `;

                        // Fifth query: update the new token's status to 'Current'
                        con.query(update_new_token_status, [new_token.id], (err, result) => {
                            if (err) {
                                console.error('Error updating token status to Current:', err);
                                return res.status(500).json({
                                    success: false,
                                    message: "An error occurred while updating the new token status to 'Current'.",
                                    error: err.message,
                                });
                            }

                            console.log(`Token with ID ${new_token.id} updated to 'Current'`);
                            res.status(200).json({
                                success: true,
                                message: `Token with ID ${id} updated to 'Completed', counter cleared, new token set, and new token marked as 'Current'.`,
                            });
                        });
                    });
                } else {
                    // If no token is found for the same clinic_id and tokenstream
                    console.log(`No available token found for the same clinic and stream as token ${id}.`);
                    res.status(200).json({
                        success: true,
                        message: `Token with ID ${id} updated to 'Completed' and counter cleared. No new token found.`,
                    });
                }
            });
        });
    });
};








