'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Loader from '@/components/Loader'; // Assuming you have a Loader component

export default function Page() {
  const { id } = useParams();
  const [bikeDetails, setBikeDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null); // 'success', 'error', or a message string

  useEffect(() => {
    if (!id) return;

    const fetchBikeDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/bike/resale-bikes/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch bike details. Status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched bike details:', data.bike);
        setBikeDetails(data.bike);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBikeDetails();
  }, [id]);

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setSendingEmail(true);
    setEmailStatus(null);

    const accessToken = localStorage.getItem('accessToken');
    const userDetailsString = localStorage.getItem('userDetails');

    if (!accessToken || !userDetailsString) {
      setEmailStatus('You must be logged in to send a message.');
      setSendingEmail(false);
      return;
    }

    const userDetails = JSON.parse(userDetailsString);

    try {
      const payload = {
        bike_name: bikeDetails.bike_name,
        bikeImage: bikeDetails.bikeImage?.[0],
        listedBy: bikeDetails.listedBy,
        message: message.trim(),
        userDetails: userDetails,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to send message.');

      setEmailStatus('success');
      setMessage('');
    } catch (err) {
      setEmailStatus(err.message || 'An unexpected error occurred.');
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center p-8 bg-white rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold text-red-600">Error Loading Bike Details</h2>
          <p className="text-gray-700 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!bikeDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center p-8 bg-white rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800">Bike Not Found</h2>
          <p className="text-gray-600 mt-2">The bike you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  const bikeInfo = {
    Brand: bikeDetails.brand,
    Model: bikeDetails.model,
    'Year of Purchase': bikeDetails.year_of_purchase,
    CC: bikeDetails.cc,
    'KMs Driven': bikeDetails.kms_driven?.toLocaleString(),
    'Owner Type': bikeDetails.owner,
    Servicing: bikeDetails.servicing,
    'Engine Condition': bikeDetails.engine_condition,
    'Physical Condition': bikeDetails.physical_condition,
    'Tyre Condition': bikeDetails.tyre_condition,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left Column: Images */}
          <div className="lg:col-span-3 lg:sticky top-24 h-fit">
            <div className="bg-white rounded-2xl shadow-xl p-4">
              {bikeDetails.bikeImage && bikeDetails.bikeImage.length > 0 ? (
                <img
                  src={bikeDetails.bikeImage[0]}
                  alt={bikeDetails.bike_name}
                  className="w-full h-auto object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 flex items-center justify-center text-gray-500 rounded-xl">
                  No Image Available
                </div>
              )}
            </div>

            {bikeDetails.billBookImage && bikeDetails.billBookImage.length > 0 && (
              <div className="mt-8 bg-white rounded-2xl shadow-xl p-4">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Bill Book Image</h3>
                <img
                  src={bikeDetails.billBookImage[0]}
                  alt="Bill Book"
                  className="w-full h-auto object-cover rounded-xl"
                />
              </div>
            )}

          </div>

          {/* Right Column: Details & Contact */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{bikeDetails.bike_name}</h1>
              <p className="text-3xl font-bold text-green-600 mb-6">Rs. {bikeDetails.price?.toLocaleString()}</p>

              <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-base text-gray-700 mb-6">
                {Object.entries(bikeInfo).map(([key, value]) => (
                  <div key={key}>
                    <span className="font-semibold text-gray-900">{key}:</span>
                    <span className="ml-2">{value || 'N/A'}</span>
                  </div>
                ))}
              </div>

              {bikeDetails.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Description:</h3>
                  <p className="text-gray-700 mt-1">{bikeDetails.description}</p>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Listed By</h3>
                <p className="text-gray-700">
                  <span className="font-medium">Name:</span> {bikeDetails.listedBy.fullName}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Address:</span> {bikeDetails.listedBy.address}
                </p>
              </div>
            </div>

            <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Contact Seller</h3>
              <form onSubmit={handleSendEmail} className="space-y-4">
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 sr-only">
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 placeholder-gray-500"
                    placeholder="Hi, I am interested in your bike..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  disabled={sendingEmail}
                >
                  {sendingEmail && (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  <span>{sendingEmail ? 'Sending...' : 'Send Message'}</span>
                </button>
                {emailStatus && (
                  <p className={`mt-3 text-center text-sm font-medium ${emailStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {emailStatus === 'success' ? 'Message sent successfully!' : emailStatus}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
