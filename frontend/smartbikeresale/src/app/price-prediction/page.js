"use client"; // This directive marks the component for client-side rendering in Next.js

import { FaCloudUploadAlt, FaCheckCircle, FaTimesCircle, FaSpinner, FaPlus, FaTrash } from 'react-icons/fa';
import CustomSelect from '@/components/CustomSelect';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BrandInput from '@/components/BrandInput';
import BikeNameInput from '@/components/BikeNameInput';

// This is the main React component for the bike price prediction page.
const PricePrediction = () => {
  // Initialize Next.js router for navigation
  const router = useRouter();

  // State to store form input values for bike details
  const [formData, setFormData] = useState({
    brand: '',
    bike_name: '',
    year_of_purchase: '',
    cc: '',
    kms_driven: '',
    owner: '',
    servicing: '',
    engine_condition: '',
    physical_condition: '',
    tyre_condition: '',
    description: '',
  });

  // State to store the randomly predicted price, now editable by user
  const [predictedPrice, setPredictedPrice] = useState(null);
  // State to control the visibility of action buttons after price prediction
  const [showPredictionActions, setShowPredictionActions] = useState(false);

  const ownerOptions = [
    { value: 'First Owner', label: 'First Owner' },
    { value: 'Second Owner', label: 'Second Owner' },
    { value: 'Third Owner', label: 'Third Owner' },
    { value: 'Fourth Owner Or More', label: 'Fourth Owner Or More' },
  ];

  const servicingOptions = [
    { value: 'regular', label: 'Regular' },
    { value: 'irregular', label: 'Irregular' },
  ];

  const engineConditionOptions = [
    { value: 'open', label: 'Opened' },
    { value: 'seal', label: 'Seal' },
  ];

  const physicalConditionOptions = [
    { value: 'fresh', label: 'Fresh – Looks almost unused, no visible damage' },
    { value: 'like new', label: 'Like New – Minimal use, very minor signs of wear' },
    { value: 'old', label: 'Old – Noticeable wear, minor scratches or faded paint' },
    { value: 'very old', label: 'Very Old – Heavy usage signs, visible damage or rust' },
  ];

  const tyreConditionOptions = [
    { value: 'new', label: 'New – Recently replaced, full tread, no signs of wear' },
    { value: 'good', label: 'Good – Moderate usage, safe tread depth remaining' },
    { value: 'worn', label: 'Worn – Low tread, cracks or signs of replacement needed' },
  ];
  // State to control the visibility of image upload fields
  const [showImageUploads, setShowImageUploads] = useState(false);
  // State to manage loading/processing feedback for API calls
  const [loading, setLoading] = useState(false);


  // States to store File objects for bill book and bike images (can be up to 2 each)
  // Each array will store File objects or null/undefined if a slot is empty/removed.
  const [billBookImages, setBillBookImages] = useState([]);
  const [bikeImages, setBikeImages] = useState([]);
  // State for displaying user feedback messages
  const [message, setMessage] = useState('');

  // useEffect hook to run once on component mount, checking localStorage for saved bike details.
  useEffect(() => {
    // Ensure window object is available (client-side rendering)
    if (typeof window !== 'undefined') {
      const storedBikeDetails = localStorage.getItem('bikeDetails');
      if (storedBikeDetails) {
        try {
          const parsedDetails = JSON.parse(storedBikeDetails);
          // Pre-fill the form with stored data
          setFormData(prev => ({
            ...prev,
            ...parsedDetails,
            // Ensure numeric fields are correctly set as strings for input value
            year_of_purchase: parsedDetails.year_of_purchase ? String(parsedDetails.year_of_purchase) : '',
            cc: parsedDetails.cc ? String(parsedDetails.cc) : '',
            kms_driven: parsedDetails.kms_driven ? String(parsedDetails.kms_driven) : '',
          }));
          // If a price was stored, display it and actions
          if (parsedDetails.price) {
            setPredictedPrice(parsedDetails.price); // Set the editable predicted price
            setShowPredictionActions(true);
          }
          // Note: File objects cannot be stored in localStorage.
          // If the user previously saved image URLs, we can pre-fill those,
          // but for type="file" inputs, the user will need to re-select files.
          // For now, we will clear previously stored URLs if any, as we're switching to file uploads.
          setBillBookImages([]);
          setBikeImages([]);

          // If the bike was on hold, show a message
          if (parsedDetails.hold) {
            setMessage("Your bike details are currently on hold. Please re-select images if you wish to list.");
          }
        } catch (e) {
          console.error("Failed to parse bikeDetails from localStorage", e);
          localStorage.removeItem('bikeDetails'); // Clear corrupted data to prevent issues
        }
      }
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Handles changes to form input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handles changes to the editable predicted price input
  const handlePredictedPriceChange = (e) => {
    const value = e.target.value;
    const newPrice = value === '' ? null : Number(value);
    setPredictedPrice(newPrice);

    // Update local storage with the new predicted price
    if (typeof window !== 'undefined') {
      const storedBikeDetails = JSON.parse(localStorage.getItem('bikeDetails') || '{}');
      localStorage.setItem('bikeDetails', JSON.stringify({ ...storedBikeDetails, price: newPrice }));
    }
  };

  // Generic handler for adding a new file input slot (up to 2)
  const handleAddFileInput = (setter, currentImages) => {
    if (currentImages.length < 2) {
      setter(prev => [...prev, null]); // Add a null placeholder for a new file input slot
    }
  };

  // Generic handler for removing a file input slot
  const handleRemoveFileInput = (setter, index) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  // Generic handler for file input changes
  const handleFileChange = (setter, index, e) => {
    const files = e.target.files;
    setter(prev => {
      const newFiles = [...prev];
      if (files.length > 0) {
        newFiles[index] = files[0]; // Store the File object
      } else {
        newFiles[index] = null; // Clear the slot if selection is cancelled
      }
      return newFiles;
    });
  };

  // Handles the "Predict Price" button click
  const handlePredictPrice = () => {
    if (!predictedPrice) {
      console.log("inside");
      const year = parseInt(formData.year_of_purchase);
      const cc = parseInt(formData.cc);
      const kms = parseInt(formData.kms_driven);

      if (isNaN(year) || isNaN(cc) || isNaN(kms)) {
        console.error("Please fill out all numeric fields correctly.");
        return;
      }

      const bikeData = {
        brand: formData.brand,
        bike_name: formData.bike_name,
        year_of_purchase: year,
        cc: cc,
        kms_driven: kms,
        owner: formData.owner,
        servicing: formData.servicing,
        engine_condition: formData.engine_condition,
        physical_condition: formData.physical_condition,
        tyre_condition: formData.tyre_condition
      };

      fetch('https://smartbike-resale-fastapi.onrender.com/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bikeData)
      })
        .then(response => response.json())
        .then(data => {
          if (data.predicted_price) {
            const bikeDetailsToStore = {
              ...formData,
              price: data.predicted_price
            };

            if (typeof window !== 'undefined') {


              localStorage.setItem('bikeDetails', JSON.stringify(bikeDetailsToStore));
              setPredictedPrice(parseInt(data.predicted_price));
              setShowPredictionActions(true);


            }

            console.log("Price predicted and stored:", data.predicted_price);
          } else {
            console.error("Prediction Error:", data);
          }
        })
        .catch(error => {
          console.error("Fetch Error:", error);
        });
    }
  };

  // Handles the "List the bike in marketplace" action
  const handleListBike = async () => {
    // Ensure this function only runs on the client-side
    if (typeof window === 'undefined') return;

    // Retrieve accessToken and userId from localStorage
    const accessToken = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');

    // Create a FormData object to send the data
    const formDataToSend = new FormData();

    // Append all form data fields, converting numeric ones
    for (const key in formData) {
      if (['year_of_purchase', 'cc', 'kms_driven'].includes(key)) {
        // Convert to Number. If it's an empty string or invalid, it will become NaN.
        // We'll append 0 if it's NaN, assuming 0 is an acceptable default for required numeric fields.
        const numValue = Number(formData[key]);
        formDataToSend.append(key, isNaN(numValue) ? 0 : numValue);
      } else {
        formDataToSend.append(key, formData[key]);
      }
    }

    // Append predicted price from the editable state
    if (predictedPrice !== null && !isNaN(predictedPrice)) {
      formDataToSend.append('price', predictedPrice);
    } else {
      // Handle case where predictedPrice is null or NaN (e.g., if user clears it)
      // You might want to add a validation error here or send a default.
      setMessage('Please enter a valid predicted price before listing.');
      return;
    }

    // Append bill book images (only actual File objects, filter out nulls)
    billBookImages.filter(Boolean).forEach((file) => {
      formDataToSend.append(`billBookImage`, file); // Backend should handle multiple files for same field name
    });

    // Append bike images (only actual File objects, filter out nulls)
    bikeImages.filter(Boolean).forEach((file) => {
      formDataToSend.append(`bikeImage`, file); // Backend should handle multiple files for same field name
    });

    // If access token or user ID is missing, redirect to login page
    if (!accessToken || !userId) {
      // Store all current details (excluding files) before redirecting
      // Files cannot be directly stored, so the user will need to re-select them after login.
      const bikeDataForStorage = {
        ...formData,
        price: predictedPrice,
      };
      localStorage.setItem('bikeDetails', JSON.stringify(bikeDataForStorage));
      return;
    }

    // If image upload fields are already visible, proceed with the API call
    if (showImageUploads) {
      // Check if at least one image is uploaded for listing
      if (billBookImages.filter(Boolean).length === 0 && bikeImages.filter(Boolean).length === 0) {
        setMessage('Please upload at least one image (bill book or bike) to list your bike.');
        return;
      }

      setLoading(true); // Set loading to true when starting the API call
      setMessage('Processing... Listing your bike.'); // Show processing message
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/bike/list-bike`, {
          method: 'POST',
          // When sending FormData, DO NOT set 'Content-Type' header.
          // The browser will automatically set it to 'multipart/form-data'
          // and include the correct boundary.
          headers: {
            'Authorization': `Bearer ${accessToken}`, // Include access token for authorization
          },
          body: formDataToSend, // Send FormData object directly
        });

        if (response.ok) {
          setMessage('Bike listed successfully!');
          localStorage.removeItem('bikeDetails'); // Clear bike details from localStorage after successful listing
          // Reset UI states and form fields
          setPredictedPrice(null);
          setShowPredictionActions(false);
          setShowImageUploads(false);
          setFormData({
            brand: '', bike_name: '', year_of_purchase: '', cc: '', kms_driven: '',
            owner: 'First', servicing: 'up to date', engine_condition: 'Excellent',
            physical_condition: 'Good', tyre_condition: 'Fair', description: '',
          });
          setBillBookImages([]); // Clear image files
          setBikeImages([]); // Clear image files
        } else {
          const errorData = await response.json(); // Assuming error responses are still JSON
          setMessage(`Failed to list bike: ${errorData.message || response.statusText}`);
          console.error('Failed to list bike:', errorData);
        }
      } catch (error) {
        setMessage('An error occurred while listing the bike. Please check your network.');
        console.error('Error listing bike:', error);
      } finally {
        setLoading(false); // Always set loading to false after the API call
      }
    } else {
      // First click on "List the bike": show image upload fields
      setShowImageUploads(true);
      setMessage('Please upload bill book and bike images to proceed with listing.');
    }
  };

  // Handles the "Don't want to list" action
  const handleDontList = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bikeDetails'); // Remove bike details from localStorage
    }
    setMessage('Bike details cleared. You chose not to list.');
    // Reset UI states and form fields
    setPredictedPrice(null);
    setShowPredictionActions(false);
    setShowImageUploads(false);
    setFormData({
      brand: '', bike_name: '', year_of_purchase: '', cc: '', kms_driven: '',
      owner: 'First', servicing: 'up to date', engine_condition: 'Excellent',
      physical_condition: 'Good', tyre_condition: 'Fair', description: '',
    });
    setBillBookImages([]);
    setBikeImages([]);
  };

  // Handles the "Hold it" action
  const handleHold = () => {
    if (typeof window !== 'undefined') {
      const currentBikeDetails = JSON.parse(localStorage.getItem('bikeDetails') || '{}');
      // Add a 'hold: true' flag to the stored bike details.
      // Note: File objects cannot be stored in localStorage.
      // If the user selects 'Hold', they will need to re-select images when they return.
      localStorage.setItem('bikeDetails', JSON.stringify({
        ...currentBikeDetails,
        ...formData, // Ensure latest form data is saved
        price: predictedPrice, // Ensure latest predicted price is saved
        hold: true
      }));
    }
    setMessage('Bike details are now on hold. You can come back later to list it. Please note: image files are not saved with "hold" action and will need to be re-selected.');
    // Hide prediction actions and image uploads
    setShowPredictionActions(false);
    setShowImageUploads(false);
    // Clear selected files from state to avoid confusion when on hold
    setBillBookImages([]);
    setBikeImages([]);
  };

  return (
    <div className="container mx-auto px-4 py-8 font-inter">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800">Get an Instant Price Estimate for Your Bike</h1>
          <p className="mt-2 text-lg text-gray-600">Fill in your bike's details below to get a real-time price prediction. You can then choose to list it on our marketplace.</p>
        </div>

        {/* Message display area */}
        {message && (
          <div className={`p-4 mb-6 rounded-lg text-base ${message.includes('success') ? 'bg-green-100 text-green-800' :
            message.includes('hold') ? 'bg-yellow-100 text-yellow-800' :
              message.includes('Failed') || message.includes('Error') || message.includes('valid predicted price') ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
            } border ${message.includes('success') ? 'border-green-300' :
              message.includes('hold') ? 'border-yellow-300' :
                message.includes('Failed') || message.includes('Error') || message.includes('valid predicted price') ? 'border-red-300' :
                  'border-blue-300'
            }`}>
            {message}
          </div>
        )}

        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
          {/* Bike Details Input Form */}
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Brand */}
            <div className="w-full">
              <BrandInput bikeData={formData} setBikeData={setFormData} />
            </div>

            {/* Bike Name */}
            <div className="w-full">
              <BikeNameInput bikeData={formData} setBikeData={setFormData} />
            </div>

            {/* Year of Purchase */}
            <div>
              <label htmlFor="year_of_purchase" className="block text-sm font-medium text-gray-700 mb-1">Year of Purchase</label>
              <input type="number" name="year_of_purchase" id="year_of_purchase" value={formData.year_of_purchase} onChange={handleChange} placeholder="e.g., 2020" className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder:text-gray-200 text-gray-500" />
            </div>

            {/* CC */}
            <div>
              <label htmlFor="cc" className="block text-sm font-medium text-gray-700 mb-1">Engine CC</label>
              <input type="number" name="cc" id="cc" value={formData.cc} onChange={handleChange} placeholder="e.g., 250" className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder:text-gray-200 text-gray-500" />
            </div>

            {/* KMs Driven */}
            <div>
              <label htmlFor="kms_driven" className="block text-sm font-medium text-gray-700 mb-1">KMs Driven</label>
              <input type="number" name="kms_driven" id="kms_driven" value={formData.kms_driven} onChange={handleChange} placeholder="e.g., 15000" className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder:text-gray-200 text-gray-500" />
            </div>

            {/* Owner */}
            <div>
              <label htmlFor="owner" className="block text-sm font-medium text-gray-700 mb-1">Ownership</label>
              <CustomSelect 
                options={ownerOptions} 
                value={formData.owner} 
                onChange={(value) => handleSelectChange('owner', value)} 
                placeholder="Select Owner Type" 
              />
            </div>

            {/* Servicing */}
            <div>
              <label htmlFor="servicing" className="block text-sm font-medium text-gray-700 mb-1">Servicing</label>
              <CustomSelect 
                options={servicingOptions} 
                value={formData.servicing} 
                onChange={(value) => handleSelectChange('servicing', value)} 
                placeholder="Select Servicing Status" 
              />
            </div>

            {/* Engine Condition */}
            <div>
              <label htmlFor="engine_condition" className="block text-sm font-medium text-gray-700 mb-1">Engine Condition</label>
              <CustomSelect 
                options={engineConditionOptions} 
                value={formData.engine_condition} 
                onChange={(value) => handleSelectChange('engine_condition', value)} 
                placeholder="Select Condition" 
              />
            </div>

            {/* Physical Condition */}
            <div>
              <label htmlFor="physical_condition" className="block text-sm font-medium text-gray-700">
                Physical Condition
                <span className="block text-xs font-normal text-gray-500">
                  Choose based on body scratches, appearance, and overall condition.
                </span>
              </label>
              <CustomSelect 
                options={physicalConditionOptions} 
                value={formData.physical_condition} 
                onChange={(value) => handleSelectChange('physical_condition', value)} 
                placeholder="Select Condition" 
              />
            </div>

            {/* Tyre Condition */}
            <div>
              <label htmlFor="tyre_condition" className="block text-sm font-medium text-gray-700">
                Tyre Condition
                <span className="block text-xs font-normal text-gray-500">
                  Choose based on tread depth and usage.
                </span>
              </label>
              <CustomSelect 
                options={tyreConditionOptions} 
                value={formData.tyre_condition} 
                onChange={(value) => handleSelectChange('tyre_condition', value)} 
                placeholder="Select Condition" 
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows="4" placeholder="e.g., Well-maintained bike with regular servicing. Minor scratches on the side." className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder:text-gray-200 text-gray-500"></textarea>
            </div>
          </form>

          {/* Predict Price Button */}
          {!showPredictionActions && (
            <div className="mt-8 text-center">
              <button onClick={handlePredictPrice} disabled={loading} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-150 ease-in-out disabled:opacity-50 disabled:scale-100">
                {loading ? 'Predicting...' : 'Predict Price'}
              </button>
            </div>
          )}
        </div>

        {/* Prediction Result and Actions */}
        {showPredictionActions && (
          <div className="mt-8 p-6 bg-gray-50 rounded-2xl shadow-xl border border-gray-200 text-center">
            <h2 className="text-2xl font-bold text-gray-800">We've Got a Price for You!</h2>
            <p className="text-gray-600 mb-4">You can adjust the price before listing.</p>
            <div className="my-4">
              <input type="number" value={predictedPrice || ''} onChange={handlePredictedPriceChange} className="text-4xl font-bold text-blue-600 bg-white p-3 rounded-lg border-2 border-gray-300 text-center w-full max-w-sm mx-auto shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
            </div>

            {/* Image Upload Section */}
            {showImageUploads && (
              <div className="mt-6 text-left max-w-xl mx-auto">
                <div className="mb-6 p-4 border-l-4 border-blue-500 bg-blue-50">
                  <h3 className="font-bold text-gray-800">Upload Images</h3>
                  <p className="text-sm text-gray-600">Clear photos increase your chances of a quick sale. Upload up to 2 images for the bill book and 2 for the bike.</p>
                </div>
                {/* Bill Book Images */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Bill Book Images (up to 2)</h4>
                  {billBookImages.map((file, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <input type="file" onChange={(e) => handleFileChange(setBillBookImages, index, e)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition" />
                      {billBookImages.length > 1 && <button onClick={() => handleRemoveFileInput(setBillBookImages, index)} className="ml-2 text-red-500 hover:text-red-700 font-semibold">Remove</button>}
                    </div>
                  ))}
                  {billBookImages.length < 2 && <button onClick={() => handleAddFileInput(setBillBookImages, billBookImages)} className="text-sm text-blue-600 hover:underline font-medium">+ Add Image</button>}
                </div>

                {/* Bike Images */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Bike Images (up to 2)</h4>
                  {bikeImages.map((file, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <input type="file" onChange={(e) => handleFileChange(setBikeImages, index, e)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 transition" />
                      {bikeImages.length > 1 && <button onClick={() => handleRemoveFileInput(setBikeImages, index)} className="ml-2 text-red-500 hover:text-red-700 font-semibold">Remove</button>}
                    </div>
                  ))}
                  {bikeImages.length < 2 && <button onClick={() => handleAddFileInput(setBikeImages, bikeImages)} className="text-sm text-blue-600 hover:underline font-medium">+ Add Image</button>}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col md:flex-row justify-center items-center gap-4">
              <button onClick={handleListBike} disabled={loading} className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-150 ease-in-out disabled:opacity-50 disabled:scale-100">
                {loading ? 'Listing...' : (showImageUploads ? 'Confirm & List Bike' : 'List This Bike')}
              </button>
              <button onClick={handleHold} disabled={loading} className="w-full md:w-auto bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-150 ease-in-out disabled:opacity-50 disabled:scale-100">
                Hold for Later
              </button>
              <button onClick={handleDontList} disabled={loading} className="w-full md:w-auto bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-150 ease-in-out disabled:opacity-50 disabled:scale-100">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PricePrediction;

