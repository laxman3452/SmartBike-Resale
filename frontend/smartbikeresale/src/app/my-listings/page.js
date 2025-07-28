'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import Loader from '@/components/Loader';

export default function Page() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [bikes, setBikes] = useState([]);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.replace('/auth');
      } else {
        setIsChecking(false);
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (isChecking) {
      return;
    }

    const fetchMyListings = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/bike/show-my-listings`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setBikes(data.bikes);
        } else {
          console.error('Failed to fetch listings:', response.statusText);
          Swal.fire('Error', 'Failed to fetch your bike listings. Please try again.', 'error');
        }
      } catch (error) {
        console.error('Error fetching listings:', error);
        Swal.fire('Error', 'An error occurred while fetching your bike listings.', 'error');
      }
    };

    fetchMyListings();
  }, [isChecking]);

  const handleEdit = (bikeId) => {
    router.push(`/my-listings/edit/${bikeId}`);
  };

  const handleDelete = (bikeId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      customClass: {
        confirmButton: 'bg-red-600 text-white font-semibold rounded-lg px-4 py-2 hover:bg-red-700',
        cancelButton: 'bg-gray-400 text-white font-semibold rounded-lg px-4 py-2 hover:bg-gray-500 ml-2',
      },
      buttonsStyling: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('accessToken');
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/bike/bike-delete`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ bikeId }),
          });

          if (response.ok) {
            setBikes(bikes.filter((bike) => bike._id !== bikeId));
            Swal.fire('Deleted!', 'Your bike listing has been deleted.', 'success');
          } else {
            const errorData = await response.json();
            Swal.fire('Error!', errorData.message || 'Failed to delete the listing.', 'error');
          }
        } catch (error) {
          Swal.fire('Error!', 'An error occurred while deleting the listing.', 'error');
        }
      }
    });
  };

  if (isChecking) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen pt-20">
      <main className="container mx-auto px-6 py-8">
        {bikes.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md text-gray-600">
            <p className="text-lg mb-4">You currently have no bike listings.</p>
          </div>
        ) : (
          <p className="text-xl mb-4 text-center">My bike listings.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            
            {bikes.map((bike) => (
              <div
                key={bike._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105 flex flex-col"
              >
                {bike.bikeImage && bike.bikeImage.length > 0 ? (
                  <img
                    src={bike.bikeImage[0]}
                    alt={bike.bike_name}
                    className="w-full h-48 object-cover rounded-t-xl"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500 rounded-t-xl">
                    <span className="text-lg">No Image Available</span>
                  </div>
                )}
                <div className="p-5 flex flex-col flex-grow">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 truncate">
                    {bike.bike_name}
                  </h2>
                  <p className="text-gray-800 text-xl font-semibold mb-2">
                    <span className="font-medium text-gray-600">Price:</span> Nrs. {bike.price?.toLocaleString() || 'N/A'}
                  </p>
                  <p className="text-gray-700 text-sm mb-2">
                    <span className="font-medium text-gray-600">Brand:</span> {bike.brand || 'N/A'}
                  </p>
                  <p className="text-gray-700 text-sm mb-4 line-clamp-3 flex-grow">
                    <span className="font-medium text-gray-600">Details:</span>
                    {` Year: ${bike.year_of_purchase || 'N/A'}, CC: ${bike.cc || 'N/A'}, Kms: ${bike.kms_driven?.toLocaleString() || 'N/A'}, Owner: ${bike.owner || 'N/A'}, Servicing: ${bike.servicing || 'N/A'}, Engine: ${bike.engine_condition || 'N/A'}, Physical: ${bike.physical_condition || 'N/A'}, Tyre: ${bike.tyre_condition || 'N/A'}`}
                  </p>
                  <div className="flex justify-end space-x-3 mt-auto pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleEdit(bike._id)}
                      className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 shadow-md"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(bike._id)}
                      className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-all duration-300 shadow-md"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
