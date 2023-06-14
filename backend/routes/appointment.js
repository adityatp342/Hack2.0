const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const APPOINTMENT = mongoose.model("APPOINTMENT");
const USER = mongoose.model("USER");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { MONGOURI, JWT_SECRET } = require("../config/keys.js");


router.post("/api/book-appointment/:id", async (req, res, next) => {
  try {
    const { doctor, patient, appointment_date, appointment_time } = req.body;

  

    // const user = await USER.findById(req.params.id);
    // const credits = user.credits;

    // if (credits >= 200) {
    //   await USER.updateOne({ _id: req.params.id }, { $inc: { credits: -200 } });


      const data = await APPOINTMENT.create({
        doctor: doctor,
        patient: patient,
        appointment_date: appointment_date,
        appointment_time: appointment_time,
      });

      if (data) {
        return res.json({
          msg: "Appointment placed successfully. The doctor will confirm now...",
        });
      } else {
        return res.json({ msg: "Failed to place the appointment..." });
      }
    // } else {
    //   return res.json({
    //     msg: "Insufficient credits. Please earn your credits to book an appointment...",
    //   });
    // }
  } catch (ex) {
    next(ex);
  }
});

router.get("/api/my-appointments/:id", async (req, res, next) => {
  try {
    const appointments = await APPOINTMENT.find({
      doctor: req.params.id,
    })
      .populate("doctor", "-password")
      .populate("patient", "-password");
    res.json(appointments);
  } catch (error) {
    next(error);
  }
});

router.get("/api/doctor-appointments/:id", async (req, res, next) => {
  try {
    const appointments = await APPOINTMENT.find({
      doctor: req.params.id,
    
    }).populate("doctor", "-password")
    .populate("patient", "-password");

    res.json(appointments);
  } catch (error) {
    next(error);
  }
});

router.get("/api/patient-appointments/:id", async (req, res, next) => {
  try {
    const appointments = await APPOINTMENT.find({
      patient: req.params.id,
    }).populate("doctor", "-password")
    .populate("patient", "-password");

    res.json(appointments);
  } catch (error) {
    next(error);
  }
});

router.put("/api/confirm-appointment/:id", async (req, res, next) => {
  try {
    const appointment = await APPOINTMENT.findById(req.params.id);

    const patient = await USER.findById(appointment.patient);

    if (patient.credits >= 200) {
      
      patient.credits -= 200;
      await patient.save();

      appointment.confirm_status = true;
      appointment.reject_status = false;
      await appointment.save();

      res.json(appointment);
    } else {
      return res.json(
        "Patient has insufficient credits. Please reject the appointment..."
      );
    }
  } catch (error) {
    next(error);
  }
});

router.put("/api/reject-appointment/:id", async (req, res, next) => {
  try {
    const appointment = await APPOINTMENT.findByIdAndUpdate(
      req.params.id,
      { confirm_status: false, reject_status: true },
      { new: true }
    );

    res.json(appointment);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
