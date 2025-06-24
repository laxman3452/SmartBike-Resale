import { useState } from "react";

const brandOptions = [
  "TVS", "Royal Enfield", "Triumph", "Yamaha", "Honda", "Hero", "Bajaj", "Suzuki",
  "Benelli", "KTM", "Mahindra", "Kawasaki", "Ducati", "Hyosung", "Harley-Davidson",
  "Jawa", "BMW", "Indian", "Rajdoot", "LML", "Yezdi", "MV", "Ideal"
];

export default function BrandInput({ bikeData, setBikeData }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleChange = (e) => {
    const input = e.target.value;
    setBikeData((prev) => ({ ...prev, brand: input }));

    if (input.length > 0) {
      const matches = brandOptions.filter((b) =>
        b.toLowerCase().includes(input.toLowerCase())
      );
      setSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelect = (brand) => {
    setBikeData((prev) => ({ ...prev, brand }));
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
        Brand
      </label>
      <input
        type="text"
        id="brand"
        name="brand"
        value={bikeData.brand}
        onChange={handleChange}
        onFocus={() => {
          if (bikeData.brand.length > 0) setShowSuggestions(true);
        }}
        onBlur={() => setShowSuggestions(false)} // 🔁 No setTimeout
        className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out sm:text-sm text-gray-700"
        placeholder="Enter or select a brand"
        required
      />

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((brand, index) => (
            <li
              key={index}
              onMouseDown={() => handleSelect(brand)} // ✅ use onMouseDown instead of onClick
              className="cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-blue-100"
            >
              {brand}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
