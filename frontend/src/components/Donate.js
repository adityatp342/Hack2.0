import React, { useState, useContext, useEffect } from "react";
import "../css/Donate.css";
import { Link, json, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "./Navbar";
import Hnavbar from "./Hnavbar";
import AOS from "aos";
import "aos/dist/aos.css";
import { API_BASE_URL } from "../config";
import geocode from "./googleGeocode";
import * as Yup from "yup";
import Modal from "react-modal";
// import { CLOUD_NAME, API_KEY, API_SECRET } from '../keys'
import { Cloudinary } from "@cloudinary/url-gen";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import {CLOUD_NAME, UPLOAD_PRESET} from '../keys'

export default function Donate() {
  const [medicineForms, setMedicineForms] = useState([]);
  const [medicine_name, setMedicineName] = useState("");
  const [quantity, setQuantity] = useState(null);
  const [expiry_date, setExpiryDate] = useState(new Date());
  const [location, setLocation] = useState("");
  const [count, setCount] = useState(1);
  const [formMover, setFormMover] = useState(count); // Keeps track of currect form.
  const [sug, showsug] = useState(!false);
  const [coordinates, setCoordinates] = useState(null);
  const [medicineList, setMedicineList] = useState([]);
  const [image_url, setImage_url] = useState()

  const handleAddForm = async () => {
    try {
      const validation = await validationSchema.validate(
        {
          medicine_name: medicine_name,
          expiry_date: expiry_date,
          quantity: quantity,
          location: location,
        },
        { abortEarly: false }
      );

      if (
        medicine_name !== "" &&
        expiry_date !== "" &&
        quantity !== "" &&
        location !== ""
      ) {
        setMedicineForms((previousForms) => [
          ...previousForms,
          {
            id: count,
            medicine_name: medicine_name,
            quantity: quantity,
            expiry_date: expiry_date,
            location: location,
            
          },
        ]);
        setCount((previousCount) => previousCount + 1);
        setMedicineName("");
        setExpiryDate("");
        setQuantity("");

        notifyB("Medicine added");
      }
    } catch (error) {
      error.inner.forEach((validationError) => {
        notifyA(validationError.message);
      });
    }
  };

  const handLeftForm = () => {
    setFormMover((currentCount) =>
      currentCount === 1 ? count : currentCount - 1
    );
    const leftForm = medicineForms.filter((form) => form.id === formMover);

    if (leftForm.length > 0 && formMover != count) {
      const selectedForm = leftForm[0];
      setMedicineName(selectedForm.medicine_name);
      setExpiryDate(selectedForm.expiry_date);
      setQuantity(selectedForm.quantity);
    } else {
      setMedicineName("");
      setExpiryDate("");
      setQuantity("");
    }
  };
  const handleRightForm = () => {
    setFormMover((currentCount) =>
      currentCount === count ? 1 : currentCount + 1
    );
    const rightForm = medicineForms.filter((form) => form.id === formMover);

    if (rightForm.length > 0 && formMover != count) {
      const selectedForm = rightForm[0];
      setMedicineName(selectedForm.medicine_name);
      setExpiryDate(selectedForm.expiry_date);
      setQuantity(selectedForm.quantity);
    } else {
      setMedicineName("");
      setExpiryDate("");
      setQuantity("");
    }
  };
  const handleShowsug = () => {
    showsug(false);
  };
  const getMedicine = () => {
    fetch(`${API_BASE_URL}/allmedicines`)
      .then((res) => res.json())
      .then((doc) => {
        setMedicineList(doc.map((item) => item.medicine_name));
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    AOS.init({ duration: 800 });
    getMedicine();
  }, []);

  const locationInput = document.getElementById("location");

  const searchBox = new window.google.maps.places.SearchBox(locationInput);

  const handleLocationChange = (e) => {
    setLocation(e.target.value);
  };
  useEffect(() => {
    searchBox.addListener("places_changed", () => {
      const places = searchBox.getPlaces();

      if (places && places.length > 0) {
        const selected = places[0].formatted_address;
        setLocation(selected);
      }
    });
  }, [location]);
  // Toast functions
  const notifyA = (msg) => toast.error(msg);
  const notifyB = (msg) => toast.success(msg);

  const postOrderData = async () => {
    try {
      const validation = await AddBtnValidation.validate(
        {
          count: count,
        },
        { abortEarly: false }
      );
      geocode(location).then((coordinatesRes) => {
        setCoordinates(coordinatesRes);
      });

      fetch(
        `${API_BASE_URL}/user/${JSON.parse(localStorage.getItem("user"))._id}`,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("jwt"),
          },
        }
      )
        .then((res) => res.json())
        .then((result) => {
          const donar = result._id;
          const formsToSubmit = medicineForms;

          const formData = {
            medicines: formsToSubmit.map((form) => ({
              medicine_name: form.medicine_name,
              expiry_date: {
                date: form.expiry_date,
              },
              quantity: form.quantity,
            })),
            no_of_medicines: formsToSubmit.reduce((total, form) => total + Number(form.quantity), 0),
            location: location,
            coordinates: coordinates,
            donar: donar,
            image_url: image_url
          };

          fetch(`${API_BASE_URL}/donate-medicines`, {
            method: "post",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.error) {
                notifyA(data.error);
              } else {
                notifyB(data.msg);
              }
            });
        });
    } catch (error) {
      error.inner.forEach((validationError) => {
        notifyA(validationError.message);
      });
    }
  };

  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [imagePreviewModal, setImagePreviewModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };
  
  const uploadImg = async() => {
    const data = new FormData();
    data.append("file", selectedFile);
    data.append("upload_preset", UPLOAD_PRESET);
    data.append("cloud_name", CLOUD_NAME);
  
    fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "post",
      body: data,
    })
    .then((res) => res.json())
    .then((data) => {
      setImage_url(data.url);
      console.log(data.url);
    })
    .catch((err) => console.log(err));
  };
  
  useEffect(()=>{
    if(selectedFile != null){
      uploadImg()
    }
    
  },[selectedFile])
  //Validate form
  const validationSchema = Yup.object().shape({
    medicine_name: Yup.string()
      .oneOf(medicineList, "Invalid medicine")
      .required("Medicine name is required"),
    expiry_date: Yup.date()
      .min(new Date(), "Expiry date must be in the future")
      .required("Expiry date is required"),
    quantity: Yup.number()
      .min(1, "Quantity can not be less than one")
      .required("Quantity is required"),
    location: Yup.string().required("Location is required"),
  });

  //validate if add button is clicked before donating
  const AddBtnValidation = Yup.object().shape({
    count: Yup.number().min(2, "Click Add before Donate"),
  });
  


  return (
    <div className="donateeapp">
      <div className="bodyy">
        <div className="donatecont">
          <div className="donate_instru">
            <div className="donate_content">
              <h1>Some Important Instructions for Donating</h1>
              {/* <img data-aos="fade-down-right" src="./medicine.png" alt="" /> */}
              <div className="points">
                <p>
                  1.The medicine to be donated should be valid and not expired
                  or fabricated.
                </p>
                <p>2.The medicine name , expiry date should be visible.</p>
              </div>
            </div>
            <img src="./donmed.jpg" data-aos="fade-right" alt="" srcSet="" />
          </div>

          <div className="donate">
            <div data-aos="fade-right" className="donateForm">
              <div className="logo">
                <h1>Donate Medicine</h1>
              </div>
              <div>
                {/* <h4>{(formMover%count)+1}</h4> */}
                {/* list name and datalist id must be same */}

                <input
                  list="medicine"
                  id="medicine_name"
                  name="medicine_name"
                  value={medicine_name}
                  placeholder="Medicine Name"
                  onChange={(e) => {
                    setMedicineName(e.target.value);
                  }}
                />
                <datalist id="medicine">
                  {medicineList.map((item) => (
                    <option>{item}</option>
                  ))}
                </datalist>
              </div>
              <div>
                <input
                  type="date"
                  name="expiry_date"
                  id="expiry_date"
                  placeholder="Expiry Date"
                  value={expiry_date}
                  onChange={(e) => {
                    setExpiryDate(e.target.value);
                  }}
                />
              </div>
              <div>
                <input
                  type="number"
                  name="quantity"
                  id="quantity"
                  placeholder="Quantity"
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                  }}
                />
              </div>
              <div>
                <input
                  type="text"
                  name="location"
                  id="location"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => handleLocationChange(e)}
                />
                
              </div>
              <div className="uploadbut">
                  <div style={{ display: 'flex' ,alignItems: 'center' , justifyContent:'space-between'}}>
                    <label 
                      htmlFor="file-input" 
                      style={{ 
                        display: 'flex', 
                        
                        cursor: 'pointer', 
                        marginLeft: '20px' 
                        }}>
                      <FontAwesomeIcon 
                        icon={faUpload} 
                        style={{ 
                           paddingTop:'20px'
                        
                        }} 
                      />
                    </label>
                    <input
                      id="file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                    {selectedFile ? (
                      <>
                          <FontAwesomeIcon icon={faEye} 
                            style={{ 
                              paddingTop:'20px',
                              marginRight: '20px',
                              display: 'flex', 
                              alignItems: 'right', 
                              cursor: 'pointer', 
                               
                            }}
                          onClick={() => setImagePreviewModal(true)}
                          />
                          
          
                        <Modal
                    // className="Model__Container"
                          isOpen={imagePreviewModal}
                          onRequestClose={() => { setImagePreviewModal(false) }}
                          style={{
                            content: {
                              width: '50%',
                              height: '50%', 
                              margin: 'auto', 
                            }
                          }}
                        >
                          <img 
                            src={URL.createObjectURL(selectedFile)}
                            alt="Selected"
                            style={{
                              maxWidth: '100%',
                              maxHeight: '100%',
                        
                            }}
                          />
                          <button 
                            className="button-53"
                           onClick={() => { setImagePreviewModal(false) }}
                          >
                            Close
                          </button>
                        </Modal>
                      </>

                    ) : (
                      <p style={{ marginRight: 'auto', marginLeft: 'auto' }}>No image selected</p>
                    )}
                  </div>
                </div>
              <div className="leftrightfunc">
                <button
                  onClick={() => {
                    handLeftForm();
                  }}
                >
                  {" "}
                  &lt;{" "}
                </button>
                <button
                  id="asdscae"
                  onClick={() => {
                    handleAddForm();
                  }}
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => {
                    handleRightForm();
                  }}
                >
                  &gt;{" "}
                </button>
              </div>
              <button
                className="button-53"
                onClick={() => {
                  postOrderData();
                }}
                value="Donate"
                type="submit"
                role="button"
              >
                Donate
              </button>
            </div>
            <div className={`suggestions ${sug && "active"}`}>
              <ul>
                <li style={{ color: "black" }}>
                  <h2>Suggestions</h2>
                </li>
                {searchResult.map((item) => {
                  return (
                    <li className="link">
                      <h3 style={{ color: "black" }}>
                        {item.medicine_name + ": " + "-"}
                      </h3>

                      <h3 className="p2" style={{ color: "black" }}>
                        {item.disease}
                      </h3>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* <div data-aos="zoom-in" className="donateback">
              <h1>"No one has ever become poor from giving"</h1>
              <p>-Anne Frank</p>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}