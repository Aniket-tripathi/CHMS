const con = require("../db");


exports.insertVital = (req, res) => {
  const {
    patient_id, vitalvstid, vitalclinic,
    consultid, height, temprature,
    temprature_unit, waist, bloodp,
    bpdia, bloodglucose, cholesterol,
    pulse, respiration, peakflow,
    weight, urinalysis, urinalysis_text,
    body_mass_index, head_circumference, muac,
    rhesus_factor, pregnancy, weeks_of_pregnancy,
    hb_test, note, status, allergies_have,
    vital_from, p_week, p_bump, vital_status,
    vital_tokenid, added_by, vitalstarttime, vitalendtime, adddate, addtime,added_userid
  } = req.body;

  const insertVitalQuery = `
    INSERT INTO public.vital(
      patient_id, vitalvstid, vitalclinic, 
      consultid, height, temprature, 
      temprature_unit, waist, bloodp, 
      bpdia, bloodglucose, cholesterol,
      pulse, respiration, peakflow, 
      weight, urinalysis, urinalysis_text, 
      body_mass_index, head_circumference, muac, 
      rhesus_factor, pregnancy, weeks_of_pregnancy, 
      hb_test, note, status, allergies_have, 
      vital_from, p_week, p_bump, vital_status, 
      vital_tokenid, added_by, vitalstarttime, vitalendtime, adddate, addtime,added_userid
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9,
      $10, $11, $12, $13, $14, $15, $16, $17, $18,
      $19, $20, $21, $22, $23, $24, $25, $26, $27,
      $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39
    );
  `;

  // Execute the query
  con.query(
    insertVitalQuery,
    [
      patient_id, vitalvstid, vitalclinic,
      consultid, height, temprature,
      temprature_unit, waist, bloodp,
      bpdia, bloodglucose, cholesterol,
      pulse, respiration, peakflow,
      weight, urinalysis, urinalysis_text,
      body_mass_index, head_circumference, muac,
      rhesus_factor, pregnancy, weeks_of_pregnancy,
      hb_test, note, status, allergies_have,
      vital_from, p_week, p_bump, vital_status,
      vital_tokenid, added_by, vitalstarttime, vitalendtime, adddate, addtime,added_userid
    ],
    (err, result) => {
      if (err) {
        console.error("Error inserting vital data:", err.stack);
        return res.status(500).send({
          success: false,
          message: "Failed to insert vital data",
          error: err.message,
        });
      } else {
        console.log("Query Result:", result);
        res.status(200).json({
          success: true,
          message: "Vital Inserted Successfully!",
        });
      }
    }
  );
};

exports.bodytemp = (req, res) => {
  const { age, bodytemp } = req.query;

  let badgeClass = "d-none";
  let outputText = "";

  if (age > 5) {
    if (bodytemp > 37.7) {
      badgeClass = "bg-danger";
      outputText = "Fever";
    } else if (bodytemp <= 37.7) {
      badgeClass = "bg-success";
      outputText = "Normal";
    }
  } else if (age > 1) {
    if (bodytemp > 37.7) {
      badgeClass = "bg-danger";
      outputText = "Fever";
    } else if (bodytemp <= 37.7) {
      badgeClass = "bg-success";
      outputText = "Normal";
    }
  } else if (age === 1) {
    if (bodytemp === 36.5) {
      badgeClass = "bg-success";
      outputText = "Normal";
    }
  } else if (age <= 5) {
    if (bodytemp > 37.7) {
      badgeClass = "bg-danger";
      outputText = "Fever";
    } else if (bodytemp >= 35.5 && bodytemp <= 37.5) {
      badgeClass = "bg-success";
      outputText = "Normal";
    }
  } else {
    badgeClass = "d-none";
    outputText = "(Empty)";
  }
  res.json({ bloodtvalidation: { badgeClass, outputText } });
};
exports.respiration = (req, res) => {
  const { age, respirationRate } = req.query;

  // Convert age to months (assuming age is provided in years)
  const ageInMonths = age * 12;

  let badgeresp = "d-none";
  let outputresp = "";

  if (ageInMonths >= 0 && ageInMonths <= 2) {
    if (respirationRate >= 30 && respirationRate <= 60) {
      badgeresp = "bg-success";
      outputresp = "Normal - Respiration Rate";
    } else {
      badgeresp = "";
      outputresp = "";
    }
  } else if (ageInMonths > 2 && ageInMonths <= 60) {
    if (respirationRate >= 12 && respirationRate <= 50) {
      badgeresp = "bg-success";
      outputresp = "Normal - Respiration Rate";
    } else if (ageInMonths > 2 && ageInMonths < 12 && respirationRate >= 50) {
      badgeresp = "bg-danger";
      outputresp = "Having fast breathing - Respiration Rate";
    } else if (ageInMonths >= 12 && ageInMonths < 60 && respirationRate > 40) {
      badgeresp = "bg-danger";
      outputresp = "Having fast breathing - Respiration Rate";
    } else {
      badgeresp = "";
      outputresp = "";
    }
  } else if (ageInMonths >= 60 && ageInMonths < 120) {
    if (respirationRate >= 15 && respirationRate <= 27) {
      badgeresp = "bg-success";
      outputresp = "Normal - Respiration Rate";
    } else {
      badgeresp = "";
      outputresp = "";
    }
  } else if (ageInMonths >= 120) {
    if (respirationRate >= 12 && respirationRate <= 20) {
      badgeresp = "bg-success";
      outputresp = "Normal - Respiration Rate";
    } else {
      badgeresp = "";
      outputresp = "";
    }
  } else {
    badgeresp = "d-none";
    outputresp = "(Empty)";
  }

  res.json({ respirationValidation: { badgeresp, outputresp } });
};

exports.pulserate = (req, res) => {
  const { pulseRate, age } = req.query;

  // Convert age to months
  const ageInMonths = age * 12;

  let badgepulse = "d-none";
  let outputpulse = "";
  console.log(pulseRate);
  if (pulseRate !== "") {
    if (ageInMonths >= 0 && ageInMonths <= 2 && pulseRate >= 70 && pulseRate <= 180) {
      badgepulse = "bg-success";
      outputpulse = "Normal - Pulse Rate";
    } else if (ageInMonths > 2 && ageInMonths <= 60 && pulseRate >= 80 && pulseRate <= 130) {
      badgepulse = "bg-success";
      outputpulse = "Normal - Pulse Rate";
    } else if (ageInMonths > 11 && ageInMonths < 36 && pulseRate >= 80 && pulseRate <= 130) {
      badgepulse = "bg-success";
      outputpulse = "Normal - Pulse Rate";
    } else if (ageInMonths >= 36 && ageInMonths < 72 && pulseRate >= 80 && pulseRate <= 120) {
      badgepulse = "bg-success";
      outputpulse = "Normal - Pulse Rate";
    } else if (ageInMonths >= 72 && ageInMonths < 132 && pulseRate >= 70 && pulseRate <= 110) {
      badgepulse = "bg-success";
      outputpulse = "Normal - Pulse Rate";
    } else if (ageInMonths >= 132 && ageInMonths < 180 && pulseRate >= 60 && pulseRate <= 105) {
      badgepulse = "bg-success";
      outputpulse = "Normal - Pulse Rate";
    } else if (ageInMonths >= 180 && pulseRate >= 50 && pulseRate <= 119) {
      badgepulse = "bg-success";
      outputpulse = "Normal - Pulse Rate";
    } else {
      badgepulse = "bg-danger";
      outputpulse = "Intervention Is Required - Pulse Rate";
    }
  } else {
    badgepulse = "d-none";
    outputpulse = "(Empty)";
  }

  res.json({ pulseValidation: { badgepulse, outputpulse } });
};

exports.bloodPressure = (req, res) => {
  const { age, bloodp } = req.query;

  let badgeBP = "d-none";
  let outputBP = "";

  // Validate blood pressure input
  if (bloodp) {
    const splits = bloodp.split("/");
    const systolic = parseInt(splits[0], 10);
    const diastolic = parseInt(splits[1], 10);

    if (!diastolic || isNaN(systolic) || isNaN(diastolic)) {
      badgeBP = "d-none";
      outputBP = "Invalid blood pressure format. Please use systolic/diastolic (e.g., 120/80).";
    } else {
      if (age >= 18) {
        if (systolic < 130 && diastolic < 85) {
          badgeBP = "bg-success";
          outputBP =
            "Keep up the good work and stick with heart-healthy habits - BP";
        } else if (
          (systolic >= 130 && systolic <= 139) ||
          (diastolic >= 85 && diastolic < 89)
        ) {
          badgeBP = "bg-warning";
          outputBP = "Make lifestyle changes to lower - BP";
        } else if (
          (systolic >= 140 && systolic <= 160) ||
          (diastolic >= 90 && diastolic <= 100)
        ) {
          badgeBP = "bg-primary";
          outputBP =
            "Keep up the good work and stick with heart-healthy habits - BP";
        } else if (
          (systolic >= 160 && systolic <= 179) ||
          (diastolic >= 100 && diastolic < 109)
        ) {
          badgeBP = "bg-danger";
          outputBP = "See a doctor or GP as soon as possible - BP";
        } else if (systolic > 179 || diastolic > 109) {
          badgeBP = "bg-danger";
          outputBP =
            "Requires emergency medical attention. Go to a hospital - BP";
        } else {
          badgeBP = "bg-danger";
          outputBP = "Invalid blood pressure values.";
        }
      } else {
        badgeBP = "bg-danger";
        outputBP = "Age must be 18 or above for validation.";
      }
    }
  } else {
    badgeBP = "d-none";
    outputBP = "(Empty)";
  }

  res.json({ bloodPressureValidation: { badgeBP, outputBP } });
};

exports.bloodGlucose = (req, res) => {
  const { bloodg } = req.query;

  let badgeBG = "d-none";
  let outputBG = "";

  // Validate blood glucose input
  if (bloodg) {
    const glucoseLevel = parseFloat(bloodg);

    if (isNaN(glucoseLevel)) {
      badgeBG = "d-none";
      outputBG = "Invalid glucose level. Please provide a valid numeric value.";
    } else {
      if (glucoseLevel >= 7.0 && glucoseLevel < 11.1) {
        badgeBG = "bg-success";
        outputBG = "Random Blood Glucose - Normal BG";
      } else if (glucoseLevel < 7.0 && glucoseLevel >= 4) {
        badgeBG = "bg-success";
        outputBG = "Fasting Blood Glucose - Normal BG";
      } else if (glucoseLevel < 4) {
        badgeBG = "bg-danger";
        outputBG = "Hypoglycemia – Intervention required - BG";
      } else if (glucoseLevel >= 11.1) {
        badgeBG = "bg-danger";
        outputBG = "Hyperglycemia – Intervention required - BG";
      } else {
        badgeBG = "bg-danger";
        outputBG = "Invalid glucose level.";
      }
    }
  } else {
    badgeBG = "d-none";
    outputBG = "(Empty)";
  }

  res.json({ bloodGlucoseValidation: { badgeBG, outputBG } });
};
exports.bodyWeight = (req, res) => {
  const { weight, age } = req.query;

  let badgeBW = "d-none";
  let outputBW = "";

  if (age && weight) {
    const ageInMonths = parseInt(age) * 12; 
    const bodyWeight = parseFloat(weight);

    if (isNaN(ageInMonths) || isNaN(bodyWeight)) {
    outputBW = "Invalid input. Please provide valid numeric values.";
      badgeBW = "d-none";
    } else if (ageInMonths <= 36) {
      //outputBW logic
      if (ageInMonths < 24) {
        if (bodyWeight < 7.8) {
        outputBW = "Underweight";
          badgeBW = "bg-success";
        } else if (bodyWeight >= 7.8 && bodyWeight <= 10) {
        outputBW = "Healthy weight";
          badgeBW = "bg-primary";
        } else if (bodyWeight > 10 && bodyWeight <= 11.5) {
        outputBW = "Overweight";
          badgeBW = "bg-warning";
        } else if (bodyWeight > 11.5) {
        outputBW = "Obese";
          badgeBW = "bg-danger";
        }
      } else if (ageInMonths >= 24 && ageInMonths < 36) {
        if (bodyWeight < 9.7) {
        outputBW = "Underweight";
          badgeBW = "bg-success";
        } else if (bodyWeight >= 9.7 && bodyWeight <= 13) {
        outputBW = "Healthy weight";
          badgeBW = "bg-primary";
        } else if (bodyWeight > 13 && bodyWeight <= 15) {
        outputBW = "Overweight";
          badgeBW = "bg-warning";
        } else if (bodyWeight > 15) {
        outputBW = "Obese";
          badgeBW = "bg-danger";
        }
      } else if (ageInMonths >= 36) {
        if (bodyWeight < 11.3) {
        outputBW = "Underweight";
          badgeBW = "bg-success";
        } else if (bodyWeight >= 11.3 && bodyWeight <= 15) {
        outputBW = "Healthy weight";
          badgeBW = "bg-primary";
        } else if (bodyWeight > 15 && bodyWeight <= 17.5) {
        outputBW = "Overweight";
          badgeBW = "bg-warning";
        } else if (bodyWeight > 17.5) {
        outputBW = "Obese";
          badgeBW = "bg-danger";
        }
      }
    } else {
    outputBW = "";
      badgeBW = "";
    }
  } else {
  outputBW = "(Empty)";
    badgeBW = "d-none";
  }

  res.json({ weightValidation: { badgeBW,outputBW } });
};

exports.calculateBMI = (req, res) => {
  const { height, weight } =  req.query;
  console.log(`Received height: ${height}, weight: ${weight}`);
 
  if (!height || !weight) {
    return res.status(400).json({
      status: "error",
      message: "Invalid height or weight. Please provide positive numeric values.",
    });
  }

  // Calculate BMI
  const heightInMeters = height / 100; // Convert height from cm to meters
  const bmi = weight / (heightInMeters * heightInMeters);
  const bmiFixed = bmi.toFixed(2);

  // Determine BMI classification
  let outputBMI = "";
  let badgeBMI = "";

  if (bmiFixed < 16.0) {
    outputBMI = "Severely Underweight – Intervention is required, and refer to Dietician";
    badgeBMI = "bg-danger";
  } else if (bmiFixed >= 16.0 && bmiFixed <= 16.9) {
    outputBMI = "Moderately Underweight – Intervention is required, and refer to Dietician";
    badgeBMI = "bg-danger";
  } else if (bmiFixed >= 17.0 && bmiFixed <= 18.4) {
    outputBMI = "Mildly Underweight – Intervention is required, and refer to Dietician";
    badgeBMI = "bg-warning";
  } else if (bmiFixed >= 18.5 && bmiFixed <= 25) {
    outputBMI = "Normal";
    badgeBMI = "bg-success";
  } else if (bmiFixed >= 25.0 && bmiFixed <= 29.9) {
    outputBMI = "Overweight – Intervention is required, and refer to Dietician";
    badgeBMI = "bg-warning";
  } else if (bmiFixed >= 30.0) {
    outputBMI = "Obese – Intervention is required, and refer to Dietician";
    badgeBMI = "bg-danger";
  }

  // Response
  res.json({
    bmiValidation: {
      status: "success",
      bmi: bmiFixed,
      outputBMI,
      badgeBMI,
    }
  });
};

exports.PeakFlow = (req, res) => {
  const peakFlow = parseFloat(req.query.PeakFlow);

  // Validation: Ensure peak flow is a valid positive number
  if (isNaN(peakFlow) || peakFlow <= 0) {
    return res.status(400).json({
      status: "error",
      message: "Invalid peak flow value. Please provide a positive numeric value.",
    });
  }

  let outputpeakflow = "";
  let badgepeakflow = "";

  if (peakFlow > 0 && peakFlow < 6) {
    outputpeakflow = "Severe - Peak Flow";
    badgepeakflow = "bg-danger";
  } else if (peakFlow > 5 && peakFlow < 12) {
    outputpeakflow = "Medium - Peak Flow";
    badgepeakflow = "bg-warning";
  } else if (peakFlow > 11 && peakFlow < 16) {
    outputpeakflow = "Normal - Peak Flow";
    badgepeakflow = "bg-success";
  } else {
    return res.status(400).json({
      status: "error",
      message: "Peak flow value is out of the expected range.",
    });
  }

  // Response
  res.json({ peakflowValidation: {
    status: "success",
    outputpeakflow,
    badgepeakflow,
  }
  });

 

};

exports.getVital = (req, res) => {
  const { type, userid, clinicid } = req.query;

  // SQL query to join the tables
  let get_query = `
    SELECT 
      v.*, 
      c.clinicname, 
      p.fullname, 
      p.patientpno, 
      p.patientemail,
      vr.visit_no
    FROM public.vital v
    JOIN public.clinics c ON c.clinicid = v.vitalclinic
    JOIN public.patientregister p ON p.patientregid = v.patient_id
    LEFT JOIN public.visit_registration vr ON vr.vid = v.vitalvstid
  `;

  if (type === "superadmin") {
    get_query += " ORDER BY v.id DESC;";
  } else if (type === "cadmin") {
    if (!clinicid) {
      return res.status(400).json({ error: "clinicid is required for cadmin type." });
    }
    get_query += ` WHERE v.vitalclinic = '${clinicid}' ORDER BY v.id DESC;`;
  } else if (type === "cstaff") {
    if (!userid) {
      return res.status(400).json({ error: "userid is required for cstaff type." });
    }
    get_query += ` WHERE v.added_userid = '${userid}' ORDER BY v.id DESC;`;
  } else {
    return res.status(400).json({ error: "Invalid type provided." });
  }

  // Execute the query
  con.query(get_query, (err, result) => {
    if (err) {
      console.error("Error executing query:", err);  // Log the error
      res.status(500).send(err);
    } else {
      console.log(result.rows);  // Log the result
      res.json({ vitals: result.rows });
    }
  });
};


exports.getVitalById = (req, res) => {
  const vitalId = req.params.id;  // Get the vital ID from the request parameters

  // SQL query to join the tables and filter by v.id
  const get_query = `
    SELECT 
      v.*,  
      c.clinicname, 
      p.fullname, 
      p.patientpno, 
      p.patientemail,
      p.agep,
      p.gender,
      vr.visit_no
    FROM public.vital v
    JOIN public.clinics c ON c.clinicid = v.vitalclinic
    JOIN public.patientregister p ON p.patientregid = v.patient_id
    LEFT JOIN public.visit_registration vr ON vr.vid = v.vitalvstid
    WHERE v.id = $1  -- Filter by vital id
  `;

  // Execute the query with the parameter for v.id
  con.query(get_query, [vitalId], (err, result) => {
    if (err) {
      // Handle any errors
      res.status(500).send(err);
    } else {
      // Send the result as a JSON response
      console.log(result.rows);
      res.json({ vitals: result.rows });
    }
  });
};


