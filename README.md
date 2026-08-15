# RFID-Based Smart Attendance System using ESP32

## 📌 About the Project

This project is an RFID-based smart attendance system developed using ESP32.

Students use RFID cards to record their attendance. The ESP32 sends the attendance data through Wi-Fi to Google Sheets using Google Apps Script.

## ✨ Features

- RFID-based student identification
- Automatic IN and OUT time recording
- Minimum 1-hour attendance validation
- Buzzer warning for early exit attempts
- Day-wise attendance tracking
- Automatic attendance calculation
- Google Sheets integration
- Multiple student support

## 🛠️ Components Used

- ESP32 DevKit V1
- RC522 RFID Reader
- RFID Cards/Tags
- Buzzer
- Jumper Wires
- Breadboard

## 💻 Software Used

- Arduino IDE
- ESP32 Board
- MFRC522 Library
- Google Apps Script
- Google Sheets

## ⚙️ Working

1. The student scans the RFID card.
2. The ESP32 identifies the registered student.
3. The first scan records the IN time.
4. The student must complete at least one hour.
5. A scan after one hour records the OUT time and marks the student Present.
6. A scan before one hour activates the buzzer and attendance is not counted.
7. The attendance information is updated automatically in Google Sheets.
8. On the next day, a new attendance record is created.

## 📊 Attendance Data

The system records:

- UID
- Name
- Date
- Day
- In Time
- Out Time
- Total Classes
- Classes Attended
- Attendance %

## 📷 Project Output

The final attendance data is stored in Google Sheets.

See the **Documentation** folder for the circuit diagram, pin details, and project output.

## 📁 Project Structure

```text
RFID_ATTENDENCE_SYSTEM.ino/
│
├── ESP32/
│   └── RFID_Attendance_System.ino
│
├── Google_Apps_Script/
│   └── Code.gs
│
├── Documentation/
│   ├── circuit_diagram.jpeg
│   ├── google_Sheet_attendance_output.jpeg
│   ├── pin_details.png
│   
│
└── README.md
