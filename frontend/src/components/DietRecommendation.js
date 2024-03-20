import React, { useState, useEffect } from "react";
import axios from "axios";
import ReportModal from "../Functions/ReportModal";
import "../css/DietRecommendation.css";

function DietRecommendationComponent() {
  const [prediction, setPrediction] = useState({});
  const [disease, setDisease] = useState("");
  const [userID, setUserID] = useState("");
  const [reports, setReports] = useState([]);
  const [reportModal, setReportModal] = useState(false);

  // Static array of selected diseases
  const selectedDiseases = [
    "Malaria",
    "Cholera",
    "Diabetes"
  ];

  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/dietRecommendation",
        { disease }
      );
      setPrediction(response.data); // Assuming the response is an object with recipe and ingredients
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = () => {
    const report_data = {
      user_id: userID,
      report_type: "dietRecommendation",
      result: prediction.recipe, // Access the recipe from the prediction object
      disease,
    };
    // Include logic to save the diet recommendation report
    // handleSaveReport(report_data, userID, setReports, "dietRecommendation");
    setDisease("");
  };

  const handleShowReport = () => {
    setReportModal(true);
  };

  const handleCLoseModal = () => {
    setReportModal(false);
  };

  useEffect(() => {
    // Fetch user data or perform any initialization here
    // fetchUser(setUserID);
  }, []);

  useEffect(() => {
    // Fetch existing diet recommendation reports here
    // fetchReport(userID, setReports, "dietRecommendation");
  }, [userID]);

  return (
    <>
      <div className="dietmain">
        <div className="dietmain">
          <h2>Diet Recommendation</h2>
          <div>
            <button id="traarports" onClick={handleShowReport}>
              Previous Reports
            </button>
            <ReportModal
              reportModal={reportModal}
              handleCLoseModal={handleCLoseModal}
              reports={reports}
            />
          </div>
          <select
            value={disease}
            onChange={(e) => setDisease(e.target.value)}
          >
            <option value="" disabled>
              Select Disease
            </option>
            {selectedDiseases.map((selectedDisease, index) => (
              <option key={index} value={selectedDisease}>
                {selectedDisease}
              </option>
            ))}
          </select>
          <div className="dietimgpred">
            <button onClick={handleSubmit}>Get Recommendation</button>
            {prediction.recipe && (
              <button id="dietimgpred" onClick={handleSave}>
                Save report
              </button>
            )}
          </div>
          {prediction.recipe && (
            <div className="dietresult">
              <h2>Recipe: {prediction.recipe}</h2>
              <h3>Ingredients:</h3>
              <ul>
                {prediction.ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default DietRecommendationComponent;
