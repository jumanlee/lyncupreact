import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../axiom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App";

const Profile: React.FC = () => {

  interface Country {
    id: number;
    name: string;
  }

  interface ProfileData {
    user_id: number;
    firstname: string | null;
    lastname: string | null;
    aboutme: string | null;
    country_id: number | null;
    country_name: string | null;
    age: number | null;
    gender: "M" | "F" | "NA";
    organisation_id: number | null;
    organisation_name: string | null;
  }

  //actual profile data in the database
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  //data that may be submitted to change the profile data
  const [editProfileData, setEditProfileData] = useState<ProfileData | null>(
    null
  );

  const [edit, setEdit] = useState<boolean>(false);

  //dropdown menu for countries
  const [countries, setCountries] = useState<Country[]>([]);

  //for organisation search input
  const [searchQuery, setSearchQuery] = useState<string>("");
  //for showing suggested companies
  const [suggestions, setSuggestions] = useState<
    { id: number; name: string }[]
  >([]);
  //for dropdown the suggested companies
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  //to track clicks outside for closing the orgnaisation search dropdown
  const inputRef = useRef<HTMLInputElement>(null);

  //searchTimeout is for tracking typing on org search bar to prevent overwhelming backend as user types. setTimeout is a global built in function. note ReturnType<...> is a built-in typescrpit utility type that extracts the return type from any given function type. Note that setTimeout is a function! typeof means go get the type of this variable or function. This is for if the setTimeout return type ever changes (rarely, but possible in some custom environments).
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const { setIsAuthenticated } = useAuth();
  const navigate = useNavigate();
  //function to log out

  //will refactor this later
  const logout = () => {
    //remove all the tokens from browser
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    //also remove the user id
    localStorage.removeItem("user_id");
    setIsAuthenticated(false);

    navigate("/");
  };

  useEffect(() => {
    const user_id = localStorage.getItem("user_id");

    if (!user_id) {
      alert("User ID is not saved in your local storage. Please log in again!");
      logout();
      return;
    }

    //profile
    axiosInstance
      .get(`users/showprofile/${user_id}`)
      .then((response) => {
        console.log("showprofile API success!");
        setProfileData(response.data);
        setEditProfileData(response.data);
        //to protect against sending null organisation when the user doesn't intend it.
        setSearchQuery(response.data.organisation_name || "");
      })
      .catch((error) => {
        console.log(user_id)
        console.error("showprofile API failed", error);
      });

    //fetching countries list for dropdown menu
    axiosInstance
      .get("users/showallcountries/")
      .then((response) => {
        setCountries(response.data);
      })
      .catch((error) => {
        console.error("showallcountries API failed", error);
      });
  }, []);

  //get matching companies as user is typing
  const handleSearchOrgChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const query = event.target.value;
    setSearchQuery(query);

    //searchTimeout stores the id of a setTimeout that delays the organisation search API call by a specified time. If the user types again within that time, the timer is cancelled to prevent sending an outdated request
    if (searchTimeout) {
      //clearTimeout is a built-in.
      clearTimeout(searchTimeout);
    }

    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeout = setTimeout(() => {
      axiosInstance
        .get(`users/searchorg/?q=${query}`)
        .then((response) => {
          setSuggestions(response.data);
          setShowSuggestions(true);
        })
        .catch((error) => console.error("search query failed", error));
    }, 300);

    setSearchTimeout(timeout);
  };

  const handleSelectOrg = (org: { id: number; name: string }) => {
    setEditProfileData((prevEditProfileData) => {
      if (!prevEditProfileData) {
        return prevEditProfileData;
      }
      return {
        ...prevEditProfileData,
        organisation_id: org.id,
        organisation_name: org.name,
      };
    });

    //reset search query to the selected organisation name, or if none, to an empty string
    setSearchQuery(editProfileData?.organisation_name || "");
    setSuggestions([]); //hide dropdown
    setShowSuggestions(false);
  };

  //event listener to control search org clicking outside close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    //cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  //To handle field changes, fields that are not search org bar. Remember change event can be either text area(edit) or input
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    //data structure:
    // {"firstname":"Harry","lastname":"Potter","aboutme":"I'm a good person", "country":"UK","age":20,"gender":"M", organisation_id: 5, organisation_name: "Disney"}

    const { name, value } = event.target;

    setEditProfileData((prevEditProfileData) => {
      if (!prevEditProfileData) {
        return prevEditProfileData;
      }

      if (name === "age") {
        const ageInt = parseInt(value);
        return {
          ...prevEditProfileData,
          [name]: Number.isNaN(ageInt) ? null : ageInt,
        };
      }
      return {
        ...prevEditProfileData,
        [name]: value,
      };
    });
  };

  //hanlder for country dropdown, stores id and name of the country
  const handleCountryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(event.target.value, 10);
    //reminder: .find searches through an array and returns the first element that makes the provided callback return true, if no match is found, it returns undefined
    const countryObj = countries.find((c) => c.id === id);

    //cleaner style to update editProfileData, will refactor others with this new style later
    setEditProfileData((prevEditProfileData) =>
      prevEditProfileData
        ? {
            ...prevEditProfileData,
            country_id: id,
            country_name: countryObj?.name || "",
          }
        : prevEditProfileData
    );
  };

  //validation helper function to check if any field is empty
  const hasEmptyField = () => {
    if (!editProfileData) return true;

    return Object.entries(editProfileData).some(
      ([key, value]) =>
        key !== "gender" &&
        key !== "organisation_id" &&
        key !== "organisation_name" &&
        (value === null || value === undefined || value === "NA" || value == "")
    );
  };

  const handleSubmit = (event: React.FormEvent) => {
    //prevent default behaviour of reloading page after submission
    event.preventDefault();

    //check that there's no empty field, if empty
    if (hasEmptyField()) {
      alert("Please fill in all fields before submitting!");
      return;
    }

    //create a shallow clone of edit data. Partial is typescrpit utility that takes a type T and makes all its properties optional. shallow clone is cheap and only lives in this function scope, doesn't matter.
    // const payload: Partial<ProfileData> = { ...editProfileData! };

    const {
      user_id, //strip this out as it's not a field in serializer
      country_name, //strip this out as read-only at serializer
      organisation_name, // strip this out as read-only at serializer
      ...payload // { firstname, lastname, aboutme, country_id, age, gender, organisation_id }
    } = editProfileData!;

    console.log(payload);

    //Don't send {payload}, send payload as Django serializer expects the fields at the root level, not inside an "editProfileData" object!
    axiosInstance
      .put("users/updateprofile/", payload)
      .then((response) => {
        console.log("updateprofile API success!");
        setProfileData(response.data);
        setEditProfileData(response.data);
        setEdit(false);
      })
      .catch((error) => {
        console.error("updateprofile API failed", error);
      });
  };

  return (
    <div className="bg-gray-200 my-10 min-h-screen flex items-center justify-center text-gray-700">
      <div className="max-w-2xl w-full mx-4 bg-white p-8 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-800">My Profile</h2>
          {edit ? (
            <button
              onClick={() => {
                setEdit(false);
                setSearchQuery("");
              }}
              className="bg-gray-900 hover:bg-gray-800 text-gray-200 font-semibold py-2 px-4 rounded-2xl focus:outline-none"
            >
              Cancel
            </button>
          ) : (
            <button
              onClick={() => {
                setEdit(true);
                setSearchQuery("");
              }}
              className="bg-gray-900 hover:bg-gray-800 text-gray-200 font-semibold py-2 px-4 rounded-2xl focus:outline-none"
            >
              Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            {/* htmlFor is just a way to connect a label to an input */}
            <label className="block mb-1 font-semibold" htmlFor="firstname">
              First Name:{" "}
            </label>
            {edit ? (
              <input
                id="firstname"
                autoComplete="off"
                type="text"
                name="firstname"
                value={editProfileData?.firstname ?? ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
              ></input>
            ) : (
              <div className="px-2 py-1 min-h-[2rem] bg-gray-100 rounded">
                {profileData?.firstname ?? ""}
              </div>
            )}
          </div>
          <div>
            <label className="block mb-1 font-semibold" htmlFor="lastname">
              Last Name:{" "}
            </label>
            {edit ? (
              <input
                id="lastname"
                autoComplete="off"
                type="text"
                name="lastname"
                value={editProfileData?.lastname ?? ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
              ></input>
            ) : (
              <div className="px-2 py-1 min-h-[2rem] bg-gray-100 rounded">
                {profileData?.lastname ?? ""}
              </div>
            )}
          </div>
          <div>
            <label className="block mb-1 font-semibold" htmlFor="aboutme">
              About me:{" "}
            </label>
            {edit ? (
              <input
                id="aboutme"
                autoComplete="off"
                type="text"
                name="aboutme"
                value={editProfileData?.aboutme ?? ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
              ></input>
            ) : (
              <div className="px-2 py-1 min-h-[2rem] bg-gray-100 rounded">
                {profileData?.aboutme ?? ""}
              </div>
            )}
          </div>

          {/* country dropdown menu */}
          <div>
            <label className="block mb-1 font-semibold" htmlFor="country">
              Country:
            </label>
            {edit ? (
              <select
                id="country_id"
                name="country_id"
                value={editProfileData?.country_id ?? ""}
                onChange={handleCountryChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
              >
                <option value="" disabled>
                  {countries.length === 0
                    ? "Loading countries..."
                    : "Select a country"}
                </option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="px-2 py-1 min-h-[2rem] bg-gray-100 rounded">
                {profileData?.country_name ?? ""}
              </div>
            )}
          </div>

          <div>
            <label className="block mb-1 font-semibold" htmlFor="age">
              Age:{" "}
            </label>
            {edit ? (
              <input
                id="age"
                autoComplete="off"
                type="text"
                name="age"
                value={editProfileData?.age ?? ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
              ></input>
            ) : (
              <div className="px-2 py-1 min-h-[2rem] bg-gray-100 rounded">
                {profileData?.age ?? ""}
              </div>
            )}
          </div>

          <div>
            <label className="block mb-1 font-semibold" htmlFor="gender">
              Gender:{" "}
            </label>
            {edit ? (
              <select
                id="gender"
                name="gender"
                //if editProfileData is indeed null, the expression editProfileData?.gender || "" evaluates to "" <--empty string
                value={editProfileData?.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="NA">Unspecified</option>
              </select>
            ) : (
              <div className="px-2 py-1 min-h-[2rem] bg-gray-100 rounded">
                {profileData?.gender ?? ""}
              </div>
            )}
          </div>
          <div>
            <label className="block mb-1 font-semibold" htmlFor="organisation">
              Organisation (optional):{" "}
            </label>
            {edit ? (
              <div className="relative" ref={inputRef}>
                <div className="px-2 py-1 mb-2 bg-gray-100 min-h-[2rem] rounded">
                  {editProfileData?.organisation_name ?? ""}
                </div>
                <input
                  id="organisation"
                  autoComplete="off"
                  type="text"
                  name="organisation_name"
                  value={searchQuery}
                  onChange={handleSearchOrgChange}
                  placeholder="Search for a company..."
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <ul className="absolute z-10 bg-white border border-gray-300 mt-1 w-full rounded shadow-md max-h-60 overflow-y-auto">
                    {suggestions.map((org) => (
                      <li
                        key={org.id}
                        onClick={() => handleSelectOrg(org)}
                        className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                      >
                        {org.name}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="text-sm text-gray-500 mt-2">
                  If your organisation is not listed, please{" "}
                  <a
                    href="/"
                    className="font-semibold text-gray-900 hover:underline"
                  >
                    contact us
                  </a>{" "}
                  to have your organisation added.
                </div>
              </div>
            ) : (
              <div className="px-2 py-1 bg-gray-100 min-h-[2rem] rounded">
                {profileData?.organisation_name ?? ""}
              </div>
            )}
          </div>

          {edit && (
            <button
              type="submit"
              className="w-full bg-gray-900 hover:bg-gray-800 text-gray-200 font-semibold py-2 rounded-2xl disabled:opacity-50"
            >
              Submit
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;
