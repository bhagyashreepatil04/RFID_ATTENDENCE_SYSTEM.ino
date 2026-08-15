// =====================================================
// RFID ATTENDANCE SYSTEM
// GOOGLE APPS SCRIPT
// =====================================================

const MINIMUM_ATTENDANCE_MINUTES = 60;


// =====================================================
// MAIN FUNCTION
// =====================================================

function doGet(e) {

  const lock = LockService.getScriptLock();

  try {

    lock.waitLock(10000);

    const sheet =
      SpreadsheetApp
        .getActiveSpreadsheet()
        .getSheets()[0];


    // =================================================
    // HEADERS
    // =================================================

    const headers = [
      "UID",
      "Name",
      "Date",
      "Day",
      "In Time",
      "Out Time",
      "Total Classes",
      "Classes Attended",
      "Attendance %"
    ];

    sheet
      .getRange(1, 1, 1, 9)
      .setValues([headers]);

    sheet
      .getRange(1, 1, 1, 9)
      .setFontWeight("bold");


    // =================================================
    // GET DATA FROM ESP32
    // =================================================

    const uid =
      String(e.parameter.uid || "").trim();

    const name =
      String(e.parameter.name || "").trim();

    const date =
      normalizeDate(
        String(e.parameter.date || "").trim()
      );

    const time =
      String(e.parameter.time || "").trim();


    if (!uid || !name || !date || !time) {

      return ContentService
        .createTextOutput(
          "ERROR|Missing data"
        );
    }


    // =================================================
    // GET DAY NUMBER
    // =================================================

    const classDay =
      getClassDay(sheet, date);


    // =================================================
    // FIND SAME STUDENT + SAME DATE
    // =================================================

    const lastRow =
      sheet.getLastRow();

    let existingRow = -1;


    if (lastRow >= 2) {

      const data =
        sheet
          .getRange(
            2,
            1,
            lastRow - 1,
            9
          )
          .getDisplayValues();


      for (let i = 0; i < data.length; i++) {

        const existingUID =
          String(data[i][0])
            .trim()
            .toUpperCase();

        const existingDate =
          normalizeDate(
            String(data[i][2]).trim()
          );


        if (
          existingUID ===
            uid.toUpperCase()
          &&
          existingDate === date
        ) {

          existingRow = i + 2;

          break;
        }
      }
    }


    // =================================================
    // FIRST SCAN OF THE DAY
    // =================================================

    if (existingRow === -1) {

      const newRow =
        sheet.getLastRow() + 1;


      sheet
        .getRange(
          newRow,
          1,
          1,
          9
        )
        .setValues([[
          uid,
          name,
          date,
          "Day " + classDay,
          time,
          "",
          "",
          "",
          ""
        ]]);


      // Keep date/time as text
      sheet
        .getRange(
          newRow,
          3,
          1,
          4
        )
        .setNumberFormat("@");


      SpreadsheetApp.flush();


      updateAttendance(sheet);


      return ContentService
        .createTextOutput(
          "ENTRY|" + name
        );
    }


    // =================================================
    // GET IN TIME
    // =================================================

    const inTime =
      sheet
        .getRange(
          existingRow,
          5
        )
        .getDisplayValue()
        .trim();


    const outTime =
      sheet
        .getRange(
          existingRow,
          6
        )
        .getDisplayValue()
        .trim();


    // =================================================
    // ALREADY COMPLETED TODAY
    // =================================================

    if (outTime !== "") {

      return ContentService
        .createTextOutput(
          "COMPLETED|" + name
        );
    }


    // =================================================
    // CALCULATE TIME DIFFERENCE
    // =================================================

    const minutesPassed =
      calculateMinutes(
        inTime,
        time
      );


    // =================================================
    // LESS THAN ONE HOUR
    // =================================================

    if (
      minutesPassed <
      MINIMUM_ATTENDANCE_MINUTES
    ) {

      const remaining =
        MINIMUM_ATTENDANCE_MINUTES -
        minutesPassed;


      return ContentService
        .createTextOutput(
          "EARLY|" +
          name +
          "|" +
          remaining
        );
    }


    // =================================================
    // VALID EXIT
    // =================================================

    sheet
      .getRange(
        existingRow,
        6
      )
      .setValue(time);


    sheet
      .getRange(
        existingRow,
        6
      )
      .setNumberFormat("@");


    SpreadsheetApp.flush();


    updateAttendance(sheet);


    return ContentService
      .createTextOutput(
        "PRESENT|" + name
      );

  }


  catch (error) {

    return ContentService
      .createTextOutput(
        "ERROR|" +
        error.toString()
      );
  }


  finally {

    try {
      lock.releaseLock();
    }
    catch (error) {
    }
  }
}


// =====================================================
// NORMALIZE DATE
// =====================================================

function normalizeDate(dateString) {

  return String(dateString)
    .trim()
    .replace(/-/g, "/");
}


// =====================================================
// CALCULATE MINUTES BETWEEN TIMES
// =====================================================

function calculateMinutes(
  inTime,
  outTime
) {

  const inParts =
    inTime.split(":");

  const outParts =
    outTime.split(":");


  if (
    inParts.length < 2 ||
    outParts.length < 2
  ) {
    return 0;
  }


  const inSeconds =
    (
      parseInt(inParts[0]) * 3600
    ) +
    (
      parseInt(inParts[1]) * 60
    ) +
    (
      parseInt(inParts[2] || 0)
    );


  const outSeconds =
    (
      parseInt(outParts[0]) * 3600
    ) +
    (
      parseInt(outParts[1]) * 60
    ) +
    (
      parseInt(outParts[2] || 0)
    );


  let difference =
    outSeconds - inSeconds;


  // Handle midnight crossing
  if (difference < 0) {
    difference += 24 * 3600;
  }


  return Math.floor(
    difference / 60
  );
}


// =====================================================
// GET CLASS DAY NUMBER
// =====================================================

function getClassDay(
  sheet,
  currentDate
) {

  const lastRow =
    sheet.getLastRow();


  if (lastRow < 2) {
    return 1;
  }


  const data =
    sheet
      .getRange(
        2,
        3,
        lastRow - 1,
        1
      )
      .getDisplayValues();


  const dates = {};


  for (
    let i = 0;
    i < data.length;
    i++
  ) {

    const d =
      normalizeDate(
        data[i][0]
      );


    if (d !== "") {
      dates[d] = true;
    }
  }


  dates[currentDate] = true;


  return Object.keys(dates).length;
}


// =====================================================
// UPDATE ATTENDANCE
// =====================================================

function updateAttendance(sheet) {

  const lastRow =
    sheet.getLastRow();


  if (lastRow < 2) {
    return;
  }


  const data =
    sheet
      .getRange(
        2,
        1,
        lastRow - 1,
        9
      )
      .getDisplayValues();


  // =================================================
  // COUNT CLASS DAYS
  // ONLY COMPLETED ATTENDANCE DAYS COUNT
  // =================================================

  const completedDates = {};


  for (
    let i = 0;
    i < data.length;
    i++
  ) {

    const inTime =
      String(data[i][4]).trim();

    const outTime =
      String(data[i][5]).trim();


    if (
      inTime !== "" &&
      outTime !== ""
    ) {

      const minutes =
        calculateMinutes(
          inTime,
          outTime
        );


      if (
        minutes >=
        MINIMUM_ATTENDANCE_MINUTES
      ) {

        const date =
          normalizeDate(
            data[i][2]
          );

        completedDates[date] = true;
      }
    }
  }


  const totalClasses =
    Object.keys(
      completedDates
    ).length;


  // =================================================
  // COUNT ATTENDANCE PER STUDENT
  // =================================================

  const studentAttendance = {};


  for (
    let i = 0;
    i < data.length;
    i++
  ) {

    const uid =
      String(data[i][0])
        .trim()
        .toUpperCase();


    const inTime =
      String(data[i][4]).trim();


    const outTime =
      String(data[i][5]).trim();


    const date =
      normalizeDate(
        data[i][2]
      );


    if (
      inTime !== "" &&
      outTime !== ""
    ) {

      const minutes =
        calculateMinutes(
          inTime,
          outTime
        );


      if (
        minutes >=
        MINIMUM_ATTENDANCE_MINUTES
      ) {

        if (
          !studentAttendance[uid]
        ) {

          studentAttendance[uid] = {};
        }


        studentAttendance[uid][date] =
          true;
      }
    }
  }


  // =================================================
  // WRITE RESULTS
  // =================================================

  for (
    let i = 0;
    i < data.length;
    i++
  ) {

    const uid =
      String(data[i][0])
        .trim()
        .toUpperCase();


    let attended = 0;


    if (
      studentAttendance[uid]
    ) {

      attended =
        Object.keys(
          studentAttendance[uid]
        ).length;
    }


    let percentage = 0;


    if (
      totalClasses > 0
    ) {

      percentage =
        (
          attended /
          totalClasses
        ) * 100;
    }


    sheet
      .getRange(
        i + 2,
        7
      )
      .setValue(
        totalClasses
      );


    sheet
      .getRange(
        i + 2,
        8
      )
      .setValue(
        attended
      );


    sheet
      .getRange(
        i + 2,
        9
      )
      .setValue(
        percentage.toFixed(2) + "%"
      );
  }


  // =================================================
  // FORMAT
  // =================================================

  sheet
    .getRange(
      1,
      1,
      lastRow,
      9
    )
    .setHorizontalAlignment(
      "center"
    );


  sheet
    .getRange(
      1,
      1,
      1,
      9
    )
    .setFontWeight(
      "bold"
    );


  sheet.autoResizeColumns(
    1,
    9
  );
}
