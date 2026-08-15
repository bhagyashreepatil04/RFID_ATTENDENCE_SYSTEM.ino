#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>
#include "time.h"

// =====================================================
// RC522 PINS
// =====================================================

#define RFID_SS   21
#define RFID_RST  22

#define RFID_SCK  18
#define RFID_MISO 19
#define RFID_MOSI 23

MFRC522 rfid(
  RFID_SS,
  RFID_RST
);


// =====================================================
// BUZZER
// =====================================================

#define BUZZER_PIN 25


// =====================================================
// WIFI
// =====================================================
// Enter your Wi-Fi details here before uploading
// =====================================================

const char* WIFI_SSID =
  "YOUR_WIFI_NAME";

const char* WIFI_PASSWORD =
  "YOUR_WIFI_PASSWORD";


// =====================================================
// GOOGLE APPS SCRIPT
// =====================================================
// Enter your Google Apps Script Web App URL here
// =====================================================

String SHEET_URL =
  "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL";


// =====================================================
// STUDENTS
// =====================================================
// Replace these with your own RFID UIDs and names
// =====================================================

struct Student {

  String uid;
  String name;
};


Student students[] = {

  {"YOUR_CARD_UID_1", "Student_1"},
  {"YOUR_CARD_UID_2", "Student_2"},
  {"YOUR_CARD_UID_3", "Student_3"},
  {"YOUR_CARD_UID_4", "Student_4"},
  {"YOUR_CARD_UID_5", "Student_5"},
  {"YOUR_CARD_UID_6", "Student_6"}

};


const int NUMBER_OF_STUDENTS = 6;


// =====================================================
// INDIA TIME
// =====================================================

const char* NTP_SERVER =
  "pool.ntp.org";

const long GMT_OFFSET_SEC =
  19800;

const int DAYLIGHT_OFFSET_SEC =
  0;


// =====================================================
// PREVENT RAPID DOUBLE SCAN
// =====================================================

String lastUID = "";

unsigned long lastScanTime = 0;

const unsigned long SCAN_DELAY =
  3000;


// =====================================================
// FIND STUDENT NAME
// =====================================================

String getStudentName(
  String uid
)
{

  for (
    int i = 0;
    i < NUMBER_OF_STUDENTS;
    i++
  )
  {

    if (
      students[i].uid == uid
    )
    {

      return students[i].name;
    }
  }

  return "Unknown";
}


// =====================================================
// URL ENCODE
// =====================================================

String urlEncode(
  String text
)
{

  String encoded = "";

  for (
    unsigned int i = 0;
    i < text.length();
    i++
  )
  {

    char c = text[i];


    if (
      isalnum(c) ||
      c == '-' ||
      c == '_' ||
      c == '.' ||
      c == '~'
    )
    {

      encoded += c;
    }

    else
    {

      char buffer[4];

      sprintf(
        buffer,
        "%%%02X",
        (unsigned char)c
      );

      encoded += buffer;
    }
  }

  return encoded;
}


// =====================================================
// GET DATE
// =====================================================

String getDate()
{

  struct tm timeinfo;


  if (
    !getLocalTime(
      &timeinfo,
      5000
    )
  )
  {

    return "--/--/----";
  }


  char buffer[11];


  strftime(
    buffer,
    sizeof(buffer),
    "%d/%m/%Y",
    &timeinfo
  );


  return String(buffer);
}


// =====================================================
// GET TIME
// =====================================================

String getTime()
{

  struct tm timeinfo;


  if (
    !getLocalTime(
      &timeinfo,
      5000
    )
  )
  {

    return "--:--:--";
  }


  char buffer[9];


  strftime(
    buffer,
    sizeof(buffer),
    "%H:%M:%S",
    &timeinfo
  );


  return String(buffer);
}


// =====================================================
// BUZZER - SINGLE BEEP
// =====================================================

void beepOnce()
{

  tone(
    BUZZER_PIN,
    2000
  );

  delay(250);

  noTone(
    BUZZER_PIN
  );

  delay(100);
}


// =====================================================
// STARTUP BEEP
// =====================================================

void startupBeep()
{

  beepOnce();

  delay(150);

  beepOnce();
}


// =====================================================
// SUCCESS BEEP
// =====================================================

void successBeep()
{

  tone(
    BUZZER_PIN,
    2500
  );

  delay(300);

  noTone(
    BUZZER_PIN
  );
}


// =====================================================
// WARNING BEEP
// =====================================================

void warningBeep()
{

  Serial.println();

  Serial.println(
    "WARNING!"
  );

  Serial.println(
    "EXIT ATTEMPTED BEFORE 1 HOUR!"
  );

  Serial.println(
    "Attendance NOT marked."
  );


  // Warning sound for 5 seconds

  tone(
    BUZZER_PIN,
    1000
  );

  delay(5000);

  noTone(
    BUZZER_PIN
  );
}


// =====================================================
// CONNECT WIFI
// =====================================================

bool connectWiFi()
{

  Serial.println();

  Serial.println(
    "Connecting to WiFi..."
  );


  WiFi.mode(
    WIFI_STA
  );


  WiFi.begin(
    WIFI_SSID,
    WIFI_PASSWORD
  );


  int attempts = 0;


  while (
    WiFi.status() != WL_CONNECTED &&
    attempts < 40
  )
  {

    delay(500);

    Serial.print(".");

    attempts++;
  }


  Serial.println();


  if (
    WiFi.status() ==
    WL_CONNECTED
  )
  {

    Serial.println(
      "WiFi Connected!"
    );


    Serial.print(
      "IP Address: "
    );

    Serial.println(
      WiFi.localIP()
    );


    // Synchronize time

    configTime(
      GMT_OFFSET_SEC,
      DAYLIGHT_OFFSET_SEC,
      NTP_SERVER
    );


    struct tm timeinfo;


    if (
      getLocalTime(
        &timeinfo,
        5000
      )
    )
    {

      Serial.println(
        "Time synced successfully."
      );
    }

    else
    {

      Serial.println(
        "WARNING: Time synchronization failed."
      );
    }


    return true;
  }


  Serial.println(
    "WiFi connection FAILED."
  );


  return false;
}


// =====================================================
// SEND DATA TO GOOGLE SHEET
// =====================================================

String sendToGoogleSheet(
  String uid,
  String name,
  String date,
  String time
)
{

  // ---------------------------------------------------
  // CHECK WIFI
  // ---------------------------------------------------

  if (
    WiFi.status() !=
    WL_CONNECTED
  )
  {

    Serial.println(
      "ERROR: WiFi not connected."
    );

    return "ERROR";
  }


  // ---------------------------------------------------
  // CREATE URL
  // ---------------------------------------------------

  String url =
    SHEET_URL +
    "?uid=" +
    urlEncode(uid) +
    "&name=" +
    urlEncode(name) +
    "&date=" +
    urlEncode(date) +
    "&time=" +
    urlEncode(time);


  Serial.println();

  Serial.println(
    "Sending data to Google Sheet..."
  );


  // ---------------------------------------------------
  // HTTPS CONNECTION
  // ---------------------------------------------------

  WiFiClientSecure client;

  client.setInsecure();


  HTTPClient http;


  if (
    !http.begin(
      client,
      url
    )
  )
  {

    Serial.println(
      "HTTP connection failed."
    );

    return "ERROR";
  }


  http.setTimeout(
    15000
  );


  // ---------------------------------------------------
  // SEND REQUEST
  // ---------------------------------------------------

  int httpCode =
    http.GET();


  Serial.print(
    "HTTP Response Code: "
  );

  Serial.println(
    httpCode
  );


  // ===================================================
  // GOOGLE REDIRECT
  // ===================================================

  if (
    httpCode == 301 ||
    httpCode == 302
  )
  {

    String redirectURL =
      http.getLocation();


    http.end();


    Serial.println(
      "Google redirected the request."
    );

    Serial.println(
      "Following redirect..."
    );


    WiFiClientSecure client2;

    client2.setInsecure();


    HTTPClient http2;


    if (
      !http2.begin(
        client2,
        redirectURL
      )
    )
    {

      Serial.println(
        "Redirect failed."
      );

      return "ERROR";
    }


    http2.setTimeout(
      15000
    );


    int finalCode =
      http2.GET();


    Serial.print(
      "Final HTTP Response Code: "
    );

    Serial.println(
      finalCode
    );


    if (
      finalCode > 0
    )
    {

      String response =
        http2.getString();


      response.trim();


      Serial.println(
        "Google Apps Script Response:"
      );

      Serial.println(
        response
      );


      http2.end();


      return response;
    }


    http2.end();


    return "ERROR";
  }


  // ===================================================
  // DIRECT RESPONSE
  // ===================================================

  if (
    httpCode > 0
  )
  {

    String response =
      http.getString();


    response.trim();


    Serial.println(
      "Google Apps Script Response:"
    );

    Serial.println(
      response
    );


    http.end();


    return response;
  }


  // ---------------------------------------------------
  // ERROR
  // ---------------------------------------------------

  http.end();


  return "ERROR";
}


// =====================================================
// SETUP
// =====================================================

void setup()
{

  Serial.begin(
    115200
  );


  delay(1000);


  Serial.println();

  Serial.println(
    "======================================"
  );

  Serial.println(
    "ESP32 RFID ATTENDANCE SYSTEM"
  );

  Serial.println(
    "======================================"
  );


  // ===================================================
  // BUZZER
  // ===================================================

  pinMode(
    BUZZER_PIN,
    OUTPUT
  );


  Serial.println(
    "Testing buzzer..."
  );


  startupBeep();


  // ===================================================
  // RC522 RFID
  // ===================================================

  Serial.println(
    "Starting RC522..."
  );


  SPI.begin(
    RFID_SCK,
    RFID_MISO,
    RFID_MOSI,
    RFID_SS
  );


  rfid.PCD_Init();


  delay(100);


  // ---------------------------------------------------
  // CHECK RC522
  // ---------------------------------------------------

  byte version =
    rfid.PCD_ReadRegister(
      MFRC522::VersionReg
    );


  Serial.print(
    "RC522 Version: 0x"
  );

  Serial.println(
    version,
    HEX
  );


  if (
    version == 0x00 ||
    version == 0xFF
  )
  {

    Serial.println(
      "ERROR: RC522 NOT DETECTED!"
    );


    while (true)
    {

      delay(1000);
    }
  }


  Serial.println(
    "RC522 detected successfully!"
  );


  // ===================================================
  // WIFI
  // ===================================================

  connectWiFi();


  // ===================================================
  // SYSTEM READY
  // ===================================================

  Serial.println();

  Serial.println(
    "======================================"
  );

  Serial.println(
    "SYSTEM READY"
  );

  Serial.println(
    "Place RFID card near RC522"
  );

  Serial.println(
    "======================================"
  );
}


// =====================================================
// MAIN LOOP
// =====================================================

void loop()
{

  // ===================================================
  // CHECK WIFI
  // ===================================================

  static unsigned long lastWiFiCheck = 0;


  if (
    WiFi.status() != WL_CONNECTED &&
    millis() - lastWiFiCheck > 10000
  )
  {

    lastWiFiCheck =
      millis();


    Serial.println(
      "WiFi disconnected."
    );


    connectWiFi();
  }


  // ===================================================
  // CHECK FOR RFID CARD
  // ===================================================

  if (
    !rfid.PICC_IsNewCardPresent()
  )
  {

    return;
  }


  if (
    !rfid.PICC_ReadCardSerial()
  )
  {

    return;
  }


  // ===================================================
  // READ RFID UID
  // ===================================================

  String uid = "";


  for (
    byte i = 0;
    i < rfid.uid.size;
    i++
  )
  {

    char buffer[3];


    sprintf(
      buffer,
      "%02X",
      rfid.uid.uidByte[i]
    );


    uid += buffer;
  }


  uid.toUpperCase();


  // ===================================================
  // PREVENT RAPID REPEATED SCAN
  // ===================================================

  if (
    uid == lastUID &&
    millis() - lastScanTime <
      SCAN_DELAY
  )
  {

    rfid.PICC_HaltA();

    rfid.PCD_StopCrypto1();

    return;
  }


  lastUID =
    uid;


  lastScanTime =
    millis();


  // ===================================================
  // GET STUDENT DETAILS
  // ===================================================

  String name =
    getStudentName(
      uid
    );


  String date =
    getDate();


  String time =
    getTime();


  // ===================================================
  // SERIAL MONITOR
  // ===================================================

  Serial.println();

  Serial.println(
    "======================================"
  );

  Serial.println(
    "RFID CARD DETECTED"
  );

  Serial.println(
    "======================================"
  );


  Serial.print(
    "UID   : "
  );

  Serial.println(
    uid
  );


  Serial.print(
    "Name  : "
  );

  Serial.println(
    name
  );


  Serial.print(
    "Date  : "
  );

  Serial.println(
    date
  );


  Serial.print(
    "Time  : "
  );

  Serial.println(
    time
  );


  // ===================================================
  // UNKNOWN CARD
  // ===================================================

  if (
    name == "Unknown"
  )
  {

    warningBeep();

  }


  // ===================================================
  // REGISTERED STUDENT
  // ===================================================

  else
  {

    String response =
      sendToGoogleSheet(
        uid,
        name,
        date,
        time
      );


    // =================================================
    // FIRST SCAN / IN TIME
    // =================================================

    if (
      response.startsWith(
        "ENTRY|"
      )
    )
    {

      Serial.println(
        "ENTRY TIME RECORDED."
      );


      beepOnce();
    }


    // =================================================
    // VALID OUT TIME
    // =================================================

    else if (
      response.startsWith(
        "PRESENT|"
      )
    )
    {

      Serial.println(
        "ATTENDANCE MARKED PRESENT."
      );


      Serial.println(
        "VALID: 1 HOUR COMPLETED."
      );


      successBeep();
    }


    // =================================================
    // EARLY EXIT
    // =================================================

    else if (
      response.startsWith(
        "EARLY|"
      )
    )
    {

      Serial.println(
        "EXIT TOO EARLY!"
      );


      Serial.println(
        "ATTENDANCE NOT MARKED."
      );


      warningBeep();
    }


    // =================================================
    // ALREADY COMPLETED
    // =================================================

    else if (
      response.startsWith(
        "COMPLETED|"
      )
    )
    {

      Serial.println(
        "TODAY'S ATTENDANCE ALREADY COMPLETED."
      );


      warningBeep();
    }


    // =================================================
    // ERROR / UNKNOWN RESPONSE
    // =================================================

    else
    {

      Serial.println(
        "SERVER RESPONSE:"
      );


      Serial.println(
        response
      );
    }
  }


  Serial.println(
    "======================================"
  );


  // ===================================================
  // STOP RFID COMMUNICATION
  // ===================================================

  rfid.PICC_HaltA();

  rfid.PCD_StopCrypto1();


  delay(1000);
}
