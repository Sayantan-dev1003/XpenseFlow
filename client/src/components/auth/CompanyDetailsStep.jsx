import React, { useEffect, useState } from 'react';
import { useRegistration } from '../../context/RegistrationContext';
import { FiMapPin, FiHome, FiGlobe, FiTrendingUp } from 'react-icons/fi';
import axios from 'axios';

const CompanyDetailsStep = () => {
  const { registrationData, updateRegistrationData } = useRegistration();
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,currencies');
      setCountries(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching countries:', error);
      setLoading(false);
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    
    if (name === 'address.country') {
      const selectedCountry = countries.find(country => 
        country.name.common === value || 
        country.name.official === value ||
        Object.values(country.name.nativeName || {}).some(
          name => name.common === value || name.official === value
        )
      );

      if (selectedCountry && selectedCountry.currencies) {
        const currencyCode = Object.keys(selectedCountry.currencies)[0];
        const currency = selectedCountry.currencies[currencyCode];
        
        updateRegistrationData({
          address: {
            ...registrationData.address,
            country: value
          },
          baseCurrency: {
            code: currencyCode,
            name: currency.name,
            symbol: currency.symbol
          }
        });
      } else {
        updateRegistrationData({
          address: {
            ...registrationData.address,
            country: value
          }
        });
      }
    } else if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      updateRegistrationData({
        address: {
          ...registrationData.address,
          [field]: value
        }
      });
    } else {
      updateRegistrationData({ [name]: value });
    }
  };

  const countryList = countries.map(country => country.name.common).sort();

  return (
    <div className="space-y-6">
      {/* Company Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiHome className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            name="companyName"
            value={registrationData.companyName}
            onChange={handleChange}
            className="pl-10 block w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-500 outline-purple-500 transition-colors duration-200"
            placeholder="Enter company name"
            required
          />
        </div>
      </div>

      {/* Address Area */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Area</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiMapPin className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            name="address.area"
            value={registrationData.address.area}
            onChange={handleChange}
            className="pl-10 block w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-500 outline-purple-500 transition-colors duration-200"
            placeholder="Enter area"
          />
        </div>
      </div>

      {/* City */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
        <input
          type="text"
          name="address.city"
          value={registrationData.address.city}
          onChange={handleChange}
          className="block w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-500 outline-purple-500 transition-colors duration-200"
          placeholder="Enter city"
          required
        />
      </div>

      {/* State/Province */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">State/Province *</label>
        <input
          type="text"
          name="address.state"
          value={registrationData.address.state}
          onChange={handleChange}
          className="block w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-500 outline-purple-500 transition-colors duration-200"
          placeholder="Enter state/province"
          required
        />
      </div>

      {/* Zip/Postal Code */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Zip/Postal Code *</label>
        <input
          type="text"
          name="address.zipCode"
          value={registrationData.address.zipCode}
          onChange={handleChange}
          className="block w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-500 outline-purple-500 transition-colors duration-200"
          placeholder="Enter zip/postal code"
          required
        />
      </div>

      {/* Country */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiGlobe className="h-5 w-5 text-gray-400" />
          </div>
          <select
            name="address.country"
            value={registrationData.address.country}
            onChange={handleChange}
            className="pl-10 block w-full py-3 px-4 border border-gray-300 bg-white rounded-lg text-gray-500 outline-purple-500 transition-colors duration-200"
            required
          >
            <option value="">Select Country</option>
            {countryList.map(country => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Industry */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Industry Type *</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiTrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <select
            name="industry"
            value={registrationData.industry}
            onChange={handleChange}
            className="pl-10 block w-full py-3 px-4 border border-gray-300 bg-white rounded-lg text-gray-500 outline-purple-500 transition-colors duration-200"
            required
          >
            <option value="">Select Industry</option>
            <option value="technology">Technology</option>
            <option value="healthcare">Healthcare</option>
            <option value="finance">Finance</option>
            <option value="retail">Retail</option>
            <option value="manufacturing">Manufacturing</option>
            <option value="education">Education</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Display Selected Currency */}
      {registrationData.baseCurrency.code && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h4 className="text-sm font-medium text-purple-700 mb-3">Selected Currency</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="text-xs text-purple-600 font-medium">Code</span>
              <p className="font-semibold text-purple-800">{registrationData.baseCurrency.code}</p>
            </div>
            <div>
              <span className="text-xs text-purple-600 font-medium">Name</span>
              <p className="font-semibold text-purple-800">{registrationData.baseCurrency.name}</p>
            </div>
            <div>
              <span className="text-xs text-purple-600 font-medium">Symbol</span>
              <p className="font-semibold text-purple-800">{registrationData.baseCurrency.symbol}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDetailsStep;