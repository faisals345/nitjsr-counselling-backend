const db = require("../../helpers/dbconnect");

const denyDecision = async (req, res) => {
  const regNo = req.body.regno;
  const centerInchargeEmail = req.body.email;

  try {
    const studentStatus = await db.queryAsync(
      "SELECT * FROM student_status WHERE regno = ?",
      [regNo]
    );
    if (studentStatus.length == 0) throw new Error("student do not exist");
    if (studentStatus[0].confirmationPending == false)
      throw new Error("No pending decision");
    const centerInchargeCollege = await db.queryAsync(
      "SELECT college FROM center_incharge WHERE email = ?",
      [centerInchargeEmail]
    );

    if (
      studentStatus[0].verifying_college !== centerInchargeCollege[0].college
    ) {
      return res.status(401).json({ success: false, message: "not eligible" });
    }

    await db.queryAsync(
      "UPDATE student_status SET applicationStatus= 'pending', acceptedBy = NULL,rejectedBy = NULL,confirmationPending = ?,failureDesc = NULL WHERE regno = ? ",
      [false, regNo]
    );

    res.status(200).json({ success: true, message: "denied succesfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = denyDecision;
