'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaFilter, FaTimes } from 'react-icons/fa';
import FilterSection from '@/components/FilterSection';


export default function Page() {
  const router = useRouter();

  // Filter form states
  const [filters, setFilters] = useState({
    brand: '',
    bike_name: '',
    year_of_purchase_min: '',
    year_of_purchase_max: '',
    cc_min: '',
    cc_max: '',
    kms_driven_min: '',
    kms_driven_max: '',
    owner: '',
    servicing: '',
    engine_condition: '',
    physical_condition: '',
    tyre_condition: '',
    price_min: '',
    price_max: '',
  });
  const [filteredBikes, setFilteredBikes] = useState([]); // State to store filtered bikes to display
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);
  const [filterMessage, setFilterMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const [totalPages, setTotalPages] = useState(1); // Total pages from API response
  const [isFilteredMode, setIsFilteredMode] = useState(false); // True if filters are active, false for general listings
  const [showFilters, setShowFilters] = useState(false); // State for filter visibility

  // Effect to fetch initial bikes
  useEffect(() => {
    fetchBikes(1, false);
  }, []);

  // Effect to log changes in filteredBikes array
  useEffect(() => {
    if (filteredBikes.length > 0) {
      console.log('Filtered/Displayed Bikes Array Updated:', filteredBikes);
    }
  }, [filteredBikes]);

  useEffect(() => {
    // This ensures code runs only on the client
    if (typeof window !== "undefined") {
      const storedData = localStorage.getItem("bikeDetails");

      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);

          // Check if `hold` is true
          if (!parsedData.hold) {
            router.push("/price-prediction");
          }

        } catch (error) {
          console.error("Invalid JSON in localStorage for bikeDetails", error);
        }
      }
    }
  }, [router]);

  // Reusable function to fetch bikes from the API
  const fetchBikes = async (page, useFilters = false, currentFilters = filters) => {
    setFilterMessage('');
    setIsLoadingFilters(true);
    let apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/bike/resale-bikes?page=${page}&limit=10`;
    let payload = {};

    if (useFilters) {
      apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/bike/resale-bikes/filters?page=${page}&limit=10`;
      payload = {
        brand: currentFilters.brand || undefined,
        bike_name: currentFilters.bike_name || undefined,
        year_of_purchase: {
          min: currentFilters.year_of_purchase_min || undefined,
          max: currentFilters.year_of_purchase_max || undefined,
        },
        cc: {
          min: currentFilters.cc_min || undefined,
          max: currentFilters.cc_max || undefined,
        },
        kms_driven: {
          min: currentFilters.kms_driven_min || undefined,
          max: currentFilters.kms_driven_max || undefined,
        },
        owner: currentFilters.owner || undefined,
        servicing: currentFilters.servicing || undefined,
        engine_condition: currentFilters.engine_condition || undefined,
        physical_condition: currentFilters.physical_condition || undefined,
        tyre_condition: currentFilters.tyre_condition || undefined,
        price: {
          min: currentFilters.price_min || undefined,
          max: currentFilters.price_max || undefined,
        },
      };
    }

    try {
      const response = await fetch(apiUrl, {
        method: useFilters ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: useFilters ? JSON.stringify(payload) : null,
      });

      if (!response.ok) {
        // If the response is not ok, throw an error to be caught by the catch block.
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setFilteredBikes(data.bikes || []);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage || 1);

      if (useFilters) {
        if (data.totalBikes > 0) {
          setFilterMessage(`Found ${data.totalBikes} bikes.`);
          setShowFilters(false); // Hide filters on successful search
        } else {
          setFilterMessage('No bikes found matching your criteria.');
          setShowFilters(true); // Open filters when no bikes are found
        }
      }

    } catch (error) {
      console.error("Failed to fetch bikes:", error);
      if (useFilters) {
        // If any error occurs during filtering, just show the 'no bikes found' message.
        setFilteredBikes([]);
        setTotalPages(0);
        setCurrentPage(1);
        setShowFilters(true); // Open filters on error during filtering
      } else {
        // Only show a hard error on initial load.
        setFilterMessage('Failed to load bikes. Please try again.');
        setFilteredBikes([]);
      }
    } finally {
      setIsLoadingFilters(false);
    }
  };

  // Handler for filter form submission
  const handleFilterSubmit = async (e) => {
    e.preventDefault();

    // Check if any filter has a meaningful value
    const isAnyFilterSet = Object.values(filters).some(value => value && value.toString().trim() !== '');

    if (isAnyFilterSet) {
      // If filters are set, apply them
      setCurrentPage(1);
      setIsFilteredMode(true);
      fetchBikes(1, true, filters);
    } else {
      // If no filters are set, treat as a clear filter action
      handleClearFilters();
    }

  };

  // Handler to clear filters
  const handleClearFilters = () => {
    setFilters({
      brand: '', bike_name: '', year_of_purchase_min: '', year_of_purchase_max: '',
      cc_min: '', cc_max: '', kms_driven_min: '', kms_driven_max: '', owner: '',
      servicing: '', engine_condition: '', physical_condition: '', tyre_condition: '',
      price_min: '', price_max: '',
    });
    setCurrentPage(1);
    setIsFilteredMode(false);
    setFilterMessage('');
    fetchBikes(1, false);
  };

  // Handler for pagination page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchBikes(newPage, isFilteredMode, filters);
    }
  };

  return (
    <main className="container mx-auto px-4 py-2">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Explore</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow hover:bg-gray-100 flex items-center"
        >
          {showFilters ? <FaTimes className="h-5 w-5 mr-2" /> : <FaFilter className="h-5 w-5 mr-2" />}
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>
      {showFilters && (
        <div className="mb-8">
          <FilterSection
            filters={filters}
            setFilters={setFilters}
            applyFilters={handleFilterSubmit} // Corrected prop name
            clearFilters={handleClearFilters} // Corrected prop name
          />
        </div>
      )}
      <div className="mt-2">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">

            {filterMessage && (
              <span className={`text-sm font-medium ${filteredBikes.length > 0 ? 'text-green-700' : 'text-red-600'}`}>
                ({filterMessage})
              </span>
            )}
          </div>
        </div>

        {isLoadingFilters && filteredBikes.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
            <p className="ml-3 text-lg text-gray-700">Loading bikes...</p>
          </div>
        )}

        {!isLoadingFilters && filteredBikes.length === 0 && (
          <p className="text-center text-gray-600 py-8">No bikes available matching the criteria.</p>
        )}

        {filteredBikes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredBikes.map((bike) => (
              <a href={`/bike/${bike._id}`} key={bike._id} className="block">
                <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
                  <div className="relative h-56">
                    <img
                      src={bike.bikeImage && bike.bikeImage.length > 0 ? bike.bikeImage[0] : `https://placehold.co/400x200/cccccc/333333?text=No+Image`}
                      alt={`${bike.brand} ${bike.bike_name}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://placehold.co/400x200/cccccc/333333?text=No+Image`;
                      }}
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-gray-900 truncate">{bike.brand} - {bike.bike_name}</h3>
                    <p className="text-lg text-purple-700 font-semibold mb-2">Nrs. {bike.price?.toLocaleString() || 'N/A'}</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600 mt-4">
                      <p><span className="font-medium">Year:</span> {bike.year_of_purchase || 'N/A'}</p>
                      <p><span className="font-medium">CC:</span> {bike.cc || 'N/A'}</p>
                      <p><span className="font-medium">Kms Driven:</span> {bike.kms_driven?.toLocaleString() || 'N/A'}</p>
                      <p><span className="font-medium">Owner:</span> {bike.owner || 'N/A'}</p>
                      <p><span className="font-medium">Engine:</span> {bike.engine_condition || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoadingFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                disabled={currentPage === page || isLoadingFilters}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${currentPage === page
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoadingFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
