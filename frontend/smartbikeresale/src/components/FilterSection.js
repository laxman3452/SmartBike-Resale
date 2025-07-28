import BrandInput from '@/components/BrandInput';
import BikeNameInput from '@/components/BikeNameInput';
import CustomSelect from '@/components/CustomSelect';

const FilterSection = ({ filters, setFilters, applyFilters, clearFilters }) => {
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
    { value: 'open', label: 'Opened engine' },
    { value: 'seal', label: 'Seal engine' },
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


  const handleSelectChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Filters</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Brand */}
        <div className="w-full">
          <BrandInput bikeData={filters} setBikeData={setFilters} />
        </div>

        {/* Bike Name */}
        <div className="w-full">
          <BikeNameInput bikeData={filters} setBikeData={setFilters} />
        </div>

        {/* Year of Purchase */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="year_of_purchase_min" className="block mb-2 text-sm font-medium text-gray-700">Min Year</label>
            <input type="number" id="year_of_purchase_min" name="year_of_purchase_min" value={filters.year_of_purchase_min} onChange={(e) => setFilters(prev => ({ ...prev, year_of_purchase_min: e.target.value }))} placeholder="e.g., 2015" className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="year_of_purchase_max" className="block mb-2 text-sm font-medium text-gray-700">Max Year</label>
            <input type="number" id="year_of_purchase_max" name="year_of_purchase_max" value={filters.year_of_purchase_max} onChange={(e) => setFilters(prev => ({ ...prev, year_of_purchase_max: e.target.value }))} placeholder="e.g., 2022" className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>

        {/* CC */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="cc_min" className="block mb-2 text-sm font-medium text-gray-700">Min CC</label>
            <input type="number" id="cc_min" name="cc_min" value={filters.cc_min} onChange={(e) => setFilters(prev => ({ ...prev, cc_min: e.target.value }))} placeholder="e.g., 150" className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="cc_max" className="block mb-2 text-sm font-medium text-gray-700">Max CC</label>
            <input type="number" id="cc_max" name="cc_max" value={filters.cc_max} onChange={(e) => setFilters(prev => ({ ...prev, cc_max: e.target.value }))} placeholder="e.g., 350" className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>

        {/* KMS Driven */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="kms_driven_min" className="block mb-2 text-sm font-medium text-gray-700">Min Kms</label>
            <input type="number" id="kms_driven_min" name="kms_driven_min" value={filters.kms_driven_min} onChange={(e) => setFilters(prev => ({ ...prev, kms_driven_min: e.target.value }))} placeholder="e.g., 1000" className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="kms_driven_max" className="block mb-2 text-sm font-medium text-gray-700">Max Kms</label>
            <input type="number" id="kms_driven_max" name="kms_driven_max" value={filters.kms_driven_max} onChange={(e) => setFilters(prev => ({ ...prev, kms_driven_max: e.target.value }))} placeholder="e.g., 30000" className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>

        {/* Price */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="price_min" className="block mb-2 text-sm font-medium text-gray-700">Min Price</label>
            <input type="number" id="price_min" name="price_min" value={filters.price_min} onChange={(e) => setFilters(prev => ({ ...prev, price_min: e.target.value }))} placeholder="e.g., 100k" className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="price_max" className="block mb-2 text-sm font-medium text-gray-700">Max Price</label>
            <input type="number" id="price_max" name="price_max" value={filters.price_max} onChange={(e) => setFilters(prev => ({ ...prev, price_max: e.target.value }))} placeholder="e.g., 400k" className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>

        {/* Owner */}
        <div>
          <label htmlFor="owner" className="block mb-2 text-sm font-medium text-gray-700">Owner</label>
          <CustomSelect options={ownerOptions} value={filters.owner} onChange={(value) => handleSelectChange('owner', value)} placeholder="Select Owner" />
        </div>

        {/* Servicing */}
        <div>
          <label htmlFor="servicing" className="block mb-2 text-sm font-medium text-gray-700">Servicing</label>
          <CustomSelect options={servicingOptions} value={filters.servicing} onChange={(value) => handleSelectChange('servicing', value)} placeholder="Select Servicing" />
        </div>

        {/* Engine Condition */}
        <div>
          <label htmlFor="engine_condition" className="block mb-2 text-sm font-medium text-gray-700">Engine Condition</label>
          <CustomSelect options={engineConditionOptions} value={filters.engine_condition} onChange={(value) => handleSelectChange('engine_condition', value)} placeholder="Select Condition" />
        </div>

        {/* Physical Condition */}
        <div>
          <label htmlFor="physical_condition" className="block mb-2 text-sm font-medium text-gray-700">Physical Condition</label>
          <CustomSelect options={physicalConditionOptions} value={filters.physical_condition} onChange={(value) => handleSelectChange('physical_condition', value)} placeholder="Select Condition" />
        </div>

        {/* Tyre Condition */}
        <div>
          <label htmlFor="tyre_condition" className="block mb-2 text-sm font-medium text-gray-700">Tyre Condition</label>
          <CustomSelect options={tyreConditionOptions} value={filters.tyre_condition} onChange={(value) => handleSelectChange('tyre_condition', value)} placeholder="Select Condition" />
        </div>

      </div>
      <div className="flex justify-end items-center mt-8 gap-4">
        <button onClick={clearFilters} className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all duration-200">
          Clear Filters
        </button>
        <button onClick={applyFilters} className="px-8 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-md hover:shadow-lg">
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FilterSection;
